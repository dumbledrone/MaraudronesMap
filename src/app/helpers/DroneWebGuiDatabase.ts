import Dexie from 'dexie';

export class DroneWebGuiDatabase extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  files: Dexie.Table<IDbFile, number>;
  gps: Dexie.Table<GpsDbMessage, number>;
  controller: Dexie.Table<ControllerDbMessage, number>;
  battery: Dexie.Table<BatteryDbMessage, number>;
  ultrasonic: Dexie.Table<UltrasonicDbMessage, number>;

  constructor () {
    super("DroneWebGuiDatabase");
    this.version(1).stores({
      files: '++id, fileName',
      gps: '++id, fileId, [fileId+messageNum], [fileId+second]',
      controller: '++id, fileId, [fileId+messageNum]',
      battery: '++id, fileId, [fileId+messageNum]',
      ultrasonic: '++id, fileId, [fileId+messageNum]',
    });
    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    this.files = this.table("files");
    this.files.mapToClass(DbFile);
    this.gps = this.table("gps");
    this.gps.mapToClass(GpsDbMessage);
    this.controller = this.table("controller");
    this.controller.mapToClass(ControllerDbMessage);
    this.battery = this.table("battery");
    this.battery.mapToClass(BatteryDbMessage);
    this.ultrasonic = this.table("ultrasonic");
    this.ultrasonic.mapToClass(UltrasonicDbMessage);
  }
}

interface IDbFile {
  fileName: string;
  messageCount: number;
  flightDuration: number;
  startTime: number;
  id?: number;
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
  altitude: number;
  gpsOffset: number;
  track: any[];
}

export class DbFile {
  public fileName: string;
  public messageCount: number;
  public flightDuration: number;
  public startTime: number;
  public id!: number;
  public minLatitude: number;
  public maxLatitude: number;
  public minLongitude: number;
  public maxLongitude: number;
  public altitude: number;
  public gpsOffset: number;
  public track: any[];

  constructor(fileName: string, messageCount: number, flightDuration: number, startTime: number, id: number,
              minLatitude: number, maxLatitude: number, minLongitude: number, maxLongitude: number, altitude: number,
              gpsOffset: number, track: any[]) {
    this.fileName = fileName;
    this.messageCount = messageCount;
    this.flightDuration = flightDuration;
    this.startTime = startTime;
    this.id = id;
    this.minLatitude = minLatitude;
    this.maxLatitude = maxLatitude;
    this.minLongitude = minLongitude;
    this.maxLongitude = maxLongitude;
    this.altitude = altitude;
    this.gpsOffset = gpsOffset;
    this.track = track;
  }
}

export class DbMessage {
  id: number;
  fileId: number;
  messageNum: number;

  constructor(id: number, fileId: number, messageNum: number){
    this.id = id;
    this.fileId = fileId;
    this.messageNum = messageNum;
  }
}

export class GpsDbMessage extends DbMessage {
  longitude: number;
  latitude: number;
  altitude: number;
  numGPS: number;
  second: number;
  velD: number;
  velE: number;
  velN: number;

  constructor(id: number, fileId: number, messageNum: number, longitude: number, latitude: number, altitude: number,
              numGPS: number, second: number, velD: number, velE: number, velN: number) {
    super(id, fileId, messageNum);
    this.longitude = longitude;
    this.latitude = latitude;
    this.altitude = altitude;
    this.numGPS = numGPS;
    this.second = second;
    this.velD = velD;
    this.velE = velE;
    this.velN = velN;
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
