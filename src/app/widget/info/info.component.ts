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
  altitudeNN = 0;
  batteryPercentage = 100;
  satelliteNumber = 0;
  batteryTemp = 0;

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
    let gpsMes = this.globals.gpsMessage;
    let batMes = this.globals.batteryMessage;
    if(!gpsMes || !batMes)
      return;
    this.longitude = gpsMes.longitude;
    this.latitude = gpsMes.latitude;
    this.altitudeNN = gpsMes.altitude;
    this.batteryPercentage = batMes.cap_per;
    this.satelliteNumber = gpsMes.numGPS;
    this.batteryTemp = batMes.temp;
  }
}
