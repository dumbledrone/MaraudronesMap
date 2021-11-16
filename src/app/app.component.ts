import {Component, NgModule, OnInit} from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {AppearenceDialogueComponent} from "./helpers/appearence-dialogue/appearence-dialogue.component";
import {Globals} from "./global";

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

  constructor(private dialog:MatDialog, globals: Globals) {
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

  openDialog() {  //TODO select openstreetmap in advance
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      id: 1,
      test: this._localStorageValues,
      mapType: this._mapType
    }
    const dialogRef = this.dialog.open(AppearenceDialogueComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      for (let i = 0; i < 2; i++) {    //#checkboxNumber
        localStorage.setItem("checkbox" + i, data["checkbox"+i] ? "true": "false");
        this._localStorageValues[i] = data["checkbox"+i];
      }
      localStorage.setItem("mapView", String(data.selectedMap));
      this.updateInfoView();
    });
  }

  updateInfoView() {
    //#checkboxNumber
    //@ts-ignore
    document.getElementById("infos0")?.style.display = this._localStorageValues[0] ? "block" : "none";
    //@ts-ignore
    document.getElementById("infos1")?.style.display = this._localStorageValues[1] ? "block" : "none";
    let tmp = localStorage.getItem("mapView");
    this.mapType = tmp===null? 1 : parseInt(tmp);
  }

  getLocalStorageValues() {
    let i = 0;
    for (;i < 2; i++) {     //#checkboxNumber i < number of checkboxes
      let tmp = localStorage.getItem("checkbox" + i);
      this._localStorageValues[i] = tmp === null ? true : tmp === "true";
    }
    let tmp = localStorage.getItem("mapView");
    this.mapType = tmp===null? 1 : parseInt(tmp);
    if(isNaN(this.mapType)) {
      this.mapType = 1;
      localStorage.setItem("mapView", String(1));
    }
  }

  get mapType() {
    return this._mapType;
  }

  set mapType(val: number) {
    this._mapType = val;
  }
}
