import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit, DroneMapWidget {
  longitude = 0;
  latitude = 0;
  altitude = 0;
  batteryPercentage = 100;
  satelliteNumber = 0;
  batteryTemp = 0;
  batteryVoltage = 0;

  constructor(private globals: Globals) {
    this.globals.subscribe(this);
  }

  ngOnInit(): void {
  }

  fileChanged(): void {
  }

  fileListChanged(): void {
  }

  update(): void {
    let mes = this.globals.message;
    this.longitude = mes.longitude;
    this.latitude = mes.latitude;
    this.altitude = mes.altitude;
    this.batteryPercentage = mes.batCapPerc;
    this.satelliteNumber = mes.numGPS;
    this.batteryTemp = mes.batTemp;
    this.batteryVoltage = mes.batVolt;
  }
}
