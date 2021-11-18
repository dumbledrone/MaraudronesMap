import {Component, Injectable} from "@angular/core";
import {
  BatteryDbMessage,
  ControllerDbMessage,
  DbFile, DroneWebGuiDatabase,
  GpsDbMessage,
  UltrasonicDbMessage
} from "./helpers/DroneWebGuiDatabase";
import Dexie from "dexie";
import Table = Dexie.Table;


@Injectable({
  providedIn: 'root',
})
export class Globals {
  loadCallback = () => {};
  finishLoadingCallback = () => {};

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

  set file(file: DbFile) {}

  public get file(): DbFile {
    return this._dbFile;
  }


  processFile(): void {
    this._flightDuration = 10;
    let inst = this;

    let jsonFileReader = new FileReader();
    jsonFileReader.onload = async function () {// TODO refactor to not load whole data into RAM
      if (inst._file === null)
        return;
      inst.loadCallback();
      let data = JSON.parse(<string>jsonFileReader.result);
      data = data.sort((a: any, b: any) => a.messageid < b.messageid);
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
      inst.dexieDbService.files.add({ // TODO offset
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
      }).then((res: number) => {
        inst.loadDbFiles();
        inst.handleDataArray(res, data);
        inst._file = null;
        console.log('created file id: ' + res);
      })

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
    console.log("_selected file: " + file.fileName + " (" + file.id + ")");
    this.fileChanged();
  }

  public loadDbFiles(): void {
    let inst = this;
    this._dbFiles = [];
    this.dexieDbService.files.toArray().then(arr => inst._dbFiles = arr as DbFile[])
      .then(() => inst.fileListChanged());
  }

  public loadMessagesById(messageId: number) {
    let ct = 0;
    let inst = this;
    function onComplete() {
      ct++;
      if(ct === 4) {// Update if additional message types are added
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
  }

  public loadMessagesBySecond(second: number) {
    let inst = this;
    this.dexieDbService.gps.where('[fileId+second]').equals([inst._dbFile.id, second]).first().then(mes => {
      if(mes === undefined) {
        console.log('GPS message not found for fileId: ' + inst._dbFile.id + ' , second: ' + second);
        return;
      }
      this._gpsMessage = mes;
      this.loadMessagesById(this._gpsMessage.messageNum);
    });
  }

  private handleDataArray(fileId: number, data: any[]) {// TODO update
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
    function completeFunc(key: string) {
      console.log('added ' + filteredData[key].length + ' entries for pktId ' + key);
      if(--runningImports === 0) {
        console.log(new Date());
        console.log("import completed");
        inst.finishLoadingCallback();
      }
    }
    keys.forEach(key => {
      // console.log(filteredData[key][0]);
      if(key !== "2096" && key !== "16" && key !== "1000" && key !== "1710")
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
      }
    });
  }

    }
    this.dexieDbService.files.delete(this._fileId).then();
    this.dexieDbService.gps.where('fileId').equals(this._fileId).delete().then(() => complete());
    this.dexieDbService.controller.where('fileId').equals(this._fileId).delete().then(() => complete());
    this.dexieDbService.battery.where('fileId').equals(this._fileId).delete().then(() => complete());
    this.dexieDbService.ultrasonic.where('fileId').equals(this._fileId).delete().then(() => complete());
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

function timeStringToSecs(timeString: string) {
  let parts = timeString.split(":").map(x => parseInt(x));
  return parts[0]*24 + parts[1]*60 + parts[2];
}
