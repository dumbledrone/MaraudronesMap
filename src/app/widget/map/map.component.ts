import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DroneMapWidget, Globals, LineType} from "../../global";
import * as L from "leaflet";
import {GeoJSON, LatLng} from "leaflet";
import {RotatedMarker} from "leaflet-marker-rotation";
import {getOrientationFromImuAttiMessage} from "../../helpers/functions";


// @ts-ignore
const ColorScale = require("color-scales");

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnChanges, DroneMapWidget {
  static MAX_ZOOM = 23;

  longitude: number = 0;
  latitude: number = 0;
  altitude: number = 0;
  orientation: number = 0;
  currentLayer: any;
  geoTrack: GeoJSON | undefined;

  @Input() mapType: number = 1;

  myMap!: L.Map;
  marker!: RotatedMarker;

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
            maxZoom: MapComponent.MAX_ZOOM,
            tileSize: 512,
            zoomOffset: -1,
            subdomains: ['mt0','mt1','mt2','mt3']
          });
        break;
      case 3: // Google Hybrid
        this.currentLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
          {
            attribution: 'Map data &copy; Google.com',
            maxZoom: MapComponent.MAX_ZOOM,
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
            maxZoom: MapComponent.MAX_ZOOM,
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
      let droneIcon = L.icon({
        iconUrl: 'assets/markerImage.png',
        //shadowUrl: 'leaf-shadow.png',

        iconSize:     [40, 40], // size of the icon
        //shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
        //shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [20, 20] // point from which the popup should open relative to the iconAnchor
      });
      this.marker = new RotatedMarker([49.57384629202841, 11.02728355453469], {icon: droneIcon,
          rotationAngle: 0, rotationOrigin: "center"}).addTo(this.myMap);
    }
    if(this.longitude === 0 && this.latitude === 0) {
      this.marker.setLatLng(L.latLng([49.57384629202841, 11.02728355453469]));
    } else {
      this.marker.setLatLng(L.latLng([this.latitude, this.longitude]));
    }
    this.drawLine();
  }

  ngOnInit(): void {
  }

  fileChanged(): void {
    if(this.globals.file) {
      let file = this.globals.file;
      this.myMap.flyToBounds(L.latLngBounds(L.latLng(file.minLatitude, file.minLongitude), L.latLng(file.maxLatitude, file.maxLongitude)), {
        padding: new L.Point(25, 25)
      });
      this.drawLine();
    } else {
      this.geoTrack?.removeFrom(this.myMap);
    }
  }

  fileListChanged(): void { }

  update(): void {
    let message = this.globals.gpsMessage;
    if(!message) {
      this.marker?.setLatLng(L.latLng([49.57384629202841, 11.02728355453469]));
      return;
    }
    this.longitude = message.longitude;
    this.latitude = message.latitude;
    this.marker.setLatLng(L.latLng(this.latitude, this.longitude));
    this.orientation = getOrientationFromImuAttiMessage(this.globals.imuAttiMessage);
    this.marker.setRotationAngle(this.orientation);
    // TODO set popup data...
    // marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
    this.drawLine();
  }


  //draw lines
  private getTrackCoordinates(){
    let c: LatLng[] = [];
    this.globals.file?.track?.forEach(d => c.push(L.latLng([d.lat, d.long])));
    return c;
  }
  private drawLine() {
    if(!this.globals.file)
      return;
    let inst = this;
    //remove earlier track
    this.geoTrack?.removeFrom(this.myMap);
    if(this.globals.file === undefined || this.globals.file.track === undefined || this.globals.file.track.length === 0)
      return;

    //create vertice pairs for lines from track
    let trackVerticePairs: any [] = [];
    for (let i = 0; i < this.globals.file.track.length - 1; i++) {
      trackVerticePairs.push([ this.globals.file.track[i],this.globals.file.track[i+1] ])
    }

    //create lines for vertice pairs
    let trackGeoJSON: any[] = [];
    trackVerticePairs.forEach((line, ind)=> {
      //colorType: for colorType needed info must be added in properties for new colorTypes
      trackGeoJSON.push({type: "Feature", properties: {colorValue: ind, altitude: (line[0].altitude + line[1].altitude)/2,
          speed: (line[0].speed + line[1].speed)/2}, geometry:{ type: "Polygon",
          coordinates: [[[line[0].long,line[0].lat],[line[1].long,line[1].lat]]]}})
    });

    let colorScale_track_retObject: any = this.editAccordingToType(this.globals.lineType, trackGeoJSON);
    let colorScale: typeof ColorScale = colorScale_track_retObject["colorScale"];
    trackGeoJSON = colorScale_track_retObject["geoJson"];

    //color the track
    // @ts-ignore
    this.geoTrack = L.geoJSON(trackGeoJSON, {
      style: function (feature) {
        // @ts-ignore
        return {color: colorScale.getColor(feature.properties.colorValue).toHexString()}
        }
    });
    this.geoTrack.addTo(this.myMap);
  }

  /**
   * @param type: coloring type wanted
   * @param trackGeoJson
   * @private
   * @return {
   *   "geoJson": trackGeoJson with type applied to colorValue,
   *   "colorScale": color scale according to type
   * }
   */
  //colorType: rules according to colorType must be implement if colorTypes are added
  private editAccordingToType(type:LineType, trackGeoJson: any[]) {
    if(!this.globals.file)
      return;
    //creat colorScale according to coloring type
    let colorScale: typeof ColorScale;
    switch (type) {
      case LineType.height:
        let heights = this.globals.file.track.map(t => t.altitude);
        colorScale = new ColorScale(Math.min(...heights),Math.max(...heights), ["#00ff00", '#0000ff']);
        trackGeoJson.forEach( line => {
          line.properties.colorValue = line.properties.altitude;
        });
        break;
      case LineType.time:
        colorScale = new ColorScale(0,this.globals.file.track.length - 1, ["#ff0014", '#ffc300', '#00ff00', '#0000ff']);
        break;
      case LineType.speed:
        let speeds = this.globals.file.track.map(t => t.speed);
        colorScale = new ColorScale(0,Math.max(...speeds), ["#00ff00", '#0000ff']);
        trackGeoJson.forEach( line => {
          line.properties.colorValue = line.properties.speed;
        });
        break;
      case LineType.none:
      default:
        colorScale = new ColorScale(0,this.globals.file.track.length - 1, ['#000000','#000000']);
    }
    return {"geoJson":trackGeoJson, "colorScale":colorScale};
  }
}

