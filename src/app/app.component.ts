import {Component, NgModule, OnInit} from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {AppearenceDialogueComponent} from "./helpers/appearence-dialogue/appearence-dialogue.component";
import {DroneMapWidget, Globals, LineType} from "./global";
import {global} from "@angular/compiler/src/util";
import {AnomalyComponent} from "./widget/anomaly/anomaly.component";
import {DroneWebGuiDatabase} from "./helpers/DroneWebGuiDatabase";

const NUMBER_OF_WIDGETS = 6;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'drone-web-gui';
  _mapType!: number;
  _showLoadingSpinner = false;
  private _localStorageValues : boolean[];

  constructor(private dialog:MatDialog, private globals: Globals) {
    let inst = this;
    this._localStorageValues=[];
    globals.loadCallback = () => {inst._showLoadingSpinner = true};
    globals.finishLoadingCallback = () => {inst._showLoadingSpinner = false};
  }

  ngOnInit(): void {
    this.mapType = 1;
    this.getLocalStorageValues();
    this.updateInfoView();
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      id: 1,
      test: this._localStorageValues,
      mapType: this._mapType,
      lineType: this.globals.lineType,
      anomalyLevel: this.globals.anomalyLevel,
    }
    const dialogRef = this.dialog.open(AppearenceDialogueComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      if(data === undefined) // -> button "close" used
        return;
      for (let i = 0; i < NUMBER_OF_WIDGETS; i++) {    //#checkboxNumber
        localStorage.setItem("checkbox" + i, data["checkbox"+i] ? "true": "false");
        this._localStorageValues[i] = data["checkbox"+i];
      }
      localStorage.setItem("mapView", String(data.selectedMap));
      localStorage.setItem("lineColor", String(data.selectedColor));
      localStorage.setItem("anomalyLevel", String(data.selectedAnomalyLevel));
      this.updateInfoView();
    });
  }

  updateInfoView() {
    //#checkboxNumber
    //@ts-ignore
    document.getElementById("infos0")?.style.display = this._localStorageValues[0] ? "block" : "none";
    //@ts-ignore
    document.getElementById("infos1")?.style.display = this._localStorageValues[1] ? "block" : "none";
    //@ts-ignore
    document.getElementById("infos3")?.style.display = this._localStorageValues[3] ? "block" : "none";
    //@ts-ignore
    document.getElementById("infos4")?.style.display = this._localStorageValues[4] ? "block" : "none";
    //@ts-ignore
    document.getElementById("infos5")?.style.display = this._localStorageValues[5] ? "block" : "none";
    let tmp = localStorage.getItem("mapView");
    this.mapType = tmp===null? 1 : parseInt(tmp);
    tmp = localStorage.getItem("lineColor");
    this.globals.lineType = tmp===null? 0 : parseInt(tmp);
    tmp = localStorage.getItem("anomalyLevel");
    this.globals.anomalyLevel = tmp===null? 0 : parseInt(tmp);
    //@ts-ignore
    document.getElementById("infos2")?.style.display = this.globals.anomalyLevel === -1 ? "none" : "block";
  }

  getLocalStorageValues() {
    let i = 0;
    for (;i < NUMBER_OF_WIDGETS; i++) {     //#checkboxNumber i < number of checkboxes
      let tmp = localStorage.getItem("checkbox" + i);
      this._localStorageValues[i] = tmp === null ? true : tmp === "true";
    }
    let tmp = localStorage.getItem("mapView");
    this.mapType = tmp===null? 1 : parseInt(tmp);
    if(isNaN(this.mapType)) {
      this.mapType = 1;
      localStorage.setItem("mapView", String(1));
    }
    tmp = localStorage.getItem("lineColor");
    this.globals.lineType = tmp===null? 0 : parseInt(tmp);
    if(isNaN(this.globals.lineType)) {
      this.globals.lineType = 0;
      localStorage.setItem("lineColor", String(0));
    }
    tmp = localStorage.getItem("anomalyLevel");
    this.globals.anomalyLevel = tmp===null? 0 : parseInt(tmp);
    if(isNaN(this.globals.anomalyLevel)) {
      this.globals.anomalyLevel = 0;
      localStorage.setItem("anomalyLevel", String(0));
    }
  }

  get mapType() {
    return this._mapType;
  }

  set mapType(val: number) {
    this._mapType = val;
  }

}
