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
    const chart: any = document.getElementById('infoChart');
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
        res.forEach((dataEl: any, index: number) => {
          data.push({x: index, y: dataEl[attribute]});
        });
        // @ts-ignore
        inst.dataCache[key + "-" + attribute] = {data: data, name: attributePrintName};
        attribute = attributePrintName;
        inst.constructDataset(data, callback, attribute, color);
      });
    }
    switch(database) {
      case "16":
        getDataFromDatabase(this.dexieDbService.ultrasonic, database);
        break;
      case "1000":
        getDataFromDatabase(this.dexieDbService.controller, database);
        break;
      case "1710":
        if(attribute === "cap_per")
          attributePrintName = "battery capacity";
        getDataFromDatabase(this.dexieDbService.battery, database);
        break;
      case "2096":
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
        scales: {
          y: {
            beginAtZero: true
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
        }
      }
    });
  }

  showGraphInFullscreen() {
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
    this.data.push({data: "", color: "#000000"});
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
