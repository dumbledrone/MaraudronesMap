import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";
import Chart, {ChartDataset} from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import {DbInfo, DroneWebGuiDatabase} from "../../helpers/DroneWebGuiDatabase";

Chart.register(zoomPlugin);
Chart.register(annotationPlugin);

const DIAGRAM_DATA_KEY = "diagramData";
const MAXIMAL_NUMBER_OF_DATASETS = 5;
const SHOW_ALL_DATA_KEY = "showAllData";

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.css']
})
export class DiagramComponent implements OnInit, DroneMapWidget {
  private myChart: any;
  inEditMode = false;
  data: any[] = [];
  dataCache: any[] = [];
  cacheFileId: number = -1;
  availableDBs: DbInfo[] = [];
  showAllData: boolean = false;

  constructor(private globals: Globals, private dexieDbService: DroneWebGuiDatabase) {
    this.availableDBs = dexieDbService.getAvailableDatabases();
    this.showAllData = localStorage.getItem(SHOW_ALL_DATA_KEY) === "true";
  }

  ngOnInit(): void {
    this.globals.subscribe(this);
    this.data = JSON.parse(<string>localStorage.getItem(DIAGRAM_DATA_KEY));
    if(!this.data) {
      this.data = [];
      localStorage.setItem(DIAGRAM_DATA_KEY, JSON.stringify(this.data));
    }
    this.prepareChartData().then();
  }

  fileChanged(): void {
    if(this.globals.file?.id !== this.cacheFileId) {
      this.cacheFileId = this.globals.file?.id ? this.globals.file?.id : -1;
      this.dataCache = [];
    }
    this.prepareChartData().then();
  }

  fileListChanged(): void {
  }

  update(): void {
    if(!this.myChart)
      return;
    if(!this.globals.latestMessage)
      return;
    this.updateCurrentMessageNum(this.globals.latestMessage.messageNum);
  }

  saveShowDataState() {
    localStorage.setItem(SHOW_ALL_DATA_KEY, this.showAllData.toString());
  }

  async prepareChartData() {
    if(this.myChart)
      this.myChart.destroy();
    if(!this.globals.file)
      return;
    let inst = this;
    let dataset: any[] = [];
    let running = 0;
    function complete(data: any) {
      dataset.push(data);
      running--;
      if(running === 0)
        inst.drawChart(dataset);
    }
    for (let i = 0; i < this.data.length; i++) {
      if(this.data[i].data === "" || !this.data[i].displayed)
        continue;
      running++;
      let identifiers = this.data[i].data.split("-");
      if(this.dataCache[this.data[i].data]) {
        inst.constructDataset(this.dataCache[this.data[i].data].data, complete,
          this.dataCache[this.data[i].data].name, this.data[i].color);
      } else {
        this.createDataset(identifiers[0], identifiers[1], this.data[i].color, complete);
      }
    }
  }

  constructDataset(dataArr: any[], callback: any, attribute: string, color: string) {
    callback({
      label: attribute,
      data: dataArr,
      fill: false,
      borderColor: color,
      tension: 0.01
    });
  }

  createDataset(database: string, attribute: string, color: string, callback: any) {
    let inst = this;
    let attributePrintName = attribute;
    function getDataFromDatabase(database: any, key: string) {
      database.where("fileId").equals(inst.globals.file?.id).toArray().then((res: any) => {
        let data: any[] = [];
        res.forEach((dataEl: any) => {
          data.push({x: dataEl.messageNum, y: dataEl[attribute]});
        });
        // @ts-ignore
        inst.dataCache[key + "-" + attribute] = {data: data, name: attributePrintName};
        attribute = attributePrintName;
        inst.constructDataset(data, callback, attribute, color);
      });
    }
    function getSpecialFromDatabase(database: any, key: string) {
      database.where("fileId").equals(inst.globals.file?.id).toArray().then((res: any) => {
        let data: any[] = [];
        switch (key) {
          case "speed":
            res.forEach((dataEl: any) => {
              data.push({
                x: dataEl.messageNum,
                y: Math.sqrt(Math.pow(dataEl.velN, 2) + Math.pow(dataEl.velE, 2) + Math.pow(dataEl.velD, 2))
              });
            });
            break;
          case "verticalSpeed":
            res.forEach((dataEl: any) => {
              data.push({
                x: dataEl.messageNum,
                y: dataEl.velD
              });
            });
            break;
          case "horizontalSpeed":
            res.forEach((dataEl: any) => {
              data.push({
                x: dataEl.messageNum,
                y: Math.sqrt(Math.pow(dataEl.velN, 2) + Math.pow(dataEl.velE, 2))
              });
            });
            break;
          case "D2H":
            res.forEach((dataEl: any) => {
              data.push({
                x: dataEl.messageNum,
                y: Math.sqrt(Math.pow(dataEl.D2H_x, 2) + Math.pow(dataEl.D2H_y, 2))
              });
            });
            break;
          default:
            res.forEach((dataEl: any) => {
              data.push({
                x: dataEl.messageNum, y: dataEl[key]
              });
            });
            break;
        }
        // @ts-ignore
        inst.dataCache[key + "-" + attribute] = {data: data, name: attributePrintName};
        attribute = attributePrintName;
        inst.constructDataset(data, callback, attribute, color);
      });
    }
    switch(database) {
      case "16":
        if(attribute === "usonic_h")
          attributePrintName = "height ultrasonic sensor (mm)";
        getDataFromDatabase(this.dexieDbService.ultrasonic, database);
        break;
      case "1000":
        if(attribute === "D2H_x")
          attributePrintName = "Distance to Home (x; in m)";
        if(attribute === "D2H_y")
          attributePrintName = "Distance to Home (y; in m)";
        getDataFromDatabase(this.dexieDbService.controller, database);
        break;
      case "1710":
        if(attribute === "cap_per")
          attributePrintName = "battery capacity (%)";
        else if (attribute === "temp")
          attributePrintName = "temp (°C)";
        getDataFromDatabase(this.dexieDbService.battery, database);
        break;
      case "2096":
        if(attribute === "altitude")
          attributePrintName = "altitude (m)";
        getDataFromDatabase(this.dexieDbService.gps, database);
        break;
      case "12":
        getDataFromDatabase(this.dexieDbService.osdGeneral, database);
        break;
      case "1700":
        getDataFromDatabase(this.dexieDbService.rcDebug, database);
        break;
      case "2048":
        getDataFromDatabase(this.dexieDbService.imuAtti, database);
        break;
      case "2256":
        getDataFromDatabase(this.dexieDbService.recMag, database);
        break;
      case "10090":
        getDataFromDatabase(this.dexieDbService.escData, database);
        break;
      case "1307":
        getDataFromDatabase(this.dexieDbService.motorCtrl, database);
        break;
      case "speed":
        attributePrintName = "speed (m/s)";
        getSpecialFromDatabase(this.dexieDbService.gps, database);
        break;
      case "verticalSpeed":
        attributePrintName = "vertical speed (m/s)";
        getSpecialFromDatabase(this.dexieDbService.gps, database);
        break;
      case "horizontalSpeed":
        attributePrintName = "horizontal speed (m/s)";
        getSpecialFromDatabase(this.dexieDbService.gps, database);
        break;
      case "distance":
        attributePrintName = "distance (m)";
        getSpecialFromDatabase(this.dexieDbService.gps, database);
        break;
      case "D2H":
        attributePrintName = "Distance to Home (m)";
        getSpecialFromDatabase(this.dexieDbService.controller, database);
        break;
      default:
        getDataFromDatabase(this.dexieDbService.getDatabaseForPackageId(database), database);
        break;
    }
  }

