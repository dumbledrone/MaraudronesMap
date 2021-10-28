import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, DroneMapWidget {
  longitude: number = 0;
  latitude: number = 0;

  constructor(private globals: Globals) {
    this.globals.subscribe(this);
  }

  ngOnInit(): void {
  }

  fileChanged(): void {// TODO reset map
  }

  fileListChanged(): void { }

  update(): void {
    let message = this.globals.message;
    this.longitude = message.longitude;
    this.latitude = message.latitude;
  }


}
