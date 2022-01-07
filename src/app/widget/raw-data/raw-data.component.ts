import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";

const DATA_KEY = "SelectedRawDataType";

@Component({
  selector: 'app-raw-data',
  templateUrl: './raw-data.component.html',
  styleUrls: ['./raw-data.component.css']
})
export class RawDataComponent implements OnInit, DroneMapWidget {
  messageNumber = NaN;
  datFileOffset = NaN;
  pktId = 0;
  messageType = "";
  second = 0;
  showedMessageType: string = "latest";

  constructor(private globals: Globals) {
    let type = localStorage.getItem(DATA_KEY);
    if(type)
      this.showedMessageType = type;
  }

  ngOnInit(): void {
    this.globals.subscribe(this);
  }

  selectUpdated() {
    localStorage.setItem(DATA_KEY, this.showedMessageType);
    this.update();
  }

  fileChanged(): void {
    this.messageNumber = NaN;
    this.datFileOffset = NaN;
    this.messageType = "";
    this.pktId = 0;
    this.second = 0;
    let section = document.getElementById("dataSection");
    if(section === null)
      return;
    section.innerText = "";
  }

  fileListChanged(): void {
  }

  update(): void {
    this.messageNumber = NaN;
    this.datFileOffset = NaN;
    this.messageType = "";
    this.pktId = 0;
    this.second = 0;
    let mes: any;
    switch(this.showedMessageType) {
      case "gps":
        mes = this.globals.gpsMessage;
        break;
      case "control":
        mes = this.globals.controllerMessage;
        break;
      case "uSonic":
        mes = this.globals.uSonicMessage;
        break;
      case "battery":
        mes = this.globals.batteryMessage;
        break;
      case "osd":
        mes = this.globals.osdGeneralMessage;
        break;
      case "imuAtti":
        mes = this.globals.imuAttiMessage;
        break;
      case "recMag":
        mes = this.globals.recMagMessage;
        break;
      case "escData":
        mes = this.globals.escDataMessage;
        break;
      case "MotorCtrl":
        mes = this.globals.motorCtrlMessage;
        break;
      default:
      case "latest":
        mes = this.globals.latestMessage;
    }
    if(mes === undefined)
      return;
    switch (mes.pktId) {
      case 12:
        this.messageType = "OsdGeneral";
        break;
      case 16:
        this.messageType = "Ultrasonic";
        break;
      case 1000:
        this.messageType = "Controller";
        break;
      case 1710:
        this.messageType = "Battery";
        break;
      case 2048:
        this.messageType = "ImuAtti";
        break;
      case 2096:
        this.messageType = "GPS";
        this.second = mes.second;
        break;
      case 2256:
        this.messageType = "Magnetometer";
        break;
      case 10090:
        this.messageType = "EscData";
        break;
      default:
        this.messageType = "";
    }
    this.pktId = mes.pktId;
    this.messageNumber = mes.messageNum;
    this.datFileOffset = mes.offset;
    let section = document.getElementById("dataSection");
    if(section === null)
      return;
    section.innerText = "";
    Object.keys(mes).forEach(k => {
      if(k === "messageNum" || k === "offset" || k === "fileId" || k === "id" || k === "second" || section === null)
        return;
      let span = document.createElement("span");
      // @ts-ignore
      span.innerText = k + ": " + mes[k];
      section.appendChild(span);
      section.appendChild(document.createElement("br"));
    });
  }

}
