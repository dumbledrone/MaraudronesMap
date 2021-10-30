import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";

const STEP_KEY = "stepSize";
const STEP_SPEED_KEY = "stepSpeed";

@Component({
  selector: 'app-time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.css']
})
export class TimeSliderComponent implements OnInit, DroneMapWidget {
  flightDuration: number = 0;
  _currentTime: number = 0;
  _step: number = 1;
  _stepSpeed: number = 1;
  play: boolean = false;

  constructor(protected globals: Globals) {
    this.globals.subscribe(this);
    let step = localStorage.getItem(STEP_KEY);
    if(step)
      this.step = parseInt(step);
    let stepSpeed = localStorage.getItem(STEP_SPEED_KEY);
    if(stepSpeed)
      this.stepSpeed = parseInt(stepSpeed);
  }

  ngOnInit(): void {
  }

  update(): void {
    this.flightDuration = this.globals.flightDuration;
    console.log(this.flightDuration);
  }

  fileChanged(): void {
    this.currentTime = 0;
  }
  fileListChanged(): void { }

  get currentTime(): number {
    return this._currentTime;
  }

  set currentTime(val: number) {
    if(val > this.flightDuration -1)
      val = this.flightDuration - 1;
    if (val < 0)
      val = 0;
    this._currentTime = val;
    this.globals.loadMessage(this._currentTime);
  }

  get step() {
    return this._step;
  }

  set step(step) {
    this._step = parseInt(String(step));
    localStorage.setItem(STEP_KEY, String(step));
  }

  get stepSpeed() {
    return this._stepSpeed;
  }

  set stepSpeed(stepSpeed) {
    this._stepSpeed = parseInt(String(stepSpeed));
    localStorage.setItem(STEP_SPEED_KEY, String(stepSpeed));
  }

  timeSliderChanged(event: any): void {
    let val = parseInt(event.target.value);
    if(val !== this.currentTime) {
      this.currentTime = val;
    }
  }

  jumpToStart() {
    this.currentTime = 0;
  }

  previousStep() {
    if (this.currentTime > 0) {
      this.currentTime -= this._step;
    }
  }

  nextStep() {
    if (this.currentTime < this.flightDuration - 1) {
      this.currentTime += this._step;
    }
  }

  jumpToEnd() {
    this.currentTime = this.flightDuration - 1;
  }

  playButtonClicked(event: any) {
    this.play = !this.play;
    // @ts-ignore
    document.getElementById("startButton")?.innerText = this.play ? "stop" : "start";
    if(this.play)
      this.simulateFlight();
    console.log("play value: " + this.play)
  }

  simulateFlight() {
    if(!this.play || this.currentTime === this.flightDuration - 1)
      return;
    setTimeout(() => {
      this.nextStep();
      this.simulateFlight();
    }, this._stepSpeed * 1000)
  }
}
