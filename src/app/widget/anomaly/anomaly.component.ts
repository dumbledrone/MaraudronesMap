import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals, timeStringToSecs} from "../../global";
import {
  BatteryDbMessage,
  ControllerDbMessage,
  DroneWebGuiDatabase,
  GpsDbMessage, ImuAttiDbMessage, MotorCtrlDbMessage,
  OsdGeneralDataDbMessage, RecMagDbMessage
} from "../../helpers/DroneWebGuiDatabase";
import {getOrientationFromRecMagMessage} from "../../helpers/functions";

@Component({
  selector: 'app-anomaly',
  templateUrl: './anomaly.component.html',
  styleUrls: ['./anomaly.component.css']
})
export class AnomalyComponent implements OnInit, DroneMapWidget {

  public severityVar = Severity;

  constructor(public globals: Globals) {
    this.globals.subscribe(this);
    this._errors = [{text:"no file selected", mesNum:-1, severity:Severity.severe, headline: true}];
  }

  ngOnInit(): void {
  }
  private _errors: error[];

  get errors() {
    return this._errors;
  }

  fileChanged(): void {
    if (this.globals.file === null) {
      this._errors = [{text:"no file selected", mesNum:-1, severity:Severity.severe, headline: true}];
      return;
    }
    this._errors = this.globals.file.errors;
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

export class AnomalyAnalyzer {
  private _errors: error[];
  private _gpsMes: GpsDbMessage[];
  private _ctrlMes: ControllerDbMessage[];
  private _batteryMes: BatteryDbMessage[];
  private _recMagMes: RecMagDbMessage[];
  private _orientations:orient[] = [];
  private _motorCtrlMes:MotorCtrlDbMessage[];

  constructor(private globals: Globals, private dexieDbService: DroneWebGuiDatabase, private fileId: number) {
    this._errors = [];
    this._gpsMes = [];
    this._ctrlMes = [];
    this._batteryMes = [];
    this._recMagMes = [];
    this._motorCtrlMes = [];
  }

  async checkFlight(cb: any) {
    console.log("anomaly check startet at " + new Date())
    this.prepareOrientations();
    document.dispatchEvent(new CustomEvent("spinnerInfoMessage", {detail: {text: "Analyzing anomalies: Checking Ticks"}}));
    await new Promise<void>(done => setTimeout(() => {this.checkTicks(); done();}, 500));
    document.dispatchEvent(new CustomEvent("spinnerInfoMessage", {detail: {text: "Analyzing anomalies: Checking Timestamps"}}));
    await new Promise<void>(done => setTimeout(() => {this.checkTimeStamps(); done();}, 500));
    document.dispatchEvent(new CustomEvent("spinnerInfoMessage", {detail: {text: "Analyzing anomalies: Checking battery data"}}));
    await new Promise<void>(done => setTimeout(() => {this.checkBattery(Severity.severe); done();}, 500));
    document.dispatchEvent(new CustomEvent("spinnerInfoMessage", {detail: {text: "Analyzing anomalies: Throttle"}}));
    await new Promise<void>(done => setTimeout(() => {this.checkThrottle(); done();}, 500));
    document.dispatchEvent(new CustomEvent("spinnerInfoMessage", {detail: {text: "Analyzing anomalies: Checking orientation"}}));
    await new Promise<void>(done => setTimeout(() => {this.checkOrientationToCtrl(Severity.minor); done();}, 500));
    document.dispatchEvent(new CustomEvent("spinnerInfoMessage", {detail: {text: "Analyzing anomalies: Checking orientation changes"}}));
    await new Promise<void>(done => setTimeout(() => {this.checkOrientationChange(); done();}, 500));
    document.dispatchEvent(new CustomEvent("spinnerInfoMessage", {detail: {text: "Analyzing anomalies: Rotor speed"}}));
    await new Promise<void>(done => setTimeout(() => {this.checkRotorSpeed(); done();}, 500));

    let sevSev = false, sevMed = false;
    this._errors.forEach(err => {
      if (err.severity === Severity.severe)
        sevSev = true;
      if(err.severity === Severity.medium)
        sevMed = true;
      if(sevSev && sevMed)
        return;
    })
    if(this._errors.length === 0){
      this._errors.push({text:"No anomalies detected.", mesNum:-1, severity: Severity.severe, headline: true});
    } else if (this.globals.anomalyLevel === Severity.severe && !sevSev)
      this._errors.push({text:"No severe anomalies detected.", mesNum:-1, severity: Severity.severe, headline: true})
    else if (this.globals.anomalyLevel == Severity.medium && !sevSev && !sevMed)
      this._errors.push({text:"No medium or severe anomalies detected.", mesNum:-1, severity: Severity.severe, headline: true})
    console.log("anomaly check finished at " + new Date());
    cb(this._errors);
  }

  prepareOrientations() {
    this._orientations = [];
    this._recMagMes.forEach(mes =>{
      this._orientations.push({degree: getOrientationFromRecMagMessage(mes)+270, mesNum: mes.messageNum});
    })
  }
  //360° exists, 0° not
  checkOrientationChange() {
    let errSev, errMed, errMin = false;
    this._errors.push({text:"change of orientation too big:", mesNum:-1, severity:Severity.severe, headline: true});
    let indHealine = this._errors.length - 1;
    for (let i = 0; i < this._orientations.length - 1; i++) {
      if(!this.checkOrientationPair(this._orientations[i].degree, this._orientations[i+1].degree, 100)) {
        this._errors.push({text:"orientation jumps from " + this._orientations[i].degree + " to " + this._orientations[i+1].degree, mesNum:this._orientations[i].mesNum, severity:Severity.severe, headline: false});
        errSev = true;
      } else if(!this.checkOrientationPair(this._orientations[i].degree, this._orientations[i+1].degree, 50)) {
        this._errors.push({text:"orientation jumps from " + this._orientations[i].degree + " to " + this._orientations[i+1].degree, mesNum:this._orientations[i].mesNum, severity:Severity.medium, headline: false});
        errMed = true;
      } else if(!this.checkOrientationPair(this._orientations[i].degree, this._orientations[i+1].degree, 15)) {
        this._errors.push({text:"orientation jumps from " + this._orientations[i].degree + " to " + this._orientations[i+1].degree, mesNum:this._orientations[i].mesNum, severity:Severity.minor, headline: false});
        errMin = true;
      }
    }
    if(errSev)
      this._errors[indHealine].severity = Severity.severe;
    else if(errMed)
      this._errors[indHealine].severity = Severity.medium;
    else if(errMin)
      this._errors[indHealine].severity = Severity.minor;
    else
      this._errors.pop();

  }
  checkOrientationPair(x1:number, x2: number, degrees_until_jump: number){
    if (x1 > degrees_until_jump && x1 <= (360-degrees_until_jump)){
      return (x2 >= x1-degrees_until_jump && x2 <= x1 + degrees_until_jump);
    } else if (x1 > 0 && x1 <= degrees_until_jump) {
      return (x2 >= x1 && x2 <= x1 + degrees_until_jump) || (x2 >= 360 - (degrees_until_jump - x1) && x2 <= 360) || (x2 > 0 && x2 <= x1)
    } else if (x1 > (360-degrees_until_jump) && x1 <= 360) {
      return (x2 >= x1 - degrees_until_jump && x2 <= x1) || (x2 > 0 && x2 <= (x1 + degrees_until_jump - 360)) || (x2 > x1 && x2 <= 360);
    } else
      console.log("error - anomaly.component.ts - checkOrientationPair: this should not be reachable.")
    return false
  }

  //north: 0°, east 90° (end of scale), west -90°, south -180°, south to east: [-180°,-270°[
  //computed to positive values: North: 270, west 180, south 90, east 360
  //yaw input: [-10000,10000]
  checkOrientationToCtrl(severity: Severity) {
    let orientationError = false;
    this._errors.push({text:"orientation in respect to controller input:", mesNum:-1, severity:severity, headline: true});
    this._ctrlMes.forEach(mes => {
      //look for last msg before and the five ahead
      let before: orient | undefined;
      let after: orient[] = [];
      for (let i = 0; i < this._orientations.length; i++) {
        if(this._orientations[i].mesNum < mes.messageNum)
          before = this._orientations[i];
        else
          after.push(this._orientations[i]);
        if (after.length >= 40)
          break;
      }
      if(before === undefined || after[0] === undefined) {
        return;
      }
      let correct = false;
      for (let i = 0; i < after.length; i++) {
        if(this.checkTurn(mes.ctrl_yaw, before.degree, after[i].degree))
          correct = true;
      }
      if(!correct) {
        orientationError = true;
        this._errors.push({text:"Controller (yaw): " + mes.ctrl_yaw + ", drone does not turn accordingly.", mesNum:mes.messageNum, severity:severity, headline: false})
      }
    })
    if(!orientationError)
      this._errors.pop();
  }

  /**
   * checks if the turn made is in the right direction
   * @param direction: 0 none, <2000 right, <-2000 left
   * @param angleA: angle startpoint
   * @param angleB: angle endpoint
   */
  checkTurn(direction: number, angleA: number, angleB: number) {
    if(direction === undefined) {
      console.log("anomaly.components - checkTurn: wrong number given for direction.")
      return false;
    }
    if(angleA < 0 || angleA > 360 || angleB < 0 || angleB > 360) {
      console.log("anomaly.components - checkTurn: wrong number given for an angle.")
      return false;
    }
    if (direction > 2000) { //right turn
      if (angleA > 0 && angleA <= 181){
        return (angleB > angleA && angleB < 180 + angleA);
      } else if (angleA > 181 && angleA <= 360) {
        return (angleB > angleA && angleB <= 360) || (angleB > 0 && angleB < angleA-180);
      }
    } else if (direction < -2000) { //left turn
      if (angleA >= 180 && angleA <= 360){
        return (angleB > angleA-180 && angleB < angleA);
      } else if (angleA > 0 && angleA < 180) {
        return (angleB > 0 && angleB < angleA) || (angleB > angleA + 180 && angleB <= 360);
      }
    }
    return true;
  }

  checkBattery(severity: Severity) {
    let batError: boolean = false;
    let batGoesUp:error[] = [];
    let firstDataFound = false;
    this._errors.push({text:"Battery: there is a gap between these percentages:", mesNum:-1, severity:severity, headline: true})
    for (let i = 0; i < this._batteryMes.length - 1; i++) {
      if(!firstDataFound && this._batteryMes[i].cap_per === 0)
        continue;
      else
        firstDataFound = true;
      if(this._batteryMes[i].cap_per < this._batteryMes[i+1].cap_per) {
        batGoesUp.push({text:this._batteryMes[i].cap_per + '\% - ' + this._batteryMes[i+1].cap_per + "%", mesNum:this._batteryMes[i].messageNum, severity:severity, headline: false});
      }
      if(Math.abs(this._batteryMes[i+1].cap_per - this._batteryMes[i].cap_per) > 1) {
        this._errors.push({text:this._batteryMes[i].cap_per + '\% - ' + this._batteryMes[i+1].cap_per + "%", mesNum:this._batteryMes[i].messageNum, severity:severity, headline: false});
        batError = true;
      }
    }
    if(!batError)
      this._errors.pop();
    if(batGoesUp.length !== 0) {
      this._errors.push({text:"Battery: the battery capacity is increasing between these percentages:", mesNum:-1, severity:severity, headline: true})
      this._errors = this._errors.concat(batGoesUp);
    }
  }

  checkTicks() {//severity: minor <=5, medium <=10, severe all above
    let tickError: boolean = false;
    let index = this._errors.push({text:"Ticks: there are gaps between these consecutive ticks:", mesNum:-1, severity:Severity.severe, headline: true}) - 1;
    let sevLevel:Severity = Severity.minor;
    for (let i = 0; i < this._ctrlMes.length - 1; i++) {
      if(this._ctrlMes[i].ctrl_tick !== this._ctrlMes[i+1].ctrl_tick - 1) {
        let severity = Severity.severe;
        if (Math.abs(this._ctrlMes[i + 1].ctrl_tick - this._ctrlMes[i].ctrl_tick) <= 5) {
          severity = Severity.minor;
        } else if (Math.abs(this._ctrlMes[i + 1].ctrl_tick - this._ctrlMes[i].ctrl_tick) <= 10) {
          severity = Severity.medium;
          if(sevLevel !== Severity.severe)
            sevLevel = Severity.medium;
        } else {
          sevLevel = Severity.severe;
        }
        this._errors.push({text:"tick " + this._ctrlMes[i].ctrl_tick + '\t - tick ' + this._ctrlMes[i+1].ctrl_tick, mesNum:this._ctrlMes[i].messageNum, severity:severity, headline:false});
        tickError = true;
      }
    }
    this._errors[index].severity = sevLevel;
    if(!tickError)
      this._errors.pop();
  }
  checkTimeStamps() {
    let severityGaps = Severity.severe, severity4 = Severity.minor, severity6 = Severity.medium;
    let timesPerSecond: timesPerSec[] = [];
    for (let i = 0; i <= timeStringToSecs(this._gpsMes[this._gpsMes.length-1].time); i++) {
      timesPerSecond.push({times: 0, firstMesNum: -1});
    }
    let timeError: boolean = false;
    let firstJump:boolean = true;
    let ignoreTheseTimesAroundJump:number[] = [-1,-1];
    this._errors.push({text:"Time Stamps: gaps between these consecutive time stamps:", mesNum:-1, severity:severityGaps, headline: true})
    for (let i = 0; i < this._gpsMes.length; i++) {
      let time = timeStringToSecs(this._gpsMes[i].time);
      //count how many messages there are per second
      timesPerSecond[time].times++;
      if(timesPerSecond[time].firstMesNum === -1)
        timesPerSecond[time].firstMesNum = this._gpsMes[i].messageNum;
      if(i === this._gpsMes.length - 1)
        break;
      //check for jumps except first one
      let timeI2 = timeStringToSecs(this._gpsMes[i+1].time);
      if(timeI2 - time > 1){
        if(firstJump) {
          ignoreTheseTimesAroundJump = [time, timeI2];
          firstJump = false;
          continue;
        }
        this._errors.push({text:"time " + time + '\t - time ' + timeI2, mesNum:this._gpsMes[i].messageNum, severity:severityGaps, headline: false});
        timeError = true;
      }
    }
    if(!timeError)
      this._errors.pop();
    //check if always 4-6 per second (if not first or last)
    if(!firstJump && ignoreTheseTimesAroundJump[0] !== -1) {
      timesPerSecond[ignoreTheseTimesAroundJump[0]].times = 5;
      timesPerSecond[ignoreTheseTimesAroundJump[1]].times = 5;
    }
    this._errors.push({text:"Time Stamps: other number than 4-6 per second:", mesNum:-1, severity:severity6, headline: true})
    let indHeadline = this._errors.length - 1;
    let sev4used: boolean = false;
    let sev6used: boolean = false;
    timesPerSecond.forEach((second, ind)=>{
      if(second.times < 4 && second.times !== 0) {
        this._errors.push({text:"time stamp "+ind + " occurred "+ second.times + " times", mesNum:second.firstMesNum, severity: severity4, headline: false});
        sev4used = true;
      } else if (second.times > 6 && second.times !== 0) {
        this._errors.push({text:"time stamp "+ind + " occurred "+ second.times + " times", mesNum:second.firstMesNum, severity: severity6, headline: false});
        sev6used = true;
      }
    })
    if(!sev4used && !sev6used)
      this._errors.pop();
    else if(!sev4used) {
      this._errors[indHeadline].severity = severity6;
    } else if (!sev6used) {
      this._errors[indHeadline].severity = severity4;
    } else {
      this._errors[indHeadline].severity = Math.min(severity4,severity6);
    }
  }


  checkRotorSpeed() {
    this._errors.push({text: "At least one rotor stopped working while motor is on", mesNum: -1, severity: Severity.severe, headline: true});
    let errorExists: boolean = false;
    this._motorCtrlMes.forEach(mes => {
      let controllerMes = this.search(mes.messageNum, this._ctrlMes);
      let pwms:number[] = [];
      if(mes.pwm1 === 0)
        pwms.push(1);
      if(mes.pwm2 === 0)
        pwms.push(2);
      if(mes.pwm3 === 0)
        pwms.push(3);
      if(mes.pwm4 === 0)
        pwms.push(4);
      if(pwms.length === 1 && controllerMes?.mot_sta !==0) {
        this._errors.push({text: "Rotor " + pwms[0] + " stopped", mesNum: mes.messageNum, severity: Severity.severe, headline: false})
        errorExists = true;
      } else if(pwms.length > 0 && controllerMes?.mot_sta !== 0) {
        let tmpString: string = "Rotors " + pwms[0]
        for(let i = 1; i < pwms.length; i++) {
          if(i < pwms.length - 1)
            tmpString = tmpString + ", " + pwms[i];
          else
            tmpString = tmpString + " and "+ pwms[i];
        }
        tmpString = tmpString + " stopped"
        this._errors.push({text: tmpString, mesNum: mes.messageNum, severity: Severity.severe, headline: false})
        errorExists = true;
      }
    })
    if(!errorExists)
      this._errors.pop();
  }

  checkThrottle() {
    //check if controller says throttle up if rotors gain speed (all rotors)
    let throttleError = false;
    this._errors.push({text:"rotor speed in respect to controller input:", mesNum:-1, severity:Severity.minor, headline: true});
    this._ctrlMes.forEach(mes => {
      if(mes.ctrl_thr > -2000 && mes.ctrl_thr < 2000)  // little change -> rotor speeds will still vary to stand against wind etc.
        return;
      //look for last msg before and the 100 ahead
      let before: MotorCtrlDbMessage | undefined;
      let after: MotorCtrlDbMessage[] = [];
      for (let i = 0; i < this._motorCtrlMes.length; i++) {
        if(this._motorCtrlMes[i].messageNum < mes.messageNum)
          before = this._motorCtrlMes[i];
        else
          after.push(this._motorCtrlMes[i]);
        if (after.length >= 100)
          break;
      }
      if(before === undefined || after[0] === undefined) {
        return;
      }
      let correct :number = mes.ctrl_thr > 0 ? 1 : -1;
      for (let i = 0; i < after.length; i++) {
        let tmp: number = this.checkThrot(mes.ctrl_thr, before, after[i]);
        if(tmp === 0)
          correct = tmp;
      }
      if(correct !== 0) {
        throttleError = true;
        let acc: string = correct > 0 ? "accelerate" : "decelerate"
        this._errors.push({text:"Controller (throttle): " + mes.ctrl_thr + ", rotors do not "+acc+ ".", mesNum:mes.messageNum, severity:Severity.minor, headline: false})
      }
    })
    if(!throttleError)
      this._errors.pop();
  }
  checkThrot(throttle: number, before: MotorCtrlDbMessage, after: MotorCtrlDbMessage): number{
    if (throttle > 2000) { //go up
      let num: number = 0;
      if(before.pwm1 < after.pwm1)
        num++;
      if(before.pwm2 < after.pwm2)
        num++;
      if(before.pwm3 < after.pwm3)
        num++;
      if(before.pwm4 < after.pwm4)
        num++;
      if(num < 2) return 1;
    } else if (throttle < -2000) { //go down
      let num: number = 0;
      if(before.pwm1 > after.pwm1)
        num++;
      if(before.pwm2 > after.pwm2)
        num++;
      if(before.pwm3 > after.pwm3)
        num++;
      if(before.pwm4 > after.pwm4)
        num++;
      if(num < 2)
        return -1;
    }
    return 0;
  }

  async  getFlightErrors(cb: any) {
    let ct = 0;
    let inst = this;
    document.dispatchEvent(new CustomEvent("spinnerInfoMessage", {detail: {text: "Analyzing anomalies: preparing Data"}}));

    function onComplete() {
      ct++;
      if (ct === 5) {
        inst.checkFlight(cb);
      }
    }
    if (!this.fileId)
      return;
    this.dexieDbService.gps.where('fileId')
      .equals(this.fileId).toArray().then(res => {
      this._gpsMes = res;
      onComplete();
    });
    this.dexieDbService.controller.where('fileId')
      .equals(this.fileId).toArray().then(res => {
      this._ctrlMes = res;
      onComplete();
    });
    this.dexieDbService.battery.where('fileId')
      .equals(this.fileId).toArray().then(res => {
      this._batteryMes = res;
      onComplete();
    });
    this.dexieDbService.recMag.where('fileId')
      .equals(this.fileId).toArray().then(res => {
      this._recMagMes = res;
      onComplete();
    });
    this.dexieDbService.motorCtrl.where('fileId')
      .equals(this.fileId).toArray().then(res => {
      this._motorCtrlMes = res;
      onComplete();
    });
  }
  search(value: number, a: ControllerDbMessage[]): ControllerDbMessage {
    if(value < a[0].messageNum) {
      return a[0];
    }
    if(value > a[a.length-1].messageNum) {
      return a[a.length-1];
    }
    let lo:number = 0;
    let hi:number = a.length - 1;
    while (lo <= hi) {
      let mid:number = Math.round((hi + lo) / 2);
      if (value < a[mid].messageNum) {
        hi = mid - 1;
      } else if (value > a[mid].messageNum) {
        lo = mid + 1;
      } else {
        return a[mid];
    }
  }
  // lo == hi + 1
  return (a[lo].messageNum - value) < (value - a[hi].messageNum) ? a[lo] : a[hi];
  }
}

interface orient{
  degree: number;
  mesNum: number;
}
export interface error{
  text: string;
  mesNum: number;
  severity: Severity;
  headline: boolean;
}
export enum Severity {
  severe,
  medium,
  minor
}
interface timesPerSec {
  times: number;
  firstMesNum: number;
}
interface throt{
  throttle: number;
  mesNum: number;
}























