import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";
import Chart, {ChartDataset} from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import {DroneWebGuiDatabase} from "../../helpers/DroneWebGuiDatabase";

Chart.register(zoomPlugin);

const DIAGRAM_DATA_KEY = "diagramData";
const MAXIMAL_NUMBER_OF_DATASETS = 5;

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

  constructor(private globals: Globals, private dexieDbService: DroneWebGuiDatabase) { }

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
    }
  }

  drawChart(dataset: any) {
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
          }
        },
        // @ts-ignore
        tooltip: {
          callbacks: {
            label: function(context: any) {
              console.log(context)
              return "test";
            }
          }
        }
      }
    });
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
    document.getElementById("infoChart")?.style.display = this.inEditMode ? "none" : "block";
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
