import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";
import {DroneWebGuiDatabase, LogDbMessage} from "../../helpers/DroneWebGuiDatabase";

@Component({
  selector: 'app-flightlog',
  templateUrl: './flightlog.component.html',
  styleUrls: ['./flightlog.component.css']
})
export class FlightlogComponent implements OnInit, DroneMapWidget {
  public logEntries: LogDbMessage[] = [];

  constructor(private globals: Globals, private dexieDbService: DroneWebGuiDatabase) {
    this.globals.subscribe(this);
  }

  ngOnInit(): void {
  }

  fileChanged(): void {
    if(this.globals.file === null || this.globals.file.id === undefined)
      return;
    let inst = this;
    inst.logEntries = [];
    let running = 5;
    this.dexieDbService.flyLog.where('fileId').equals(this.globals.file.id).toArray().then(res => {
      inst.logEntries.push(...res);
      onComplete();
    });
    this.dexieDbService.sdLog.where('fileId').equals(this.globals.file.id).toArray().then(res => {
      inst.logEntries.push(...res);
      onComplete();
    });
    this.dexieDbService.moduleNameLog.where('fileId').equals(this.globals.file.id).toArray().then(res => {
      inst.logEntries.push(...res);
      onComplete();
    });
    this.dexieDbService.recDefsLog.where('fileId').equals(this.globals.file.id).toArray().then(res => {
      inst.logEntries.push(...res);
      onComplete();
    });
    this.dexieDbService.sysConfigLog.where('fileId').equals(this.globals.file.id).toArray().then(res => {
      inst.logEntries.push(...res);
      onComplete();
    });
    function onComplete() {
      running--;
      if(running === 0) {
        inst.logEntries.sort((a: LogDbMessage, b: LogDbMessage) => a.messageNum - b.messageNum);
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
}
