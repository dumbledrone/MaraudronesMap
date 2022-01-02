import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup} from "@angular/forms";
import {AppComponent} from "../../app.component";
//import * as events from "events";

@Component({
  selector: 'app-appearence-dialogue',
  templateUrl: './appearence-dialogue.component.html',
  styleUrls: ['./appearence-dialogue.component.css']
})
export class AppearenceDialogueComponent implements OnInit {

  form: FormGroup;
  checkboxValues: boolean[];
  mapViews: MapView[];
  lineColors: LineColor[];
  _selectedMap!:string;
  _selectedColor!:string;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<AppearenceDialogueComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this._selectedMap = String(data.mapType);
    this._selectedColor = String(data.lineType);
    this.checkboxValues = [];
    for (let i = 0; i < data.test.length; i++) {
      this.checkboxValues[i] = data.test[i];
    }

    this.form = this.fb.group({
      //#checkboxNumber
      checkbox0: this.checkboxValues[0],
      checkbox1: this.checkboxValues[1],
      checkbox2: this.checkboxValues[2],
      checkbox3: this.checkboxValues[3],
      checkbox4: this.checkboxValues[4],
      checkbox5: this.checkboxValues[5],
    });
    this.mapViews = [
      {value: '1', viewValue: 'Open Street Map'},
      {value: '2', viewValue: 'Google Street Map'},
      {value: '3', viewValue: 'Google Hybrid Map'},
      {value: '4', viewValue: 'Google Satellite Map'},
      {value: '5', viewValue: 'Google Terrain Map'},
    ];
    this.lineColors = [
      {value: '0', viewValue: 'no coloring'},
      {value: '1', viewValue: 'course of time'},
      {value: '2', viewValue: 'altitude'},
      {value: '3', viewValue: 'horizontal speed'},
    ];
  }

  ngOnInit(): void {}

  save(): void {
    this.form.value.selectedMap = +this.selectedMap;
    this.form.value.selectedColor = +this.selectedColor;
    this.dialogRef.close(this.form.value)
  }

  close(): void {
    this.dialogRef.close();
  }
  get selectedMap() {
    return this._selectedMap;
  }
  get selectedColor() {
    return this._selectedColor;
  }
}



interface MapView {
  value: string;
  viewValue: string;
}
interface LineColor {
  value: string;
  viewValue: string;
}
