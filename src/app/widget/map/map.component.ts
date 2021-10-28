import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";
import * as L from "leaflet";
import {control} from "leaflet";
import zoom = control.zoom;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, DroneMapWidget {

  longitude: number = 0;
  latitude: number = 0;

  myMap!: L.Map;
  marker!: L.Marker;

  constructor(private globals: Globals) {
    this.globals.subscribe(this);
  }

  ngOnInit(): void {
    this.myMap = L.map('map').setView([49.57384629202841, 11.02728355453469], 20);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
      tileSize: 512,
      zoomOffset: -1
    }).addTo(this.myMap);
    this.marker = L.marker([49.57384629202841, 11.02728355453469]).addTo(this.myMap);
  }

  fileChanged(): void {// TODO reset map
    let file = this.globals.file;
    this.myMap.flyToBounds(L.latLngBounds(L.latLng(file.minLatitude, file.minLongitude), L.latLng(file.maxLatitude, file.maxLongitude)), {padding: new L.Point(25, 25), maxZoom: this.myMap.getZoom()});
  }

  fileListChanged(): void { }

  update(): void {
    let message = this.globals.message;
    if(!message)
      return;
    this.longitude = message.longitude;
    this.latitude = message.latitude;
    this.marker.setLatLng(L.latLng(this.latitude, this.longitude));
    // TODO set popup data...
    // marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
  }

}
