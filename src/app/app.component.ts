import {Component, NgModule} from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {AppearenceDialogueComponent} from "./helpers/appearence-dialogue/appearence-dialogue.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'drone-web-gui';

  constructor(private dialog:MatDialog) {
  }
  openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      id: 1,
      title: 'Blub'
    }
    const dialogRef = this.dialog.open(AppearenceDialogueComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => console.log("Dialog output: ", data)
    )
  }
}
