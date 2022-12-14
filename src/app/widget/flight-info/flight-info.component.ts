import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, DroneType, Globals} from "../../global";

@Component({
  selector: 'app-flight-info',
  templateUrl: './flight-info.component.html',
  styleUrls: ['./flight-info.component.css']
})
export class FlightInfoComponent implements OnInit, DroneMapWidget {
  public flightDate: string = "-";
  public flightStartTime: string = "-";
  public flightDuration: string = "-";
  public timeOffset: number = 0;
  public timeUntilGPS: number = 0;
  public timeUntilTakeOff: number = 0;
  public productType: number = -1;

  constructor(private globals: Globals) {
    this.globals.subscribe(this);
  }

  ngOnInit(): void {
  }

  fileChanged(): void {
    let file = this.globals.file;
    if(file) {
      this.flightDate = file.flightDate;
      this.flightStartTime = file.flightStartTime;
      let frac = file.flightDuration % 60;
      this.flightDuration = Math.floor(file.flightDuration / 60) + ":" + (frac < 10 ? "0" + frac : frac);
      this.timeOffset = file.timeOffset;
      this.timeUntilGPS = file.timeUntilGPS;
      this.timeUntilTakeOff = file.timeUntilTakeOff;
      this.productType = file.productType;
    } else {
      this.flightDate = "-";
      this.flightStartTime = "-";
      this.flightDuration = "-";
      this.timeOffset = 0;
      this.timeUntilGPS = 0;
      this.timeUntilTakeOff = 0;
      this.productType = -1;
    }
  }

  fileListChanged(): void {
  }

  update(): void {
  }

  getProductNameString(productType: number): string {
    switch(productType) {
      case -1:
        return "-";
      case DroneType.Inspire_2:
        return "Inspire 2 - only partial support, data might be invalid";
      case DroneType.Matrice_600:
        return "Matrice 600 - only partial support, data might be invalid";
      case DroneType.Phantom_4_Advanced:
        return "Phantom 4 Advanced";
      default:
        console.log("unknown device type: " + productType);
        return "This device is not recognized. Shown data might be invalid!"
    }
  }
}
