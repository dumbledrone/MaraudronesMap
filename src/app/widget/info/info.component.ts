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
  relative_height = 0;
  uSonic_height = 0;
  uSonic_valid = false;
  _fileAltitude = 0;
  vSpeed = 0;
  hSpeed = 0;

  constructor(private globals: Globals) {
    this.globals.subscribe(this);
  }

  ngOnInit(): void {
  }

  fileChanged(): void {
    if(this.globals.file)
      this._fileAltitude = this.globals.file.altitude;
  }

  fileListChanged(): void {
  }

  update(): void {
    this.longitude = 0;
    this.latitude = 0;
    this.altitudeNN = 0;
    this.batteryPercentage = 100;
    this.satelliteNumber = 0;
    this.batteryTemp = 0;
    this.relative_height = 0;
    this.uSonic_height = 0;
    this.uSonic_valid = false;
    let gpsMes = this.globals.gpsMessage;
    let batMes = this.globals.batteryMessage;
    let usMes = this.globals.uSonicMessage;
    let osMes = this.globals.osdGeneralMessage;
    if(gpsMes) {
      this.longitude = gpsMes.longitude;
      this.latitude = gpsMes.latitude;
      this.altitudeNN = gpsMes.altitude;
      this.satelliteNumber = gpsMes.numGPS;
      this.vSpeed = -gpsMes.velD;
      this.hSpeed = Math.sqrt(Math.pow(gpsMes.velN, 2) + Math.pow(gpsMes.velE, 2));
    } else {
      this.longitude = 0;
      this.latitude = 0;
      this.altitudeNN = 0;
      this.satelliteNumber = 0;
      this.vSpeed = -0;
      this.hSpeed = 0;
    }
    if(batMes) {
      this.batteryPercentage = batMes.cap_per;
      this.batteryTemp = batMes.temp;
    } else {
      this.batteryPercentage = 0;
      this.batteryTemp = 0;
    }
    if(usMes) {
      this.uSonic_height = usMes.usonic_h;
      this.uSonic_valid = usMes.usonic_flag === 1;
    } else {
      this.uSonic_height = 0;
      this.uSonic_valid = false;
    }
    if(osMes) {
      this.relative_height = osMes.relative_height;
    } else {
      this.relative_height = 0;
    }
  }
}
