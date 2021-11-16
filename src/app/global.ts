import {Component, Injectable} from "@angular/core";
import * as constants from "./constants";
import {NgxIndexedDBService} from "ngx-indexed-db";
import {
  ALTITUDE, BATTERY_CAP_PERCENT, BATTERY_TEMP, BATTERY_VOLT,
  DATA_DBNAME,
  FILE_DBNAME, GPS_OFFSET,
  LATITUDE,
  LONGITUDE, MAX_LATITUDE, MAX_LONGITUDE,
  MESSAGE_FILE_KEY,
  MESSAGE_MESSAGENUM_KEY, MESSAGE_PKT_ID_KEY, MESSAGE_SECOND_KEY,
  MIN_LATITUDE, MIN_LONGITUDE, NUM_GPS, PKT_1000_CONTROLLER, PKT_16_ULTRASONIC, PKT_1710_BATTERY_INFO, PKT_2096_GPS
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
  private _gpsMessage: GpsDbMessage | undefined;
  private _controllerMessage: ControllerDbMessage | undefined;
  private _uSonicMessage: UltrasonicDbMessage | undefined;
  private _batteryMessage: BatteryDbMessage | undefined;

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

  set gpsMessage(gpsMessage: GpsDbMessage | undefined) {}

  public get gpsMessage(): GpsDbMessage | undefined {
    return this._gpsMessage;
  }

  set batteryMessage(batteryMessage: BatteryDbMessage | undefined) {}

  public get batteryMessage(): BatteryDbMessage | undefined {
    return this._batteryMessage;
  }

  set uSonicMessage(uSonicMessage: UltrasonicDbMessage | undefined) {}

  public get uSonicMessage(): UltrasonicDbMessage | undefined {
    return this._uSonicMessage;
  }

  set controllerMessage(controllerMessage: ControllerDbMessage | undefined) {}

  public get controllerMessage(): ControllerDbMessage | undefined {
    return this._controllerMessage;
  }

  set file(file: DbFile) {}

  public get file(): DbFile {
    return this._dbFile;
  }


  processFile(): void {
    this._flightDuration = 10;
    let inst = this;

    let jsonFileReader = new FileReader();
    jsonFileReader.onload = async function () {
      if (inst._file === null)
        return;
      let data = JSON.parse(<string>jsonFileReader.result);
      let gpsData = data.filter((d: any) => d.pktId === 2096);
      let latCol = gpsData.map((a: any) => a.latitude);
      latCol = latCol.filter((l: number) => l !== 0);
      let longCol = gpsData.map((a: any) => a.longitude);
      longCol = longCol.filter((l: number) => l !== 0);
      let timeCol: number[] = Array.from(new Set(gpsData.map((a: any) => timeStringToSecs(a.time))));
      for(let i = 0; i < timeCol.length; i++) {
        if(timeCol[i] + 1 < timeCol[i+1]) {
          timeCol = timeCol.slice(i + 1);
          break;
        }
      }// TODO is the for necessary?
      let seconds = timeCol.length;
      console.log(new Date());
      inst.dbService.add(FILE_DBNAME, [{ // TODO offset
        fileName: inst._file.name,
        messageCount: data.length,
        flightDuration: seconds,
        startTime: timeCol[0],
        minLatitude: Math.min(...latCol),
        maxLatitude: Math.max(...latCol),
        minLongitude: Math.min(...longCol),
        maxLongitude: Math.max(...longCol),
        altitude: 0,
        gpsOffset: 0
      }]).subscribe((res: any) => {
        inst.loadDbFiles();
        inst.handleDataArray(res.id, data);
        inst._file = null;
        console.log('created file id: ' + res.id);
      });

    }
    // @ts-ignore
    jsonFileReader.readAsText(this._file);
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

  public loadMessagesById(messageId: number) {
    let ct = 0;
    this.dbService.getAllByIndex(PKT_2096_GPS, MESSAGE_MESSAGENUM_KEY, IDBKeyRange.bound(messageId - 100, messageId)).subscribe(res => {
      let messages: any[] = res.filter((r: any) => r.fileId === this._dbFile.id);
      let mes = messages.slice(-1).pop();
      this._gpsMessage = DbMessage.fromResult(mes) as GpsDbMessage;
      ct++;
      if(ct === 4)
        this.updated();
    });
    this.dbService.getAllByIndex(PKT_1710_BATTERY_INFO, MESSAGE_MESSAGENUM_KEY, IDBKeyRange.bound(messageId - 100, messageId)).subscribe(res => {
      let messages: any[] = res.filter((r: any) => r.fileId === this._dbFile.id);
      let mes = messages.slice(-1).pop();
      this._batteryMessage = DbMessage.fromResult(mes) as BatteryDbMessage;
      ct++;
      if(ct === 4)
        this.updated();
    });
    this.dbService.getAllByIndex(PKT_1000_CONTROLLER, MESSAGE_MESSAGENUM_KEY, IDBKeyRange.bound(messageId - 100, messageId)).subscribe(res => {
      let messages = res.filter((r: any) => r.fileId === this._dbFile.id);
      let mes = messages.slice(-1).pop();
      this._controllerMessage = DbMessage.fromResult(mes) as ControllerDbMessage;
      ct++;
      if(ct === 4)
        this.updated();
    });
    this.dbService.getAllByIndex(PKT_16_ULTRASONIC, MESSAGE_MESSAGENUM_KEY, IDBKeyRange.bound(messageId - 100, messageId)).subscribe(res => {
      let messages: any[] = res.filter((r: any) => r.fileId === this._dbFile.id);
      let mes = messages.slice(-1).pop();
      this._uSonicMessage = DbMessage.fromResult(mes) as UltrasonicDbMessage;
      ct++;
      if(ct === 4)
        this.updated();
    });
  }

  public loadMessagesBySecond(second: number) {
    this.dbService.getAllByIndex(PKT_2096_GPS, MESSAGE_SECOND_KEY, IDBKeyRange.only(second)).subscribe(res => {
      console.log(res);
      let mes = res.find((r: any) => r.fileId === this._dbFile.id);
      this._gpsMessage = DbMessage.fromResult(mes) as GpsDbMessage;
      this.loadMessagesById(this._gpsMessage.messageNum);
    });
  }

  private handleDataArray(fileId: number, data: any[]) {
    let inst = this;
    let filteredData: any = {};
    let lastTimeStamp = "--";
    let secondCounter = 0;
    data.forEach((d: any, index: number) => {
      if (!filteredData[d.pktId])
        filteredData[d.pktId] = [];
      d.messageNum = index;
      d.fileId = fileId;
      if(d.pktId === 2096) {
        d.second = -1;
        if(!d.time.startsWith(lastTimeStamp)) {
          d.second = secondCounter++;
        }
      }
      filteredData[d.pktId].push(d);
    });
    let keys = Object.keys(filteredData);
    let runningImports = 0;
    // TODO show loading indicator
    keys.forEach(key => {
      // TODO save all messages
      console.log(filteredData[key][0]);
      if(key !== "2096" && key !== "16" && key !== "1000" && key !== "1710")
        return;
      runningImports++;
      inst.dbService.bulkAdd(key, filteredData[key]).subscribe(() => {
        console.log('added ' + filteredData[key].length + ' entries for pktId ' + key);
        if(--runningImports === 0) {
          console.log(new Date());
          console.log("import completed"); // TODO hide loading indicator
        }
      });
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
  public flightDuration: number;
  public id: number;
  public minLatitude: number;
  public maxLatitude: number;
  public minLongitude: number;
  public maxLongitude: number;
  public gpsOffset: number;

  constructor(fileName: string, messageCount: number, flightDuration: number, id: number, minLatitude: number,
              maxLatitude: number, minLongitude: number, maxLongitude: number, gpsOffset: number) {
    this.fileName = fileName;
    this.messageCount = messageCount;
    this.flightDuration = flightDuration;
    this.id = id;
    this.minLatitude = minLatitude;
    this.maxLatitude = maxLatitude;
    this.minLongitude = minLongitude;
    this.maxLongitude = maxLongitude;
    this.gpsOffset = gpsOffset;
  }

  static fromResultArray(resultArr: any[]): DbFile[] {
    let arr: DbFile[] = [];
    resultArr.forEach(r => arr.push(new DbFile(r[0].fileName, r[0].messageCount, r[0].flightDuration, r.id,
      r[0][MIN_LATITUDE], r[0][MAX_LATITUDE], r[0][MIN_LONGITUDE], r[0][MAX_LONGITUDE], r[0][GPS_OFFSET])));
    return arr;
  }
}

export class DbMessage {
  id: number;
  fileId: number;
  messageNum: number;

  constructor(id: number, fileId: number, messageNum: number){//}, batCapPerc: number, batTemp: number, batVolt: number, numGPS: number) {
    this.id = id;
    this.fileId = fileId;
    this.messageNum = messageNum;
  }

  static fromResult(result: any): any {
    if(!result)
      return new DbMessage(0, 0, 0);
    switch(result[MESSAGE_PKT_ID_KEY].toString()) {
      case PKT_2096_GPS:
        return new GpsDbMessage(result.id, result.fileId, result.messageNum, result.longitude, result.latitude, result.altitude, result.numGPS, result.second);
      case PKT_16_ULTRASONIC:
        return new UltrasonicDbMessage(result.id, result.fileId, result.messageNum, result.usonic_h, result.usonic_flag);
      case PKT_1000_CONTROLLER:
        return new ControllerDbMessage(result.id, result.fileId, result.messageNum, result.ctrl_pitch, result.ctrl_roll, result.ctrl_yaw, result.ctrl_thr);
      case PKT_1710_BATTERY_INFO:
        return new BatteryDbMessage(result.id, result.fileId, result.messageNum, result.cap_per, result.temp);
    }
    return new DbMessage(result.id, result.fileId, result.messageNum);
  }
}

export class GpsDbMessage extends DbMessage {
  longitude: number;
  latitude: number;
  altitude: number;
  numGPS: number;
  second: number;

  constructor(id: number, fileId: number, messageNum: number, longitude: number, latitude: number, altitude: number, numGPS: number, second: number) {
    super(id, fileId, messageNum);
    this.longitude = longitude;
    this.latitude = latitude;
    this.altitude = altitude;
    this.numGPS = numGPS;
    this.second = second;
  }
}

export class ControllerDbMessage extends DbMessage {
  ctrl_pitch: number;
  ctrl_roll: number;
  ctrl_yaw: number;
  ctrl_thr: number;

  constructor(id: number, fileId: number, messageNum: number, ctrl_pitch: number, ctrl_roll: number, ctrl_yaw: number, ctrl_thr: number) {
    super(id, fileId, messageNum);
    this.ctrl_pitch = ctrl_pitch;
    this.ctrl_roll = ctrl_roll;
    this.ctrl_yaw = ctrl_yaw;
    this.ctrl_thr = ctrl_thr;
  }
}

export class BatteryDbMessage extends DbMessage {
  cap_per: number;
  temp: number;

  constructor(id: number, fileId: number, messageNum: number, cap_per: number, temp: number) {
    super(id, fileId, messageNum);
    this.cap_per = cap_per;
    this.temp = temp;
  }
}

export class UltrasonicDbMessage extends DbMessage {
  usonic_h: number;
  usonic_flag: number;

  constructor(id: number, fileId: number, messageNum: number, usonic_h: number, usonic_flag: number) {
    super(id, fileId, messageNum);
    this.usonic_h = usonic_h;
    this.usonic_flag = usonic_flag;
  }
}

function timeStringToSecs(timeString: string) {
  let parts = timeString.split(":").map(x => parseInt(x));
  return parts[0]*24 + parts[1]*60 + parts[2];
}
