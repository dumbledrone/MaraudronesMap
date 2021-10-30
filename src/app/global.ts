import {Component, Injectable} from "@angular/core";
import * as constants from "./constants";
import {NgxIndexedDBService} from "ngx-indexed-db";
import {
  ALTITUDE, BATTERY_CAP_PERCENT, BATTERY_TEMP, BATTERY_VOLT,
  DATA_DBNAME,
  FILE_DBNAME,
  LATITUDE,
  LONGITUDE, MAX_LATITUDE, MAX_LONGITUDE,
  MESSAGE_FILE_KEY,
  MESSAGE_MESSAGENUM_KEY,
  MIN_LATITUDE, MIN_LONGITUDE, NUM_GPS
} from "./constants";


@Injectable({
  providedIn: 'root',
})
export class Globals {
  private _subscriptions: Set<DroneMapWidget> = new Set();

  private _file: File | null = null;
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
  }

  get flightDuration(): number {
    return this._flightDuration;
  }

  get availableFiles(): DbFile[] {
    return this._dbFiles;
  }

  set message(message: DbMessage) {}

  public get message(): DbMessage {
    return this._dbMessage;
  }

  set file(file: DbFile) {}

  public get file(): DbFile {
    return this._dbFile;
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
      let timeIndex = attrs.indexOf("time");
      let invalid = true;

      let lastTimeStamp = "--";
      let end = lines.length - 1;
      console.log(new Date());
      for (let count = 1; count < end; count++) {
        let values = lines[count].split(",");
        if(invalid && (values[latIndex] === "" || values[latIndex] === "0.0"))
          continue;
        let timeVal = values[timeIndex];
        if(timeVal.startsWith(lastTimeStamp))
          continue;
        lastTimeStamp = timeVal;
        invalid = false;
        rawDataElements.push(values);
        // console.log(count);
        // console.log(rawDataElements[count - 1][latIndex] + "  -  " + rawDataElements[count - 1][attrs.indexOf("time")])
      }
      console.log(new Date());
      let len = rawDataElements.length - 1;
      if (rawDataElements[len].length !== rawDataElements[len - 1].length) {
        rawDataElements.pop();
      }

      let latCol: number[] = rawDataElements.map(r => r[latIndex]).map(r => parseFloat(r));
      let longCol: number[] = rawDataElements.map(r => r[longIndex]).map(r => parseFloat(r));
      inst.dbService.add(FILE_DBNAME, [{// TODO save all file indizes here :) (& add to definition in app.module.ts)
        fileName: inst._file.name,
        messageCount: rawDataElements.length,
        longitude: longIndex,
        latitude: latIndex,
        altitude: attrs.indexOf(constants.ALTITUDE),
        minLatitude: Math.min(...latCol),
        maxLatitude: Math.max(...latCol),
        minLongitude: Math.min(...longCol),
        maxLongitude: Math.max(...longCol),
        cap_per: attrs.indexOf(BATTERY_CAP_PERCENT),
        temp: attrs.indexOf(BATTERY_TEMP),
        vol_t: attrs.indexOf(BATTERY_VOLT),
        numGPS: attrs.indexOf(NUM_GPS)
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
  fileChanged(): void; // Only change file related info, as message will be loaded after this event fired! -> globals.message might be undefined
  fileListChanged(): void;

}

export class DbFile {
  public fileName: string;
  public messageCount: number;
  public id: number;
  public longIndex: number;
  public latIndex: number;
  public altIndex: number;
  public minLatitude: number;
  public maxLatitude: number;
  public minLongitude: number;
  public maxLongitude: number;
  public batCapPercInd: number;
  public batTempInd: number;
  public batVoltInd: number;
  public numGPSInd: number;

  constructor(fileName: string, messageCount: number, id: number, longIndex: number, latIndex: number, altIndex: number,
              minLatitude: number, maxLatitude: number, minLongitude: number, maxLongitude: number, batCapPercInd: number,
              batTempInd: number, batVoltInd: number, numGPSInd: number) {
    this.fileName = fileName;
    this.messageCount = messageCount;
    this.id = id;
    this.longIndex = longIndex;
    this.latIndex = latIndex;
    this.altIndex = altIndex;
    this.minLatitude = minLatitude;
    this.maxLatitude = maxLatitude;
    this.minLongitude = minLongitude;
    this.maxLongitude = maxLongitude;
    this.batCapPercInd = batCapPercInd;
    this.batTempInd = batTempInd;
    this.batVoltInd = batVoltInd;
    this.numGPSInd = numGPSInd;
  }

  static fromResultArray(resultArr: any[]): DbFile[] {
    let arr: DbFile[] = [];
    resultArr.forEach(r => arr.push(new DbFile(r[0].fileName, r[0].messageCount, r.id, r[0][LONGITUDE], r[0][LATITUDE],
      r[0][ALTITUDE], r[0][MIN_LATITUDE], r[0][MAX_LATITUDE], r[0][MIN_LONGITUDE], r[0][MAX_LONGITUDE],
      r[0][BATTERY_CAP_PERCENT], r[0][BATTERY_TEMP], r[0][BATTERY_VOLT], r[0][NUM_GPS])));
    return arr;
  }
}

export class DbMessage {
  id: number;
  fileId: number;
  messageNum: number;
  longitude: number;
  latitude: number;
  altitude: number;
  batCapPerc: number;
  batTemp: number;
  batVolt: number;
  numGPS: number;

  constructor(id: number, fileId: number, messageNum: number, longitude: number, latitude: number, altitude: number,
              batCapPerc: number, batTemp: number, batVolt: number, numGPS: number) {
    this.id = id;
    this.fileId = fileId;
    this.messageNum = messageNum;
    this.longitude = longitude;
    this.latitude = latitude;
    this.altitude = altitude;
    this.batCapPerc = batCapPerc;
    this.batTemp = batTemp;
    this.batVolt = batVolt;
    this.numGPS = numGPS;
  }

  static fromResult(result: any, file: DbFile): DbMessage {
    return new DbMessage(result.id, result.fileId, result.messageNum, result[file.longIndex], result[file.latIndex],
      result[file.altIndex], result[file.batCapPercInd], result[file.batTempInd], result[file.batVoltInd],
      result[file.numGPSInd]);
  }
}
