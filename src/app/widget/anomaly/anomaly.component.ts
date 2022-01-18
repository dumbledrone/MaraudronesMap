import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals, timeStringToSecs} from "../../global";
import {
  BatteryDbMessage,
  ControllerDbMessage,
  DroneWebGuiDatabase,
  GpsDbMessage, ImuAttiDbMessage,
  OsdGeneralDataDbMessage, RecMagDbMessage
} from "../../helpers/DroneWebGuiDatabase";
import {tick} from "@angular/core/testing";
import {first} from "rxjs/operators";
import {getOrientationFromImuAttiMessage, getOrientationFromRecMagMessage} from "../../helpers/functions";

@Component({
  selector: 'app-anomaly',
  templateUrl: './anomaly.component.html',
  styleUrls: ['./anomaly.component.css']
})
export class AnomalyComponent implements OnInit, DroneMapWidget {

  public severityVar = Severity;

  constructor(public globals: Globals, private dexieDbService: DroneWebGuiDatabase) {
    this.globals.subscribe(this);
    this._errors = [];
    this._osdGenMes = [];
    this._gpsMes = [];
    this._ctrlMes = [];
    this._imuAttiMes = [];
    this._batteryMes = [];
    this._recMagMes = [];
  }

  ngOnInit(): void {
  }
  private _errors: error[];
  private _osdGenMes: OsdGeneralDataDbMessage[];
  private _gpsMes: GpsDbMessage[];
  private _ctrlMes: ControllerDbMessage[];
  private _imuAttiMes: ImuAttiDbMessage[];
  private _batteryMes: BatteryDbMessage[];
  private _recMagMes: RecMagDbMessage[];
  private _orientations:orient[] = [];

  get errors() {
    return this._errors;
  }

