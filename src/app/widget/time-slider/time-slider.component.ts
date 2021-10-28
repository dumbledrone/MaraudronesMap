import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";

@Component({
  selector: 'app-time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.css']
})
export class TimeSliderComponent implements OnInit, DroneMapWidget {
  flightDuration: number = 0;
  _currentTime: number = 0;

  constructor(protected globals: Globals) {
    this.globals.subscribe(this);
  }

  ngOnInit(): void {
  }

  update(): void {
    this.flightDuration = this.globals.flightDuration;
    console.log(this.flightDuration);
  }

  fileChanged(): void {
    this.currentTime = 0;
    this.update();
  }
  fileListChanged(): void { }

  get currentTime(): number {
    return this._currentTime;
  }

  set currentTime(val: number) {
    this._currentTime = val;
    this.globals.loadMessage(this._currentTime);
  }

  timeSliderChanged(event: any): void {
    let val = parseInt(event.target.value);
    if(val !== this.currentTime) {
      this.currentTime = val;
    }
  }

}
