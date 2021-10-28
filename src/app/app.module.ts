import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapComponent } from './widget/map/map.component';
import { InfoComponent } from './widget/info/info.component';
import { ControllerStatusComponent } from './widget/controller-status/controller-status.component';
import { TimeSliderComponent } from './widget/time-slider/time-slider.component';
import { FileSelectorComponent } from './widget/file-selector/file-selector.component';

import {DBConfig, NgxIndexedDBModule} from 'ngx-indexed-db';
import {
  DATA_DBNAME,
  FILE_DBNAME,
  LATITUDE,
  LONGITUDE, MAX_LATITUDE, MAX_LONGITUDE,
  MESSAGE_FILE_KEY,
  MESSAGE_MESSAGENUM_KEY,
  MIN_LATITUDE, MIN_LONGITUDE
} from "./constants";
import { AppearenceDialogueComponent } from './helpers/appearence-dialogue/appearence-dialogue.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";

const dbConfig: DBConfig  = {
  name: 'droneWebGuiDB',
  version: 1,
  objectStoresMeta: [{
    store: FILE_DBNAME,
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'fileName', keypath: 'fileName', options: { unique: true } },
      { name: 'messageCount', keypath: "messageCount", options: {unique: false} },
      { name: LONGITUDE, keypath: "", options: {unique: false} },
      { name: LATITUDE, keypath: "", options: {unique: false} },
      { name: MIN_LATITUDE, keypath: "", options: {unique: false} },
      { name: MAX_LATITUDE, keypath: "", options: {unique: false} },
      { name: MIN_LONGITUDE, keypath: "", options: {unique: false} },
      { name: MAX_LONGITUDE, keypath: "", options: {unique: false} }

    ]
  }, {
    store: DATA_DBNAME,
    storeConfig: {keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: MESSAGE_MESSAGENUM_KEY, keypath: MESSAGE_MESSAGENUM_KEY, options: {unique: false}},
      { name: MESSAGE_FILE_KEY, keypath: MESSAGE_FILE_KEY, options: {unique: false}}
    ]
  }]
};

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    InfoComponent,
    ControllerStatusComponent,
    TimeSliderComponent,
    FileSelectorComponent,
    AppearenceDialogueComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [AppearenceDialogueComponent]
})
export class AppModule { }
