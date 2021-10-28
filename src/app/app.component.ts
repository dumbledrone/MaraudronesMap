import {Component, NgModule, OnInit} from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {AppearenceDialogueComponent} from "./helpers/appearence-dialogue/appearence-dialogue.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'drone-web-gui';
  private _localStorageValues : boolean[];

  constructor(private dialog:MatDialog) {
    this._localStorageValues=[];
  }

  ngOnInit(): void {
    this.getLocalStorageValues();
    this.updateInfoView();
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      id: 1,
      test: this._localStorageValues,
    }
    const dialogRef = this.dialog.open(AppearenceDialogueComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        console.log("Dialog output: ", data);
        for (let i = 0; i < 2; i++) {    //#checkboxNumber
          localStorage.setItem("checkbox" + i, data["checkbox"+i] ? "true": "false");
          this._localStorageValues[i] = data["checkbox"+i];
        }
        this.updateInfoView();
      }
  )
  }
  updateInfoView() {
    //#checkboxNumber
    //@ts-ignore
    document.getElementById("infos0")?.style.display = this._localStorageValues[0] ? "block" : "none";
    //@ts-ignore
    document.getElementById("infos1")?.style.display = this._localStorageValues[1] ? "block" : "none";
  }
  getLocalStorageValues() {
    for (let i = 0; i < 2; i++) {     //#checkboxNumber i < number of checkboxes
      let tmp = localStorage.getItem("checkbox" + i);
      this._localStorageValues[i] = tmp === null ? true : tmp === "true";
    }
  }
}
