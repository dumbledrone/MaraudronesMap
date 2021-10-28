import {Component, Injectable} from "@angular/core";
import * as constants from "./constants";
import {NgxIndexedDBService} from "ngx-indexed-db";
import {DATA_DBNAME, FILE_DBNAME, LATITUDE, LONGITUDE, MESSAGE_FILE_KEY, MESSAGE_MESSAGENUM_KEY} from "./constants";


@Injectable({
  providedIn: 'root',
})
export class Globals {
  private _subscriptions: Set<DroneMapWidget> = new Set();

  private _file: File | null = null;
  private _fileName: string = "";
  private _fileId: number = -1;
  private _dbFile!: DbFile;
  private _flightDuration: number = 0;
  private _dbFiles: DbFile[];
  private _dbMessage!: DbMessage;

  private constructor(private dbService: NgxIndexedDBService) {
    this._dbFiles = [];
    this.loadDbFiles();
  }

  private updated() {
    this._subscriptions.forEach(s => s.update());
  }

  private fileChanged() {
    this._subscriptions.forEach(s => s.fileChanged());
  }

  private fileListChanged() {
    this._subscriptions.forEach(s => s.fileListChanged());
  }

  public subscribe(sub: DroneMapWidget) {
    this._subscriptions.add(sub);
  }

  public unsubscribe(sub: DroneMapWidget) {
    this._subscriptions.delete(sub);
  }

  public importFile(file: File) {
    this._file = file;
    this.processFile();
    this.updated();
  }

  get flightDuration(): number {
    return this._flightDuration;
  }

  get fileName(): string {
    return this._fileName;
  }

  get availableFiles(): DbFile[] {
    return this._dbFiles;
  }

  set message(message: DbMessage) {}

  public get message(): DbMessage {
    return this._dbMessage;
  }


  processFile(): void {
    // TODO get duration!
    this._flightDuration = 10;
    let inst = this;
    let rawDataElements: string[][] = [];
    let csvFileReader = new FileReader();
    csvFileReader.onload = function () {
      if(inst._file === null)
        return;
      let lines = (csvFileReader.result as string).split(/\r?\n/);
      let attrs = lines[0].split(",");
      let latIndex = attrs.indexOf(constants.LATITUDE);
      let longIndex = attrs.indexOf(constants.LONGITUDE);
      for (let count = 1; count < lines.length; count+=10) {// TODO count++
        let values = lines[count].split(",");
        if(values[latIndex] === "0.0")
          continue;
        rawDataElements.push(values);
        // console.log(count);
        // console.log(rawDataElements[count - 1][latIndex] + "  -  " + rawDataElements[count - 1][attrs.indexOf("time")])
      }
      let len = rawDataElements.length - 1;
      if (rawDataElements[len].length !== rawDataElements[len - 1].length) {
        rawDataElements.pop();
      }

      inst.dbService.add(FILE_DBNAME, [{// TODO save all file indizes here :) (& add to definition in app.module.ts)
        fileName: inst._file.name,
        messageCount: rawDataElements.length,
        longitude: longIndex,
        latitude: latIndex
      }]).subscribe((res: any) => {
        console.log('created file id: ' + res.id);
        inst.loadDbFiles();
        inst.dbService.bulkAdd(DATA_DBNAME, rawDataElements.map((obj, ind) => ({...obj, fileId: res.id, messageNum: ind}))).subscribe(() => console.log("added all data elements"));
      })
      inst._file = null;
    }
    // @ts-ignore
    csvFileReader.readAsText(this._file);
  }

  public selectFile(fileId: number) {
    let file = this.availableFiles.find(a => a.id === fileId);
    if(file === undefined)
      return;
    this._fileName = file.fileName;
    this._fileId = file.id;
    this._flightDuration = file.messageCount;
    this._dbFile = file;
    console.log("selected file: " + file.fileName + " (" + file.id + ")");
    this.fileChanged();
  }

  public loadDbFiles(): void {
    this.dbService.getAll(FILE_DBNAME).subscribe(res => {
      this._dbFiles = DbFile.fromResultArray(res);
      console.log(this._dbFiles);
      this.fileListChanged();
    });
  }

  public loadMessage(messageId: number) {
    this.dbService.getAllByIndex(DATA_DBNAME, MESSAGE_MESSAGENUM_KEY, IDBKeyRange.only(messageId)).subscribe(res => {
      console.log(res);
      let mes = res.find((r: any) => r.fileId === this._fileId);
      this._dbMessage = DbMessage.fromResult(mes, this._dbFile);
      this.updated();
    });
  }
}

export interface DroneMapWidget {
  update(): void;
  fileChanged(): void;
  fileListChanged(): void;
}

export class DbFile {
  public fileName: string;
  public messageCount: number;
  public id: number;
  public longIndex: number;
  public latIndex: number;

  constructor(fileName: string, messageCount: number, id: number, longIndex: number, latIndex: number) {
    this.fileName = fileName;
    this.messageCount = messageCount;
    this.id = id;
    this.longIndex = longIndex;
    this.latIndex = latIndex;
  }

  static fromResultArray(resultArr: any[]): DbFile[] {
    let arr: DbFile[] = [];
    resultArr.forEach(r => arr.push(new DbFile(r[0].fileName, r[0].messageCount, r.id, r[0][LONGITUDE], r[0][LATITUDE])));
    return arr;
  }
}

export class DbMessage {
  id: number;
  fileId: number;
  messageNum: number;
  longitude: number;
  latitude: number;

  constructor(id: number, fileId: number, messageNum: number, longitude: number, latitude: number) {
    this.id = id;
    this.fileId = fileId;
    this.messageNum = messageNum;
    this.longitude = longitude;
    this.latitude = latitude;
  }

  static fromResult(result: any, file: DbFile): DbMessage {
    return new DbMessage(result.id, result.fileId, result.messageNum, result[file.longIndex], result[file.latIndex]);
  }
}
