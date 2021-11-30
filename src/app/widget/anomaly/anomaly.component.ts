import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals, timeStringToSecs} from "../../global";
import {
  ControllerDbMessage,
  DroneWebGuiDatabase,
  GpsDbMessage,
  OsdGeneralDataDbMessage
} from "../../helpers/DroneWebGuiDatabase";
import {tick} from "@angular/core/testing";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-anomaly',
  templateUrl: './anomaly.component.html',
  styleUrls: ['./anomaly.component.css']
})
export class AnomalyComponent implements OnInit, DroneMapWidget {

  constructor(private globals: Globals, private dexieDbService: DroneWebGuiDatabase) {
    this.globals.subscribe(this);
    this._errors = [];
    //this.testData();
    this._osdGenMes = [];
    this._gpsMes = [];
    this._ctrlMes = [];
  }

  ngOnInit(): void {
  }
  private _errors: string[];
  private _osdGenMes: OsdGeneralDataDbMessage[];
  private _gpsMes: GpsDbMessage[];
  private _ctrlMes: ControllerDbMessage[];

  get errors() {
    return this._errors;
  }
  testData() {
    this._errors.push("hallo, ich bin ein Fehler");
    this._errors.push("hallo, ich bin ein Fehler");
    this._errors.push("hallo, ich bin ein Fehler");
    this._errors.push("hallo, ich bin ein Fehler");
    this._errors.push("hallo, ich bin ein Fehler");
    this._errors.push("hallo, ich bin ein Fehler");
    this._errors.push("hallo, ich bin ein Fehler");
    this._errors.push("hallo, ich bin ein Fehler");
    this._errors.push("hallo, ich bin ein Fehler");
  }

  checkFlight() {
//    this.checkTicks();
    this.checkTimeStamps();
//    this.checkRoll();
//    this.checkPitch();
//    this.checkYaw();
//    this.checkThrottle();
    if(this._errors.length === 0){
      this._errors.push("No anomlies detected.");
    }
  }

  checkTicks() {
    let tickError: boolean = false;
    this._errors.push("Ticks: there are gaps between these consecutive ticks:")
    for (let i = 0; i < this._ctrlMes.length - 1; i++) {
      if(this._ctrlMes[i].ctrl_tick !== this._ctrlMes[i+1].ctrl_tick - 1) {
        this._errors.push("tick " + this._ctrlMes[i].ctrl_tick + '\t - tick ' + this._ctrlMes[i+1].ctrl_tick);
        tickError = true;
      }
    }
    if(!tickError)
      this._errors.pop();
  }
  checkTimeStamps() {
    let timesPerSecond:number[] = new Array( timeStringToSecs(this._gpsMes[this._gpsMes.length-1].time)).fill(0);
    let timeError: boolean = false;
    let firstJump:boolean = true;
    let ignoreTheseTimesAroundJump:number[] = [-1,-1];
    this._errors.push("Time Stamps: gaps between these consecutive time stamps:")
    for (let i = 0; i < this._gpsMes.length - 1; i++) {
      let time = timeStringToSecs(this._gpsMes[i].time);
      let timeI2 = timeStringToSecs(this._gpsMes[i+1].time);
      //count how many messages there are per second
      timesPerSecond[time]++;
      //check for jumps except first one
      console.log(time + '\t' + timeI2);
      if(timeI2 - time > 1){
        if(firstJump) {
          ignoreTheseTimesAroundJump = [time, timeI2];
          firstJump = false;
          continue;
        }
        this._errors.push("time " + time + '\t - time ' + timeI2);
        timeError = true;
      }
    }
    if(!timeError)
      this._errors.pop();
    //check if always 4-6 per second (if not first or last)
    if(!firstJump && ignoreTheseTimesAroundJump[0] !== -1) {
      timesPerSecond[ignoreTheseTimesAroundJump[0]] = 5;
      timesPerSecond[ignoreTheseTimesAroundJump[1]] = 5;
    }
    timeError = false;
    this._errors.push("Time Stamps: other number than 4-6 per second:")
    timesPerSecond.forEach((second, ind)=>{
      if((second < 4 || second > 6) && second !== 0) {
        this._errors.push("time stamp "+ind + " occured "+ second + " times");
        timeError = true;
      }
    })
    if(!timeError)
      this._errors.pop();
  }
  checkRoll() {

    return true;
  }

  checkPitch() {

    return true;
  }

  checkYaw() {

    return true;
  }

  checkThrottle() {

  }

  checkFlightValidity() {
    let ct = 0;
    let inst = this;

    function onComplete() {
      ct++;
      if (ct === 3) {
        inst.checkFlight();
      }
    }
    if (!this.globals.file)//!this.globals.gpsMessage || !this.globals.file)
      return;
    this.dexieDbService.osdGeneral.where('fileId')
      .equals(this.globals.file.id).toArray().then(res => {
      this._osdGenMes = res;
      onComplete();
    });
    this.dexieDbService.gps.where('fileId')
      .equals(this.globals.file.id).toArray().then(res => {
      this._gpsMes = res;
      onComplete();
    });
    this.dexieDbService.controller.where('fileId')
      .equals(this.globals.file.id).toArray().then(res => {
      this._ctrlMes = res;
      onComplete();
    });
  }
  /*
  gpsMes:
    altitude
    longitude
    latitude
    second (seit Nullpunkt)
  controller:
    ctrl_pitch: number;
    ctrl_roll: number;
    ctrl_yaw: number;
    ctrl_thr: number;
    ctrl_tick: number;
  osdgen:
    pitch: number;
    roll: number;
    yaw_rate: number;
   */

  fileChanged(): void {
    if (this.globals.file === undefined) {  //TODO test, maybe null? to be done after file_select is todone
      this._errors = ["no file selected"];
      return;
    }
    this._errors = [];
    this.checkFlightValidity();
  }

  fileListChanged(): void {
  }

  update(): void {
  }
}



























