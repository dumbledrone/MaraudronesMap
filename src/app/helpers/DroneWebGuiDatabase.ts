import Dexie from 'dexie';

export class DroneWebGuiDatabase extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  files: Dexie.Table<IDbFile, number>;
  gps: Dexie.Table<GpsDbMessage, number>;
  controller: Dexie.Table<ControllerDbMessage, number>;
  battery: Dexie.Table<BatteryDbMessage, number>;
  ultrasonic: Dexie.Table<UltrasonicDbMessage, number>;
  osdGeneral: Dexie.Table<OsdGeneralDataDbMessage, number>;
  rcDebug: Dexie.Table<RcDebugInfoDbMessage, number>;

  constructor () {
    super("DroneWebGuiDatabase");
    this.version(1).stores({
      files: '++id, fileName',
      gps: '++id, fileId, [fileId+messageNum], [fileId+second]',
      controller: '++id, fileId, [fileId+messageNum]',
      battery: '++id, fileId, [fileId+messageNum]',
      ultrasonic: '++id, fileId, [fileId+messageNum]',
      osdGeneral: '++id, fileId, [fileId+messageNum]',
      rcDebug: '++id, fileId, [fileId+messageNum]',
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
    this.osdGeneral = this.table("osdGeneral");
    this.osdGeneral.mapToClass(OsdGeneralDataDbMessage);
    this.rcDebug = this.table("rcDebug");
    this.rcDebug.mapToClass(RcDebugInfoDbMessage);
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

export class OsdGeneralDataDbMessage extends DbMessage {
  longtitude: number;
  latitude: number;
  relative_height: number;
  vgx: number;
  vgy: number;
  vgz: number;
  pitch: number;
  roll: number;
  yaw: number;
  mode1: number;
  latest_cmd: number;
  controller_state: number;
  gps_nums: number;
  gohome_landing_reason: number;
  start_fail_reason: number;
  controller_state_ext: number;
  ctrl_tick: number;
  ultrasonic_height: number;
  motor_startup_time: number;
  motor_startup_times: number;
  bat_alarm1: number;
  bat_alarm2: number;
  version_match: number;
  product_type: number;
  imu_init_fail_reason: number;
  stop_motor_reason: number;
  motor_start_error_code: number;
  sdk_ctrl_dev: number;
  yaw_rate: number;

  constructor(id: number, fileId: number, messageNum: number, longtitude: number, latitude: number, relative_height: number,
              vgx: number, vgy: number, vgz: number, pitch: number, roll: number, yaw: number, mode1: number, latest_cmd: number,
              controller_state: number, gps_nums: number, gohome_landing_reason: number, start_fail_reason: number,
              controller_state_ext: number, ctrl_tick: number, ultrasonic_height: number, motor_startup_time: number,
              motor_startup_times: number, bat_alarm1: number, bat_alarm2: number, version_match: number,
              product_type: number, imu_init_fail_reason: number, stop_motor_reason: number, motor_start_error_code: number,
              sdk_ctrl_dev: number, yaw_rate: number) {
    super(id, fileId, messageNum);
    this.longtitude = longtitude;
    this.latitude = latitude;
    this.relative_height = relative_height;
    this.vgx = vgx;
    this.vgy = vgy;
    this.vgz = vgz;
    this.pitch = pitch;
    this.roll = roll;
    this.yaw = yaw;
    this.mode1 = mode1;
    this.latest_cmd = latest_cmd;
    this.controller_state = controller_state;
    this.gps_nums = gps_nums;
    this.gohome_landing_reason = gohome_landing_reason;
    this.start_fail_reason = start_fail_reason;
    this.controller_state_ext = controller_state_ext;
    this.ctrl_tick = ctrl_tick;
    this.ultrasonic_height = ultrasonic_height;
    this.motor_startup_time = motor_startup_time;
    this.motor_startup_times = motor_startup_times;
    this.bat_alarm1 = bat_alarm1;
    this.bat_alarm2 = bat_alarm2;
    this.version_match = version_match;
    this.product_type = product_type;
    this.imu_init_fail_reason = imu_init_fail_reason;
    this.stop_motor_reason = stop_motor_reason;
    this.motor_start_error_code = motor_start_error_code;
    this.sdk_ctrl_dev = sdk_ctrl_dev;
    this.yaw_rate = yaw_rate;
  }
}

export class RcDebugInfoDbMessage extends DbMessage  {
  cur_cmd: number;
  fail_safe: number;
  vedio_lost: number;
  data_lost: number;
  app_lost: number;
  frame_lost: number;
  rec_cnt: number;
  sky_con: number;
  gnd_con: number;
  connected: number;
  m_changed: number;
  arm_status: number;
  wifi_en: number;
  in_wifi: number;

  constructor(id: number, fileId: number, messageNum: number, cur_cmd: number, fail_safe: number, vedio_lost: number,
              data_lost: number, app_lost: number, frame_lost: number, rec_cnt: number, sky_con: number,
              gnd_con: number, connected: number, m_changed: number, arm_status: number, wifi_en: number,
              in_wifi: number) {
    super(id, fileId, messageNum);
    this.cur_cmd = cur_cmd;
    this.fail_safe = fail_safe;
    this.vedio_lost = vedio_lost;
    this.data_lost = data_lost;
    this.app_lost = app_lost;
    this.frame_lost = frame_lost;
    this.rec_cnt = rec_cnt;
    this.sky_con = sky_con;
    this.gnd_con = gnd_con;
    this.connected = connected;
    this.m_changed = m_changed;
    this.arm_status = arm_status;
    this.wifi_en = wifi_en;
    this.in_wifi = in_wifi;
  }
}
