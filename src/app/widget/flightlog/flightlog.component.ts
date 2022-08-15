import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";
import {DroneWebGuiDatabase, LogDbMessage} from "../../helpers/DroneWebGuiDatabase";

@Component({
  selector: 'app-flightlog',
  templateUrl: './flightlog.component.html',
  styleUrls: ['./flightlog.component.css']
})
export class FlightlogComponent implements OnInit, DroneMapWidget {
  public logEntries: FlylogMessage[] = [];

  constructor(private globals: Globals, private dexieDbService: DroneWebGuiDatabase) {
    this.globals.subscribe(this);
  }

  ngOnInit(): void {
  }

  fileChanged(): void {
    if(this.globals.file === null || this.globals.file.id === undefined)
      return;
    let inst = this;
    let logEntries: FlylogMessage[] = [];
    let running = 5;
    this.dexieDbService.flyLog.where('fileId').equals(this.globals.file.id).toArray().then(res => {
      logEntries.push(...res.map(r => FlylogMessage.fromLogDbMessage(r, 32768)));
      setTimeout(onComplete, 500);
    });
    this.dexieDbService.sdLog.where('fileId').equals(this.globals.file.id).toArray().then(res => {
      logEntries.push(...res.map(r => FlylogMessage.fromLogDbMessage(r, 65280)));
      setTimeout(onComplete, 500);
    });
    this.dexieDbService.moduleNameLog.where('fileId').equals(this.globals.file.id).toArray().then(res => {
      logEntries.push(...res.map(r => FlylogMessage.fromLogDbMessage(r, 65532)));
      setTimeout(onComplete, 500);
    });
    this.dexieDbService.recDefsLog.where('fileId').equals(this.globals.file.id).toArray().then(res => {
      logEntries.push(...res.map(r => FlylogMessage.fromLogDbMessage(r, 65533)));
      setTimeout(onComplete, 500);
    });
    this.dexieDbService.sysConfigLog.where('fileId').equals(this.globals.file.id).toArray().then(res => {
      logEntries.push(...res.map(r => FlylogMessage.fromLogDbMessage(r, 65535)));
      setTimeout(onComplete, 500);
    });
    function onComplete() {
      running--;
      if(running === 0) {
        logEntries.sort((a: LogDbMessage, b: LogDbMessage) => a.messageNum - b.messageNum);
        inst.logEntries = logEntries;
        console.log("log entries count: " + inst.logEntries.length);
      }
    }
  }

  fileListChanged(): void {
  }

  update(): void {
  }

  sendMesNumEvent(mesNum: number) {
    let evt = new CustomEvent("setTimeEvent", {detail: {messageNum: mesNum}});
    document.dispatchEvent(evt);
  }

  getLogEntryType(logEntry: FlylogMessage): string {
    switch (logEntry.type) {
      case 32768:
        return "flylog";
      case 65280:
        return "sdLog";
      case 65532:
        return "module log";
      case 65533:
        return "recDefslog";
      case 65535:
        return "sysconfig";
      default:
        return "unknown type";
    }
  }
}

class FlylogMessage extends LogDbMessage {
  type: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, text: string, type: number) {
    super(id, fileId, messageNum, offset, text);
    this.type = type;
  }

  static fromLogDbMessage(message: LogDbMessage, type: number) {
    return new FlylogMessage(message.id, message.fileId, message.messageNum, message.offset, message.text, type);
  }
}
