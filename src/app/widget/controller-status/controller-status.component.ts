import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";

@Component({
  selector: 'app-controller-status',
  templateUrl: './controller-status.component.html',
  styleUrls: ['./controller-status.component.css']
})
export class ControllerStatusComponent implements OnInit, DroneMapWidget {
  readonly canvas_width:number = 400;
  readonly canvas_height: number = this.canvas_width/2;
  readonly middle_left: number = 0.25*this.canvas_width;
  readonly middle_right: number = 0.75*this.canvas_width;
  readonly middle_height: number = 0.5*this.canvas_height;
  readonly radius: number = 0.375*this.canvas_height;
  private _ctrl_pitch: number = this.middle_height;// -10000 up to 10000 //left: up, down
  private _ctrl_roll: number = this.middle_left; //left: left, right
  private _ctrl_yaw: number = this.middle_right;  //right: left, right
  private _ctrl_thr: number = this.middle_height;  //right: up, down
  private pitchMaxVal: number = 10000;
  private rollMaxVal: number = 10000;
  private yawMaxVal: number = 10000;
  private thrMaxVal: number = 10000;


  set ctrl_pitch(newPitch: number) {
    newPitch /= this.pitchMaxVal/this.radius;
    newPitch = -newPitch;
    this._ctrl_pitch = newPitch + this.middle_height;
  }
  set ctrl_roll(newRoll: number) {
    newRoll /= this.rollMaxVal/this.radius;
    this._ctrl_roll = newRoll + this.middle_left;
  }
  set ctrl_yaw(newYaw: number) {
    newYaw /= this.yawMaxVal/this.radius;
    this._ctrl_yaw = newYaw + this.middle_right;
  }
  set ctrl_thr(newThr: number) {
    newThr /= this.thrMaxVal/this.radius;
    newThr = -newThr;
    this._ctrl_thr = newThr + this.middle_height;
  }

  constructor(private globals: Globals) {
    this.globals.subscribe(this);
  }

  ngOnInit(): void {
    this.drawCanvas();
  }

  drawCanvas() {
    let c: any = document.getElementById("controllerCanvas");
    if (!c)
      return;
    let ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);

    //left rectangle
    ctx.beginPath();
    ctx.lineWidth=1;
    ctx.rect(this.middle_left-this.radius, this.middle_height-this.radius,this.radius*2, this.radius*2);
    ctx.stroke();

    //right rectangle
    ctx.beginPath();
    ctx.rect(this.middle_right-this.radius, this.middle_height-this.radius,this.radius*2, this.radius*2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.middle_left,this.middle_height,3,0,2*Math.PI);
    ctx.strokeStyle = '#0000ff';
    ctx.fillStyle = '#0000ff';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.middle_right,this.middle_height,3,0,2*Math.PI);
    ctx.strokeStyle = '#0000ff';
    ctx.fillStyle = '#0000ff';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.middle_left, this.middle_height);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#0000ff';
    ctx.lineCap = 'round';
    ctx.lineTo(this._ctrl_roll, this._ctrl_pitch);
    ctx.stroke();

    ctx.moveTo(this.middle_right, this.middle_height);
    ctx.lineTo(this._ctrl_yaw, this._ctrl_thr);
    ctx.stroke();

    ctx.beginPath();
    ctx.font = "15px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("roll", this.middle_left, this.middle_height + this.radius + 18);

    ctx.beginPath();
    ctx.font = "15px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("yaw", this.middle_right, this.middle_height + this.radius + 18);

    //ctx.translate(this.canvas_width, this.canvas_height);
    ctx.rotate(Math.PI / 2);

    ctx.beginPath();
    ctx.font = "15px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("pitch", this.middle_left, -8);

    ctx.beginPath();
    ctx.font = "15px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("throttle", this.middle_left, 19 - this.canvas_width);
  }

  update(): void {
    let ctlMes = this.globals.controllerMessage;
    if(!ctlMes)
      return;
    this.ctrl_thr = ctlMes.ctrl_thr;
    this.ctrl_roll = ctlMes.ctrl_roll;
    this.ctrl_yaw = ctlMes.ctrl_yaw;
    this.ctrl_pitch = ctlMes.ctrl_pitch;
    this.drawCanvas();
  }

  fileChanged(): void {
    if(!this.globals.file) {
      this.pitchMaxVal = 10000;
      this.rollMaxVal = 10000;
      this.yawMaxVal = 10000;
      this.thrMaxVal = 10000;
      this.ctrl_thr = 0;
      this.ctrl_roll = 0;
      this.ctrl_yaw = 0;
      this.ctrl_pitch = 0;
      this.drawCanvas();
    } else {
      switch(this.globals.file.productType) {
        case 17:
          this.pitchMaxVal = 32727;
          this.rollMaxVal = 16256;
          this.yawMaxVal = 32727;
          this.thrMaxVal = 16256;
          break;
        case 27:
        default:
          this.pitchMaxVal = 10000;
          this.rollMaxVal = 10000;
          this.yawMaxVal = 10000;
          this.thrMaxVal = 10000;
      }
    }
  }

  fileListChanged(): void {
  }
}