  checkFlight() {
    this.prepareOrientations();
    this.checkTicks();
    //this.checkTimeStamps();
    //this.checkBattery(Severity.severe);
//    this.checkRoll();  //todo no idea how
//    this.checkPitch();  //todo no idea how
//    this.checkThrottle(); //todo no idea how
    //this.checkOrientationToCtrl(Severity.minor);
    //this.checkOrientationChange();


    let sevSev = false, sevMed = false;
    this.errors.forEach(err => {
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
      let a= (x2 >= x1-degrees_until_jump && x2 <= x1 + degrees_until_jump);
      if(!a) console.log("1 - x1: "+x1+", x2: "+x2+", ret: "+a+", degUntilJ: "+degrees_until_jump);
      return a;
    } else if (x1 > 0 && x1 <= degrees_until_jump) {
      let a = (x2 >= x1 && x2 <= x1 + degrees_until_jump) || (x2 >= 360 - (degrees_until_jump - x1) && x2 <= 360) || (x2 > 0 && x2 <= x1)
      if(!a) console.log("2 - x1: "+x1+", x2: "+x2+", ret: "+a+", degUntilJ: "+degrees_until_jump);
      return a;
    } else if (x1 > (360-degrees_until_jump) && x1 <= 360) {
      let a = (x2 >= x1 - degrees_until_jump && x2 <= x1) || (x2 > 0 && x2 <= (x1 + degrees_until_jump - 360)) || (x2 > x1 && x2 <= 360);
      if(!a) console.log("3 - x1: "+x1+", x2: "+x2+", ret: "+a+", degUntilJ: "+degrees_until_jump);
      return a;
    } else
      console.log("error - anomaly.component.ts - checkOrientationPair: this should not be reachable.")
    return false
  }

  //north: 0°, east 90° (end of scale), west -90°, south -180°, south to east: [-180°,-270°[
  //computed to positive values: North: 270, west 180, south 90, east 360
  //yaw input: [-10000,10000]
  checkOrientationToCtrl(severity: Severity) {  //new object with interface or type
    let orientationError = false;
    this._errors.push({text:"orientation in respect to controller:", mesNum:-1, severity:severity, headline: true});
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
        console.log("anomaly - checkOrientation: couldn't find an earlier or a later orientation.")
        return;
      }
      let correct = false;
      for (let i = 0; i < after.length; i++) {
        if(this.checkTurn(mes.ctrl_yaw, before.degree, after[i].degree))
          correct = true;
      }
      if(!correct) {
        orientationError = true;
        this._errors.push({text:"Controller: " + mes.ctrl_yaw + ", drone does not react accordingly.", mesNum:mes.messageNum, severity:severity, headline: false})
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
        this.errors.push({text:this._batteryMes[i].cap_per + '\% - ' + this._batteryMes[i+1].cap_per + "%", mesNum:this._batteryMes[i].messageNum, severity:severity, headline: false});
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
  helperSortAndUniquify(it:number[], log:boolean) {
    it.sort(function (a,b){
      if(a<b) return -1;
      if(a>b) return 1;
      return 0;
    });
    let ret = [it[0]];
    for (let i = 1; i < it.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
      if (it[i]<-269 || it[i] > 89) {
        ret.push(it[i]);
      }
    }
    if(log) {
      ret.forEach(retty => {
        console.log(retty);
      })
    }
    return ret;
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
    for (let i = 0; i < this._gpsMes.length - 1; i++) {
      let time = timeStringToSecs(this._gpsMes[i].time);
      let timeI2 = timeStringToSecs(this._gpsMes[i+1].time);
      //count how many messages there are per second
      timesPerSecond[time].times++;
      if(timesPerSecond[time].firstMesNum === -1)
        timesPerSecond[time].firstMesNum = this._gpsMes[i].messageNum;
      //check for jumps except first one
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
    timeError = false;
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
  checkRoll(severity: Severity) {
    this._ctrlMes.forEach(mes =>{ //TODO what infos do we want?
      let osdMes:OsdGeneralDataDbMessage | undefined;
      for (let i = 0; i < this._osdGenMes.length; i++) {
        if(this._osdGenMes[i].messageNum > mes.messageNum) {
          osdMes = this._osdGenMes[i];
          break;
        }
      }
      if(osdMes === undefined)
        return;//TODO
//      console.log("ctrl: " + mes.ctrl_roll + ", " +osdMes.roll + " :osdMes")
    })
  }

  checkPitch(severity: Severity) {

  }

  checkYaw(severity: Severity) {

  }

  checkThrottle(severity: Severity) {
    this._ctrlMes.forEach(mes => { //TODO what infos do we want?
      let osdMes: GpsDbMessage | undefined;
      for (let i = 0; i < this._gpsMes.length; i++) {
        if (this._gpsMes[i].messageNum > mes.messageNum) {
          osdMes = this._gpsMes[i];
          break;
        }
      }
      if (osdMes === undefined)
        return;//TODO
//      console.log("ctrl: " + mes.ctrl_thr + ", " +osdMes.altitude + " :osdMes")
    })
  }

  checkFlightValidity() {
    let ct = 0;
    let inst = this;

    function onComplete() {
      ct++;
      if (ct === 6) {
        inst.checkFlight();
      }
    }
    if (!this.globals.file)
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
    this.dexieDbService.imuAtti.where('fileId')
      .equals(this.globals.file.id).toArray().then(res => {
        this._imuAttiMes = res;
        onComplete();
      });
    this.dexieDbService.battery.where('fileId')
      .equals(this.globals.file.id).toArray().then(res => {
      this._batteryMes = res;
      onComplete();
    });
    this.dexieDbService.recMag.where('fileId')
      .equals(this.globals.file.id).toArray().then(res => {
      this._recMagMes = res;
      onComplete();
    });
  }

  fileChanged(): void {
    if (this.globals.file === null) {
      this._errors = [{text:"no file selected", mesNum:-1, severity:Severity.severe, headline: true}];
      return;
    }
    this._errors = [];
    this.checkFlightValidity();
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
interface orient{
  degree: number;
  mesNum: number;
}
interface error{
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























