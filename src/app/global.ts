import {Injectable} from "@angular/core";
import {
  BatteryDbMessage,
  ControllerDbMessage,
  DbFile,
  DbMessage,
  DroneWebGuiDatabase,
  EscDataDbMessage,
  GpsDbMessage,
  ImuAttiDbMessage,
  MotorCtrlDbMessage,
  OsdGeneralDataDbMessage,
  OsdHomeDbMessage,
  RcDebugInfoDbMessage,
  RecMagDbMessage,
  UltrasonicDbMessage,
  LogDbMessage
} from "./helpers/DroneWebGuiDatabase";
import Dexie from "dexie";
import Table = Dexie.Table;
import {AnomalyAnalyzer, error} from "./widget/anomaly/anomaly.component";


@Injectable({
  providedIn: 'root',
})
export class Globals {
  loadCallback = () => {};
  finishLoadingCallback = () => {};

  private _subscriptions: Set<DroneMapWidget> = new Set();

  private _file: File | null = null;
  private _fileId: number = -1;
  private _dbFile: DbFile | null = null;
  private _flightDuration: number = 0;
  private _dbFiles: DbFile[];
  private _gpsMessage: GpsDbMessage | undefined;
  private _controllerMessage: ControllerDbMessage | undefined;
  private _uSonicMessage: UltrasonicDbMessage | undefined;
  private _batteryMessage: BatteryDbMessage | undefined;
  private _osdGeneralMessage: OsdGeneralDataDbMessage | undefined;
  private _imuAttiMessage: ImuAttiDbMessage | undefined;
  private _recMagMessage: RecMagDbMessage | undefined;
  private _escDataMessage: EscDataDbMessage | undefined;
  private _motorCtrlMessage: MotorCtrlDbMessage | undefined;
  private _rcDebugMessage: RcDebugInfoDbMessage | undefined;
  private _osdHomeMessage: OsdHomeDbMessage | undefined;
  private _flylogMessage: LogDbMessage | undefined;
  private _sdLogMessage: LogDbMessage | undefined;
  private _lineType: LineType = LineType.none;
  private _anomalyLevel!: number;
  private _latestMessage: DbMessage | undefined;

  private static CHUNK_SIZE = 100000;

