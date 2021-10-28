import { Component, OnInit } from '@angular/core';
import {DroneMapWidget} from "../../global";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit, DroneMapWidget {

  constructor() {
  }

  ngOnInit(): void {
  }

  fileChanged(): void {
  }

  fileListChanged(): void {
  }

  update(): void {
  }
}
