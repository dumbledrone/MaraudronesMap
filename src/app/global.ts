import {Component, Injectable} from "@angular/core";
import {
  BatteryDbMessage,
  ControllerDbMessage,
  DbFile, DroneWebGuiDatabase,
  GpsDbMessage, ImuAttiDbMessage, OsdGeneralDataDbMessage,
  UltrasonicDbMessage
} from "./helpers/DroneWebGuiDatabase";
import Dexie from "dexie";
import Table = Dexie.Table;
import {error} from "@angular/compiler/src/util";
import {DomEvent} from "leaflet";
import off = DomEvent.off;


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
  private _lineType: LineType = LineType.none;

  private constructor(private dexieDbService: DroneWebGuiDatabase) {
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

  set osdGeneralMessage(osdGeneralMessage: OsdGeneralDataDbMessage | undefined) {}

  public get osdGeneralMessage(): OsdGeneralDataDbMessage | undefined {
    return this._osdGeneralMessage;
  }

  set imuAttiMessage(imuAttiMessage: ImuAttiDbMessage | undefined) {}

  public get imuAttiMessage(): ImuAttiDbMessage | undefined {
    return this._imuAttiMessage;
  }

  set file(file: DbFile | null) {}

  public get file(): DbFile | null {
    return this._dbFile;
  }


  processFile(): void {
    this._flightDuration = 10;
    let inst = this;

    let jsonFileReader = new FileReader();
    jsonFileReader.onload = async function () {// refactor to not load whole data into RAM?
      if (inst._file === null)
        return;
      inst.loadCallback();
      let data = JSON.parse(<string>jsonFileReader.result);
      data = data.sort((a: any, b: any) => a.messageid < b.messageid);
      let gpsData = data.filter((d: any) => d.pktId === 2096);
      let gpsOffset = gpsData.indexOf(gpsData.find((g: any) => g.latitude !== 0 && g.longitude !== 0));
      let altitude = 0;
      let firstGpsId = 0;
      if (gpsData[gpsOffset]) {
        altitude = gpsData[gpsOffset].altitude;
        firstGpsId =  gpsData[gpsOffset].messageId;
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
        gpsOffsetId: firstGpsId,
        timeOffset: timeOffset,
        track: []
      }).then((res: number) => {
        inst.loadDbFiles();
        inst.handleDataArray(res, data);
        inst._file = null;
        console.log('created file id: ' + res);
      });

    }
    // @ts-ignore
    jsonFileReader.readAsText(this._file);
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
      ct++;
      if(ct === 6) {// Update if additional message types are added
        inst.loadDbFiles();
        inst.updated();
      }
    }

    this.dexieDbService.gps.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 100], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._gpsMessage = res.slice(-1).pop();
      onComplete();
    });
    this.dexieDbService.battery.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 100], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._batteryMessage = res.slice(-1).pop();
      onComplete();
    });
    this.dexieDbService.controller.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 100], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._controllerMessage = res.slice(-1).pop();
      onComplete();
    });
    this.dexieDbService.ultrasonic.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 100], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._uSonicMessage = res.slice(-1).pop();
      onComplete();
    });
    this.dexieDbService.osdGeneral.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 100], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._osdGeneralMessage = res.slice(-1).pop();
      onComplete();
    });
    this.dexieDbService.imuAtti.where('[fileId+messageNum]')
      .between([this._dbFile.id, messageId - 100], [this._dbFile.id, messageId], true, true)
      .toArray().then(res => {
      this._imuAttiMessage = res.slice(-1).pop();
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
        inst.finishLoadingCallback();
      }
    }
    let supportedKeys = ["2096", "16", "1000", "1710", "12", "1700", "2048"];
    keys.forEach(key => {
      if(!supportedKeys.includes(key))
        return;
      runningImports++;
      switch(key) {
        case "16":
          bulkAddInChunks(inst.dexieDbService.ultrasonic, filteredData[key], 10000,
            () => completeFunc(key)).then(() => {});
          break;
        case "1000":
          bulkAddInChunks(inst.dexieDbService.controller, filteredData[key], 10000,
            () => completeFunc(key)).then(() => {});
          break;
        case "1710":
          bulkAddInChunks(inst.dexieDbService.battery, filteredData[key], 10000,
            () => completeFunc(key)).then(() => {});
          break;
        case "2096":
          bulkAddInChunks(inst.dexieDbService.gps, filteredData[key], 5000,
            () => completeFunc(key)).then(() => {});
          break;
        case "12":
          bulkAddInChunks(inst.dexieDbService.osdGeneral, filteredData[key], 5000,
            () => completeFunc(key)).then(() => {});
          break;
        case "1700":
          bulkAddInChunks(inst.dexieDbService.rcDebug, filteredData[key], 5000,
            () => completeFunc(key)).then(() => {});
          break;
        case "2048":
          bulkAddInChunks(inst.dexieDbService.imuAtti, filteredData[key], 5000,
            () => completeFunc(key)).then(() => {});
          break;
      }
    });
  }

  public deleteFile() {
    let inst = this;
    let ct = 0;
    function complete() {
      ct++;
      if(ct === 6) {// Update if additional message types are added
        inst._dbFile = null;
        inst.updated();
        inst.loadDbFiles();
        inst.finishLoadingCallback();
      }
    }
    inst.loadCallback();
    this.dexieDbService.files.delete(this._fileId).then();
    this.dexieDbService.gps.where('fileId').equals(this._fileId).delete().then(() => complete());
    this.dexieDbService.controller.where('fileId').equals(this._fileId).delete().then(() => complete());
    this.dexieDbService.battery.where('fileId').equals(this._fileId).delete().then(() => complete());
    this.dexieDbService.ultrasonic.where('fileId').equals(this._fileId).delete().then(() => complete());
    this.dexieDbService.osdGeneral.where('fileId').equals(this._fileId).delete().then(() => complete());
    this.dexieDbService.rcDebug.where('fileId').equals(this._fileId).delete().then(() => complete());
    this.dexieDbService.imuAtti.where('fileId').equals(this._fileId).delete().then(() => complete());
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
          speed: Math.sqrt(Math.pow(mes.velE, 2) + Math.pow(mes.velN, 2))});
      });
      if(vertices.length === 0) {
        window.alert('There are no gps messages in this file.');
        inst.dexieDbService.files.update(inst._dbFile.id, {track: []}).then(() => inst.fileChanged());
        return;
      }
      this.smoothTrack(vertices, gpsMessages.length);
      inst._dbFile.track = vertices;
      inst.dexieDbService.files.update(inst._dbFile.id, {track: vertices}).then(() => inst.fileChanged());
    });
  }
  smoothTrack(vertices: any[], gpsMessagesLength: number){
      //maybeTodo: smoothen line
      let edges: any[] = [];
      //compute edges
      let changed: boolean = true;
      for (let i = 0; i < gpsMessagesLength && changed; i++) {
        changed = false;
        //compute angle = Steigung m
        //if angle difference < sthConst delete earlier one --> update edges
        //if deleted: changed = true;
        //never delete first

      }
      //maybeTodo maybe take only every fifth
      //maybeTodo finally: set indices without spaces

  }

  set lineType(lineTypeNew:LineType) {
    this._lineType = lineTypeNew;
    this.updated();
  }

  get lineType() {
    return this._lineType;
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


