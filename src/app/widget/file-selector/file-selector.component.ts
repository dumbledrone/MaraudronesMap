import { Component, OnInit } from '@angular/core';
import {DroneMapWidget, Globals} from "../../global";
import {DbFile} from "../../helpers/DroneWebGuiDatabase";

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.css']
})
export class FileSelectorComponent implements OnInit, DroneMapWidget {
  fileName: string | undefined = "";
  availableFiles: DbFile[];
  currentFile: File | undefined;
  fileAlreadyPresent: boolean = false;

  constructor(public globals: Globals) {
    globals.subscribe(this);
    this.availableFiles = this.globals.availableFiles;
  }

  ngOnInit(): void {
  }

  handleFileInput(event: any): void {
    if(event.target.files.length > 0) {
      this.currentFile = event.target.files.item(0);
      this.fileAlreadyPresent = this.availableFiles.find(a => a.fileName === this.currentFile?.name) !== undefined;
    }
  }

  importFile(): void {
    if(this.currentFile)
      this.globals.importFile(this.currentFile);
  }

  handleFileSelect(event: any): void {
    this.globals.selectFile(parseInt(event.target.value));
  }

  showFileInfo(): void {
    this.fileName = this.globals.file?.fileName;
  }

  update(): void {
    this.showFileInfo();
  }

  fileChanged(): void {
    this.availableFiles = this.globals.availableFiles;
    this.showFileInfo();
  }

  fileListChanged(): void {
    this.availableFiles = this.globals.availableFiles;
    this.fileAlreadyPresent = this.availableFiles.find(a => a.fileName === this.currentFile?.name) !== undefined;
  }

  deleteSelectedFile() {
    if(this.globals.file && window.confirm("Do you really want to delete the file '" + this.globals.file.fileName + "'")) {
      this.globals.deleteFile();
    }
  }
}