  drawChart(dataset: any) {
    let inst = this;
    let mesNum = 0;
    if(this.globals.latestMessage)
      mesNum = this.globals.latestMessage.messageNum;
    const chart: any = document.getElementById('infoChart');
    this.myChart = new Chart(chart, {
      type: 'scatter',
      data: {
        datasets: dataset
      },
      options: {
        showLine: true,
        spanGaps: true,
        animation: false,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            ticks: {
              display: false
            }
          }
        },
        layout: {
          padding: {
            right: 0
          }
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            },
            pan: {
              enabled: true,
              mode: 'xy',
              threshold: 10
            },
          },
          annotation: {
            drawTime: 'afterDatasetsDraw',
            annotations: [{
              type: 'line',
              id: 'vline',
              // @ts-ignore
              mode: 'vertical',
              scaleID: 'x',
              value: mesNum,
              borderColor: 'darkblue',
              borderWidth: 2,
              /*label: {
                enabled: true,
                position: "center",
                content: amount[index]
              }*/
            }]
          }
        },
        // @ts-ignore
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return "test";
            }
          }
        }
      }
    });
    let lastX = 0;
    let lastY = 0;
    chart.addEventListener("mousedown", function (event: any) {
      lastX = event.screenX;
      lastY = event.screenY;
    });
    chart.addEventListener("mouseup", function (event: any) {
      if(Math.abs(lastX - event.screenX) + Math.abs(lastY - event.screenY) > 2)
        return;
      let xTop = inst.myChart.chartArea.left;
      let xBottom = inst.myChart.chartArea.right;
      let xMin = inst.myChart.scales['x'].min;
      let xMax = inst.myChart.scales['x'].max;
      let newX = 0;

      if (event.offsetX <= xBottom && event.offsetX >= xTop) {
        newX = Math.abs((event.offsetX - xTop) / (xBottom - xTop));
        newX = Math.floor(newX * (Math.abs(xMax - xMin)) + xMin);
      }
      let evt = new CustomEvent("setTimeEvent", {detail: {messageNum: newX}});
      document.dispatchEvent(evt);
    });
  }

  updateCurrentMessageNum(mesNum: number) {
    this.myChart.config.options.plugins.annotation.annotations[0].value = mesNum; // set the Value
    this.myChart.update(); // and update the chart.
  }

  showGraphInFullscreen() {
    if(this.inEditMode)
      this.toggleGraphSettings()
    document.getElementById("infoChartBgDiv")?.classList.add("full-screen");
  }

  collapseGraph() {
    document.getElementById("infoChartBgDiv")?.classList.remove("full-screen");
  }

  toggleGraphSettings() {
    this.inEditMode = !this.inEditMode;
    if(!this.inEditMode) {
      this.dataArrUpdated();
      this.prepareChartData().then();
    }
    // @ts-ignore
    document.getElementById("infoChartContainer")?.style.display = this.inEditMode ? "none" : "block";
    // @ts-ignore
    document.getElementById("settingsDiv")?.style.display = this.inEditMode ? "block" : "none";
  }

  addEntry() {
    if(this.data.length >= MAXIMAL_NUMBER_OF_DATASETS)
      return;
    this.data.push({data: "", color: "#000000", displayed: true});
  }

  removeEntry(index: number) {
    this.data.splice(index, 1);
  }

  dataArrUpdated() {
    localStorage.setItem(DIAGRAM_DATA_KEY, JSON.stringify(this.data));
  }

  resetZoom() {
    this.myChart.resetZoom();
  }
}