  private constructor(private dexieDbService: DroneWebGuiDatabase) {
    this._dbFiles = [];
    this._anomalyLevel = 1;
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
    try {
      this.processFile();
    } catch (e) {
      this.finishLoadingCallback();
      window.alert("An error occurred during file import");
    }
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

  set osdGeneralMessage(osdGeneralMessage: OsdGeneralDataDbMessage | undefined) {}

  public get osdGeneralMessage(): OsdGeneralDataDbMessage | undefined {
    return this._osdGeneralMessage;
  }

  set imuAttiMessage(imuAttiMessage: ImuAttiDbMessage | undefined) {}

  public get imuAttiMessage(): ImuAttiDbMessage | undefined {
    return this._imuAttiMessage;
  }

  set recMagMessage(recMagMessage: RecMagDbMessage | undefined) {}

  public get recMagMessage(): RecMagDbMessage | undefined {
    return this._recMagMessage;
  }

  set escDataMessage(escDataMessage: EscDataDbMessage | undefined) {}

  public get escDataMessage(): EscDataDbMessage | undefined {
    return this._escDataMessage;
  }

  set motorCtrlMessage(motorCtrlMessage: MotorCtrlDbMessage | undefined) {}

  public get motorCtrlMessage(): MotorCtrlDbMessage | undefined {
    return this._motorCtrlMessage;
  }

  set rcDebugMessage(rcDebugMessage: RcDebugInfoDbMessage | undefined) {}

  public get rcDebugMessage(): RcDebugInfoDbMessage | undefined {
    return this._rcDebugMessage;
  }

  set osdHomeMessage(osdHomeMessage: OsdHomeDbMessage | undefined) {}

  public get osdHomeMessage(): OsdHomeDbMessage | undefined {
    return this._osdHomeMessage;
  }

  set flyLogMessage(flyLogMessage: LogDbMessage | undefined) {}

  public get flyLogMessage(): LogDbMessage | undefined {
    return this._flylogMessage;
  }

  set sdLogMessage(sdLogMessage: LogDbMessage | undefined) {}

  public get sdLogMessage(): LogDbMessage | undefined {
    return this._sdLogMessage;
  }

  set file(file: DbFile | null) {}

  public get file(): DbFile | null {
    return this._dbFile;
  }

  set latestMessage(mes: DbMessage | undefined) {}

  public get latestMessage(): DbMessage | undefined {
    return this._latestMessage;
  }


  processFile(): void {
    this._flightDuration = 10;
    let inst = this;
    if (inst._file === null)
      return;

    let jsonText = "";
    let chunk = 0;
    let maxChunk = Math.ceil(inst._file.size / Globals.CHUNK_SIZE);
    let data: any[] = [];

    let jsonFileReader = new FileReader();
    jsonFileReader.onerror = function (event) {throw event;};
    jsonFileReader.onload = async function () {// refactor to not load whole data into RAM?
      if(jsonFileReader.result == "") {
        window.alert("JSON input could not be parsed.\nPlease try rerunning DROP.")
        return;
      }
      let buffer = new Uint8Array(<ArrayBuffer>jsonFileReader.result);
      jsonText += new TextDecoder('utf-8').decode(buffer);

      if(chunk == 0) {
        jsonText = jsonText.substr(1);
      }

      let jsonData = jsonText.split("},").map(j => j + "}");
      if(chunk == maxChunk - 1) {
        jsonData[jsonData.length-1] = jsonData[jsonData.length - 1].substr(0, jsonData[jsonData.length - 1].length - 2);
      }

      for (let i = 0; i < jsonData.length - 1; i++) {// read all entries, except the last, as this might not be completely available
        data.push(JSON.parse(jsonData[i]));
      }
      jsonText = jsonData[jsonData.length - 1];
      jsonText = jsonText.substr(0, jsonText.length - 1);
      if(chunk < maxChunk  - 1) {
        chunk++;
        inst.loadFileChunk(jsonFileReader, chunk);
      } else {
        data.push(JSON.parse(jsonData[jsonData.length - 1]));
        inst.importData(data);
      }
    }
    inst.loadCallback();
    document.dispatchEvent(new CustomEvent("spinnerInfoMessage", {detail: {text: "Importing file: " + inst._file.name}}));
    inst.loadFileChunk(jsonFileReader, chunk);
  }

  private loadFileChunk(fr: FileReader, chunk: number) {
    if(this._file === null)
      return;
    let slice = this._file.slice(chunk * Globals.CHUNK_SIZE, (chunk+1) * Globals.CHUNK_SIZE);
    fr.readAsArrayBuffer(slice);
  }

  private importData(data: any[]) {
    let dataEntryCount = data.length;
    let inst = this;
    if (inst._file === null)
      return;
    // @ts-ignore
    data = data.sort((a: any, b: any) => a.offset < b.offset);
    if(data[0].offset > data[1].offset)
      data.reverse();
    let usonicInd = data.indexOf(data.find((d: any) => d.pktId === 16 && d.usonic_h > (data.find((dt: any) => dt.pktId === 16).usonic_h * 1.1)));
    let usonicTime = data.find((d: any, ind: number) => d.pktId === 2096 && ind > usonicInd).time;
    let productType = data.find((d: any) => d.pktId === 12).product_type;
    let gpsData = data.filter((d: any) => d.pktId === 2096);
    let firstGPSMes = gpsData.find((g: any) => g.latitude !== 0 && g.longitude !== 0);
    let gpsOffset = data.indexOf(firstGPSMes);
    let gpsDataOffset = gpsData.indexOf(firstGPSMes);
    if(gpsDataOffset < 0)
      gpsDataOffset = 0;
    if(gpsOffset < 0)
      gpsOffset = 0;
    gpsData.forEach((g: any) => g.distance = 0);
    let timeSeconds = timeStringToSecs(gpsData[gpsDataOffset].time);
    let time = "";
    if(timeSeconds > 3600) {
      time += Math.floor(timeSeconds/3600) + ":";
    }
    let mins = Math.floor((timeSeconds % 3600)/60);
    time += mins < 10 ? "0" + mins : mins;
    time += ":";
    let secs = Math.floor(timeSeconds%60);
    time += secs < 10 ? "0" + secs : secs;
    let dateString = gpsData[gpsDataOffset+1].date.toString();
    let date = new Date();
    date.setFullYear(parseInt(dateString.substr(0, 4)),
      parseInt(dateString.substr(4,2)),
      parseInt(dateString.substr(6, 2)));
    let altitude = 0;
    if (gpsData[gpsDataOffset]) {
      altitude = gpsData[gpsDataOffset].altitude;
      let distance = 0;
      for (let i = gpsDataOffset; i+1 < gpsData.length; i++) {
        let d1 = gpsData[i], d2 = gpsData[i+1];
        distance += coordinatesToM(d1.latitude, d1.longitude, d2.latitude, d2.longitude);
        d2.distance = distance;
      }
    }
    let latCol = gpsData.map((a: any) => a.latitude);
    latCol = latCol.filter((l: number) => l !== 0);
    let longCol = gpsData.map((a: any) => a.longitude);
    longCol = longCol.filter((l: number) => l !== 0);
    let timeCol: number[] = Array.from(new Set(gpsData.map((a: any) => timeStringToSecs(a.time))));
    let flightTime = timeCol.length;
    for(let i = 0; i < timeCol.length; i++) {
      if(timeCol[i] + 1 < timeCol[i+1]) {
        timeCol = timeCol.slice(i + 1);
        break;
      }
    }
    let seconds = timeCol.length;
    let timeOffset = flightTime - seconds;
    let searchOffset = gpsDataOffset-1;
    if(searchOffset < 0)
      searchOffset = 0;
    let timeUntilGPS = timeStringToSecs(gpsData.find((g, i) => i >= searchOffset && g.date > 0).time) - timeCol[0] + timeOffset;
    let timeUntilTakeOff = timeStringToSecs(usonicTime) - timeCol[0] + timeOffset;
    console.log("number of overall log entries: " + dataEntryCount + " -> " + dataEntryCount/flightTime + " messages/sec");
    console.log(new Date());
    let minLat = Math.min(...latCol);
    let maxLat = Math.max(...latCol);
    let minLong = Math.min(...longCol);
    let matLong = Math.max(...longCol);
    inst.dexieDbService.files.add({
      fileName: inst._file.name,
      messageCount: data.length,
      fileDuration: flightTime,
      flightDuration: seconds,
      startTime: timeCol[0],
      minLatitude: !isFinite(minLat) ? 49.57384629202841 : minLat,
      maxLatitude: !isFinite(maxLat) ? 49.57384629202841 : maxLat,
      minLongitude: !isFinite(minLong) ? 11.02728355453469 : minLong,
      maxLongitude: !isFinite(matLong) ? 11.02728355453469 : matLong,
      altitude: altitude,
      gpsOffset: gpsOffset,
      timeOffset: timeOffset,
      timeUntilGPS: timeUntilGPS,
      timeUntilTakeOff: timeUntilTakeOff,
      flightDate: date.toDateString(),
      flightStartTime: time,
      track: [],
      errors: [],
      productType: productType
    }).then((res: number) => {
      inst.handleDataArray(res, data);
      inst._file = null;
      console.log('created file id: ' + res);
    });
  }

  public selectFile(fileId: number) {
    let file = this.availableFiles.find(a => a.id === fileId);
    if(file === undefined) {
      this._dbFile = null;
      this._fileId = -1;
      this._flightDuration = 0;
      this._gpsMessage = undefined;
      this._controllerMessage = undefined;
      this._uSonicMessage = undefined;
      this._batteryMessage = undefined;
      this._osdGeneralMessage = undefined;
      this._imuAttiMessage = undefined;
      this._recMagMessage = undefined;
      this._escDataMessage = undefined;
      this._motorCtrlMessage = undefined;
      this._osdHomeMessage = undefined;
      this._flylogMessage = undefined;
      this._sdLogMessage = undefined;
      this.fileChanged();
      return;
    }
    this._fileId = file.id;
    this._flightDuration = file.messageCount;
    this._dbFile = file;
    if(this._dbFile.track === undefined || this._dbFile.track.length === 0)
      this.createTrack();
    else
      this.fileChanged();
    console.log(this._dbFile.fileName); //debug
  }

  public loadDbFiles(): void {
    let inst = this;
    this._dbFiles = [];
    this.dexieDbService.files.toArray().then(arr => inst._dbFiles = arr as DbFile[])
      .then(() => inst.fileListChanged());
  }

  public loadMessagesById(messageId: number) {
    if(!this._dbFile)
      return;
    let ct = 0;
    let inst = this;
    function onComplete() {
      ct--;
      if(ct === 0) {// Update if additional message types are added
        inst.loadDbFiles();
        inst.updated();
      }
    }

    ct++;
    this.dexieDbService.gps.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 1000], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._gpsMessage = res.slice(-1).pop();
      if(this._gpsMessage?.messageNum === messageId)
        this._latestMessage = this._gpsMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.battery.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 500], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._batteryMessage = res.slice(-1).pop();
      if(this._batteryMessage?.messageNum === messageId)
        this._latestMessage = this._batteryMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.controller.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 500], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._controllerMessage = res.slice(-1).pop();
      if(this._controllerMessage?.messageNum === messageId)
        this._latestMessage = this._controllerMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.ultrasonic.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 500], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._uSonicMessage = res.slice(-1).pop();
      if(this._uSonicMessage?.messageNum === messageId)
        this._latestMessage = this._uSonicMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.osdGeneral.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 500], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._osdGeneralMessage = res.slice(-1).pop();
      if(this._osdGeneralMessage?.messageNum === messageId)
        this._latestMessage = this._osdGeneralMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.imuAtti.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 500], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._imuAttiMessage = res.slice(-1).pop();
      if(this._imuAttiMessage?.messageNum === messageId)
        this._latestMessage = this._imuAttiMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.recMag.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 500], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._recMagMessage = res.slice(-1).pop();
      if(this._recMagMessage?.messageNum === messageId)
        this._latestMessage = this._recMagMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.escData.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 500], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._escDataMessage = res.slice(-1).pop();
      if(this._escDataMessage?.messageNum === messageId)
        this._latestMessage = this._escDataMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.motorCtrl.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 500], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._motorCtrlMessage = res.slice(-1).pop();
      if(this._motorCtrlMessage?.messageNum === messageId)
        this._latestMessage = this._motorCtrlMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.rcDebug.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 500], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._rcDebugMessage = res.slice(-1).pop();
      if(this._rcDebugMessage?.messageNum === messageId)
        this._latestMessage = this._rcDebugMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.osdHome.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 1000], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._osdHomeMessage = res.slice(-1).pop();
      if(this._osdHomeMessage?.messageNum === messageId)
        this._latestMessage = this._osdHomeMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.flyLog.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 1000], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._flylogMessage = res.slice(-1).pop();
      if(this._flylogMessage?.messageNum === messageId)
        this._latestMessage = this._flylogMessage;
      onComplete();
    });
    ct++;
    this.dexieDbService.sdLog.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 1000], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._sdLogMessage = res.slice(-1).pop();
      if(this._sdLogMessage?.messageNum === messageId)
        this._latestMessage = this._sdLogMessage;
      onComplete();
    });
  }

  public loadMessagesBySecond(second: number) {
    let inst = this;
    if(!inst._dbFile)
      return;
    this.dexieDbService.gps.where('[fileId+second]').equals([inst._dbFile.id, second]).first().then(mes => {
      if(mes === undefined) {
        if(inst._dbFile)
          console.log('GPS message not found for fileId: ' + inst._dbFile.id + ' , second: ' + second);
        return;
      }
      this._gpsMessage = mes;
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
          lastTimeStamp = d.time;
        }
      }
      filteredData[d.pktId].push(d);
    });
    let keys = Object.keys(filteredData);
    let runningImports = 0;
    function completeFunc(key: string) {
      console.log('added ' + filteredData[key].length + ' entries for pktId ' + key);
      if(--runningImports === 0) {
        console.log(new Date());
        console.log("import completed");
        let anomalyAnalyzer = new AnomalyAnalyzer(inst, inst.dexieDbService, fileId);
        anomalyAnalyzer.getFlightErrors((errors: error[]) => {
          inst.dexieDbService.files.update(fileId, {errors: errors}).then(() => {
            inst.loadDbFiles();
            inst.finishLoadingCallback();
          });
        }).then();
      }
    }
    let supportedKeys = this.dexieDbService.getAvailableDatabases().map(d => d.key);
    keys.forEach(key => {
      if(!supportedKeys.includes(key)) {
        console.log("unknown key: " + key);
        return;
      }
      runningImports++;
      let db = this.dexieDbService.getDatabaseForPackageId(key);
      if(db) {
        bulkAddInChunks(db, filteredData[key], 10000, () => completeFunc(key)).then(() => {});
      }
    });
  }

  public deleteFile() {
    let inst = this;
    let ct = 0;
    document.dispatchEvent(new CustomEvent("spinnerInfoMessage", {detail: {text: "Deleting file: " + inst._dbFile?.fileName}}));
    let tables = this.dexieDbService.getAvailableDatabases();
    function complete() {
      ct++;
      if(ct === tables.length) {
        inst._dbFile = null;
        inst.updated();
        inst.loadDbFiles();
        inst.finishLoadingCallback();
      } else if (ct % 4 == 0) {
        deleteNextType();
      }
    }
    function deleteNextType() {
      console.log("[" + new Date() + "] deleting " + ct+1 + "-" + ct+4 + " of " + tables.length)
      tables[ct].database.where('fileId').equals(inst._fileId).delete().then(() => complete());
      if(ct+1 < tables.length)
        tables[ct+1].database.where('fileId').equals(inst._fileId).delete().then(() => complete());
      if(ct+2 < tables.length)
        tables[ct+2].database.where('fileId').equals(inst._fileId).delete().then(() => complete());
      if(ct+3 < tables.length)
        tables[ct+3].database.where('fileId').equals(inst._fileId).delete().then(() => complete());
    }
    inst.loadCallback();
    this.dexieDbService.files.delete(this._fileId).then();
    deleteNextType();
  }

  private createTrack() {
    let inst = this;
    this.dexieDbService.gps.toArray().then(gpsMessages => {
      if(!inst._dbFile)
        return;
      let vertices: any[] = [];
      gpsMessages = gpsMessages.filter(g=>g.fileId === inst._dbFile?.id);
      gpsMessages.forEach((mes, ind) => {
        if((mes.latitude === 0 && mes.longitude === 0) || isNaN(mes.latitude) || isNaN(mes.longitude)) //remove NaN and (0,0)
          return;
        vertices.push({lat: mes.latitude, long: mes.longitude, ind: ind, mesId: mes.id, altitude: mes.altitude,
          speed: Math.sqrt(Math.pow(mes.velE, 2) + Math.pow(mes.velN, 2)), second: mes.second});
      });
      if(vertices.length === 0) {
        window.alert('There are no gps messages in this file.');
        inst.dexieDbService.files.update(inst._dbFile.id, {track: []}).then(() => inst.fileChanged());
        return;
      }
      inst._dbFile.track = vertices;
      inst.dexieDbService.files.update(inst._dbFile.id, {track: vertices}).then(() => inst.fileChanged());
    });
  }

  set lineType(lineTypeNew:LineType) {
    this._lineType = lineTypeNew;
    this.updated();
  }

  get lineType() {
    return this._lineType;
  }
  get anomalyLevel() {
    return this._anomalyLevel;
  }
  set anomalyLevel(val: number) {
    this._anomalyLevel = val;
  }
}

async function bulkAddInChunks (table: Table, objects: any[], chunkSize: number, onComplete: any, pos=0) {
  await table.bulkAdd(objects.slice(pos, pos + chunkSize));
  if (objects.length > pos + chunkSize) {
    await bulkAddInChunks(
      table,
      objects,
      chunkSize,
      onComplete,
      pos + chunkSize
    );
  } else {
    onComplete();
  }
}

function coordinatesToM(lat1: number, lon1: number, lat2: number, lon2: number){  // generally used geo measurement function
  let R = 6378.137; // Radius of earth in KM
  let dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
  let dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
  let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  let d = R * c;
  return d * 1000; // m
}

export interface DroneMapWidget {
  update(): void;
  fileChanged(): void; // Only change file related info, as message will be loaded after this event fired! -> globals.message might be undefined
  fileListChanged(): void;

}

export function timeStringToSecs(timeString: string) {
  let parts = timeString.split(":").map(x => parseInt(x));
  return parts[0]*3600 + parts[1]*60 + parts[2];
}

export enum LineType {
  none,
  time,
  height,
  speed
}

export enum DroneType {
  Inspire_2 = 17,
  Matrice_600 = 23,
  Phantom_4_Advanced = 27
}

