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
  ALTITUDE, BATTERY_CAP_PERCENT, BATTERY_TEMP, BATTERY_VOLT,
  DATA_DBNAME,
  FILE_DBNAME,
  LATITUDE,
  LONGITUDE, MAX_LATITUDE, MAX_LONGITUDE,
  MESSAGE_FILE_KEY, MESSAGE_ID_KEY,
  MESSAGE_MESSAGENUM_KEY, MESSAGE_PKT_ID_KEY, MESSAGE_SECOND_KEY,
  MIN_LATITUDE, MIN_LONGITUDE, NUM_GPS, PKT_1000_CONTROLLER, PKT_16_ULTRASONIC, PKT_1710_BATTERY_INFO, PKT_2096_GPS
} from "./constants";
import { AppearenceDialogueComponent } from './helpers/appearence-dialogue/appearence-dialogue.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonToggleModule} from "@angular/material/button-toggle";

const dbConfig: DBConfig  = {
  name: 'droneWebGuiDB',
  version: 1,
  objectStoresMeta: [{
    store: FILE_DBNAME,
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'fileName', keypath: 'fileName', options: { unique: true } },
      { name: 'messageCount', keypath: "", options: {unique: false} },
      { name: 'flightDuration', keypath: "", options: {unique: false}},
      { name: 'startTime', keypath: "", options: {unique: false}},
      { name: MIN_LATITUDE, keypath: "", options: {unique: false} },
      { name: MAX_LATITUDE, keypath: "", options: {unique: false} },
      { name: MIN_LONGITUDE, keypath: "", options: {unique: false} },
      { name: MAX_LONGITUDE, keypath: "", options: {unique: false} },
      { name: ALTITUDE, keypath: "", options: {unique: false} }
    ]
  }, {
    store: PKT_16_ULTRASONIC,
    storeConfig: {keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'usonic_h', keypath: "", options: {unique: false}},
      { name: 'usonic_flag', keypath: "", options: {unique: false}},
      { name: 'usonic_cnt', keypath: "", options: {unique: false}},
      { name: MESSAGE_MESSAGENUM_KEY, keypath: MESSAGE_MESSAGENUM_KEY, options: {unique: false}},
      { name: MESSAGE_FILE_KEY, keypath: MESSAGE_FILE_KEY, options: {unique: false}},
      { name: MESSAGE_PKT_ID_KEY, keypath: "", options: {unique: false}}
    ]
  }, {
    store: PKT_2096_GPS,
    storeConfig: {keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'date', keypath: "", options: {unique: false}},
      { name: 'time', keypath: "", options: {unique: false}},
      { name: 'longitude', keypath: "", options: {unique: false}},
      { name: 'latitude', keypath: "", options: {unique: false}},
      { name: 'altitude', keypath: "", options: {unique: false}},
      { name: 'velN', keypath: "", options: {unique: false}},
      { name: 'velE', keypath: "", options: {unique: false}},
      { name: 'velD', keypath: "", options: {unique: false}},
      { name: 'hdop', keypath: "", options: {unique: false}},
      { name: 'pdop', keypath: "", options: {unique: false}},
      { name: 'hacc', keypath: "", options: {unique: false}},
      { name: 'sacc', keypath: "", options: {unique: false}},
      { name: 'numGPS', keypath: "", options: {unique: false}},
      { name: 'numGLN', keypath: "", options: {unique: false}},
      { name: 'numSV', keypath: "", options: {unique: false}},
      { name: MESSAGE_MESSAGENUM_KEY, keypath: MESSAGE_MESSAGENUM_KEY, options: {unique: false}},
      { name: MESSAGE_FILE_KEY, keypath: MESSAGE_FILE_KEY, options: {unique: false}},
      { name: MESSAGE_PKT_ID_KEY, keypath: "", options: {unique: false}},
      { name: MESSAGE_ID_KEY, keypath: "", options: {unique: false}},
      { name: MESSAGE_SECOND_KEY, keypath: MESSAGE_SECOND_KEY, options: {unique: false}}
    ]
  }, {
    store: PKT_1000_CONTROLLER,
    storeConfig: {keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'ctrl_tick', keypath: "", options: {unique: false}},
      { name: 'ctrl_pitch', keypath: "", options: {unique: false}},
      { name: 'ctrl_roll', keypath: "", options: {unique: false}},
      { name: 'ctrl_yaw', keypath: "", options: {unique: false}},
      { name: 'ctrl_thr', keypath: "", options: {unique: false}},
      { name: 'ctrl_mode', keypath: "", options: {unique: false}},
      { name: 'mode_switch', keypath: "", options: {unique: false}},
      { name: 'motor_state', keypath: "", options: {unique: false}},
      { name: 'sig_level', keypath: "", options: {unique: false}},
      { name: 'ctrl_level', keypath: "", options: {unique: false}},
      { name: 'sim_model', keypath: "", options: {unique: false}},
      { name: 'max_height', keypath: "", options: {unique: false}},
      { name: 'max_radius', keypath: "", options: {unique: false}},
      { name: 'D2H_x', keypath: "", options: {unique: false}},
      { name: 'D2H_y', keypath: "", options: {unique: false}},
      { name: 'act_req_id', keypath: "", options: {unique: false}},
      { name: 'act_act_id', keypath: "", options: {unique: false}},
      { name: 'cmd_mod', keypath: "", options: {unique: false}},
      { name: 'mod_req_id', keypath: "", options: {unique: false}},
      { name: 'fw_flag', keypath: "", options: {unique: false}},
      { name: 'mot_sta', keypath: "", options: {unique: false}},
      { name: 'OH_take', keypath: "", options: {unique: false}},
      { name: 'rc_cnt', keypath: "", options: {unique: false}},
      { name: 'sup_rc', keypath: "", options: {unique: false}},
      { name: MESSAGE_MESSAGENUM_KEY, keypath: MESSAGE_MESSAGENUM_KEY, options: {unique: false}},
      { name: MESSAGE_FILE_KEY, keypath: MESSAGE_FILE_KEY, options: {unique: false}},
      { name: MESSAGE_PKT_ID_KEY, keypath: "", options: {unique: false}}
    ]
  }, {
    store: PKT_1710_BATTERY_INFO,
    storeConfig: {keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'ad_v', keypath: "", options: {unique: false}},
      { name: 'r_time', keypath: "", options: {unique: false}},
      { name: 'ave_I', keypath: "", options: {unique: false}},
      { name: 'vol_t', keypath: "", options: {unique: false}},
      { name: 'pack_ve', keypath: "", options: {unique: false}},
      { name: 'I', keypath: "", options: {unique: false}},
      { name: 'r_cap', keypath: "", options: {unique: false}},
      { name: 'cap_per', keypath: "", options: {unique: false}},
      { name: 'temp', keypath: "", options: {unique: false}},
      { name: 'right', keypath: "", options: {unique: false}},
      { name: 'l_cell', keypath: "", options: {unique: false}},
      { name: 'dyna_cnt', keypath: "", options: {unique: false}},
      { name: 'f_cap', keypath: "", options: {unique: false}},
      { name: 'out_ctl', keypath: "", options: {unique: false}},
      { name: 'out_ctl_f', keypath: "", options: {unique: false}},
      { name: MESSAGE_MESSAGENUM_KEY, keypath: MESSAGE_MESSAGENUM_KEY, options: {unique: false}},
      { name: MESSAGE_FILE_KEY, keypath: MESSAGE_FILE_KEY, options: {unique: false}},
      { name: MESSAGE_PKT_ID_KEY, keypath: "", options: {unique: false}}
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
    MatCheckboxModule,
    MatButtonToggleModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [AppearenceDialogueComponent]
})
export class AppModule { }
