import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";
import * as L from "leaflet";
import {control} from "leaflet";
import zoom = control.zoom;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnChanges, DroneMapWidget {

  longitude: number = 0;
  latitude: number = 0;
  altitude: number = 0;
  currentLayer: any;

  @Input() mapType: number = 1;

  myMap!: L.Map;
  marker!: L.Marker;

  constructor(private globals: Globals) {
    this.globals.subscribe(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.myMap === undefined) {
      this.myMap = L.map('map').setView([49.57384629202841, 11.02728355453469], 20);
    }
    if(this.currentLayer)
      this.myMap.removeLayer(this.currentLayer);
    switch (this.mapType) {
      case 2: // Google Street
        this.currentLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          {
            attribution: 'Map data &copy; Google.com',
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1,
            subdomains: ['mt0','mt1','mt2','mt3']
          });
        break;
      case 3: // Google Hybrid
        this.currentLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
          {
            attribution: 'Map data &copy; Google.com',
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1,
            subdomains: ['mt0','mt1','mt2','mt3']
          });
        break;
      case 4: // Google Satellite
        this.currentLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          {
            attribution: 'Map data &copy; Google.com',
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1,
            subdomains: ['mt0','mt1','mt2','mt3']
          });
        break;
      case 5: // Google Terrain
        this.currentLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
          {
            attribution: 'Map data &copy; Google.com',
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1,
            subdomains: ['mt0','mt1','mt2','mt3']
          });
        break;
      case 1: // Open Street Map
      default:
        this.currentLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1
          });
    }
    this.currentLayer.addTo(this.myMap);
    if(!this.marker) {
      this.marker = L.marker([49.57384629202841, 11.02728355453469]).addTo(this.myMap);
    }
    if(this.longitude === 0 && this.latitude === 0) {
      this.marker.setLatLng(L.latLng([49.57384629202841, 11.02728355453469]));
    } else {
      this.marker.setLatLng(L.latLng([this.longitude, this.latitude]));
    }
  }

  ngOnInit(): void {
  }

  fileChanged(): void {// TODO reset map
    let file = this.globals.file;
    this.myMap.flyToBounds(L.latLngBounds(L.latLng(file.minLatitude, file.minLongitude), L.latLng(file.maxLatitude, file.maxLongitude)), {padding: new L.Point(25, 25), maxZoom: this.myMap.getZoom()});
  }

  fileListChanged(): void { }

  update(): void {
    let message = this.globals.gpsMessage;
    if(!message)
      return;
    this.longitude = message.longitude;
    this.latitude = message.latitude;
    this.marker.setLatLng(L.latLng(this.latitude, this.longitude));
    // TODO set popup data...
    // marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
  }

}
