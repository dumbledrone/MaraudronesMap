import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapComponent } from './widget/map/map.component';
import { InfoComponent } from './widget/info/info.component';
import { AnomalyComponent } from './widget/anomaly/anomaly.component';
import { ControllerStatusComponent } from './widget/controller-status/controller-status.component';
import { TimeSliderComponent } from './widget/time-slider/time-slider.component';
import { FileSelectorComponent } from './widget/file-selector/file-selector.component';
import { DroneWebGuiDatabase } from './helpers/DroneWebGuiDatabase';

import { AppearenceDialogueComponent } from './helpers/appearence-dialogue/appearence-dialogue.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { DiagramComponent } from './widget/diagram/diagram.component';
import { RawDataComponent } from './widget/raw-data/raw-data.component';
import { FlightInfoComponent } from './widget/flight-info/flight-info.component';
import { FlightlogComponent } from './widget/flightlog/flightlog.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    InfoComponent,
    ControllerStatusComponent,
    TimeSliderComponent,
    FileSelectorComponent,
    AppearenceDialogueComponent,
    AnomalyComponent,
    DiagramComponent,
    RawDataComponent,
    FlightInfoComponent,
    FlightlogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule
  ],
  providers: [DroneWebGuiDatabase],
  bootstrap: [AppComponent],
  entryComponents: [AppearenceDialogueComponent]
})
export class AppModule { }
