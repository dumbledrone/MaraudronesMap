import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";

const STEP_KEY = "stepSize";
const STEP_SPEED_KEY = "stepSpeed";
const USE_SECONDS_KEY = "useSeconds";

@Component({
  selector: 'app-time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.css']
})
export class TimeSliderComponent implements OnInit, DroneMapWidget {
  flightDurationSeconds: number = 0;
  flightMessagesNumber: number = 0;
  _gpsOffset: number = 0;
  _currentTime: number = 0;
  _step: number = 1;
  _stepSpeed: number = 1;
  play: boolean = false;
  _useSeconds = true;
  _sliderMax: number = 0;
  _offset = 0;

  constructor(protected globals: Globals) {
    this.globals.subscribe(this);
    let step = localStorage.getItem(STEP_KEY);
    if(step)
      this.step = parseInt(step);
    let stepSpeed = localStorage.getItem(STEP_SPEED_KEY);
    if(stepSpeed)
      this.stepSpeed = parseFloat(stepSpeed);
    let useSeconds = localStorage.getItem(USE_SECONDS_KEY);
    if(useSeconds)
      this.useSeconds = (useSeconds === 'true');
  }

  ngOnInit(): void {
  }

  update(): void {
  }

  fileChanged(): void {
    if(this.globals.file) {
      this.flightDurationSeconds = this.globals.file.fileDuration;
      this.flightMessagesNumber = this.globals.file.messageCount;
      this._gpsOffset = this.globals.file.gpsOffset;
    } else {
      this.flightDurationSeconds = 0;
      this.flightMessagesNumber = 0;
      this._gpsOffset = 0;
    }
    this.currentTime = this._gpsOffset;
    this.updateSlider();
  }
  fileListChanged(): void { }

  get currentTime(): number {
    return this._currentTime - this._offset;
  }

  set currentTime(val: number) {
    if(this._useSeconds && val > this.flightDurationSeconds -1)
      val = this.flightDurationSeconds - 1;
    else if (!this._useSeconds && val > this.flightMessagesNumber - 1)
      val = this.flightMessagesNumber - 1;
    if (val < 0)
      val = 0;
    this._currentTime = val;
    if(this._useSeconds)
      this.globals.loadMessagesBySecond(this._currentTime);
    else
      this.globals.loadMessagesById(this._currentTime);
  }

  get useSeconds(): boolean {
    return this._useSeconds;
  }

  set useSeconds(val: boolean) {
    this._useSeconds = val;
    localStorage.setItem(USE_SECONDS_KEY, val.toString());
    this.updateSlider();
    // TODO get secs from message num / get messagenum from secs
  }

  get step() {
    return this._step;
  }

  set step(step) {
    this._step = parseFloat(String(step));
    localStorage.setItem(STEP_KEY, String(step));
  }

  get stepSpeed() {
    return this._stepSpeed;
  }

  set stepSpeed(stepSpeed) {
    this._stepSpeed = parseFloat(String(stepSpeed));
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
    if (this._currentTime < this._sliderMax - 1) {
      this.currentTime += this._step;
    }
  }

  jumpToEnd() {
    this.currentTime = this.flightDurationSeconds - 1;
  }

  playButtonClicked(event: any) {
    this.play = !this.play;
    this.updateButtonText();
    if(this.play)
      this.simulateFlight();
    console.log("play value: " + this.play)
  }

  simulateFlight() {
    if(!this.play || this._currentTime >= this._sliderMax - 1) {
      this.play = false;
      this.updateButtonText();
      return;
    }
    setTimeout(() => {
      this.nextStep();
      this.simulateFlight();
    }, this._stepSpeed * 1000)
  }

  updateButtonText() {
    // @ts-ignore
    document.getElementById("startButton")?.innerText = this.play ? "stop" : "start";
  }

  updateSlider() {
    this.currentTime = this._currentTime;
    if(this._useSeconds) {
      this._sliderMax = this.flightDurationSeconds;
    } else
      this._sliderMax = this.flightMessagesNumber;
  }

  floor(val: number, digits: number) {
    let floored = Math.floor(val);
    if(floored < 10)
      return '0'+floored;
    return floored;
  }
}
