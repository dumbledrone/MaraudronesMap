import Dexie, {Table} from 'dexie';

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
  imuAtti: Dexie.Table<ImuAttiDbMessage, number>;
  recMag: Dexie.Table<RecMagDbMessage, number>;

  constructor () {
    super("DroneWebGuiDatabase");
    this.version(1).stores({
      files: '++id, fileName',
      gps: '++id, fileId, messageId, [fileId+messageNum], [fileId+second]',
      controller: '++id, fileId, [fileId+messageNum]',
      battery: '++id, fileId, [fileId+messageNum]',
      ultrasonic: '++id, fileId, [fileId+messageNum]',
      osdGeneral: '++id, fileId, [fileId+messageNum]',
      rcDebug: '++id, fileId, [fileId+messageNum]',
      imuAttiDbMessage: '++id, fileId, [fileId+messageNum]',
      recMag: '++id, fileId, [fileId+messageNum]',
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
    this.imuAtti = this.table("imuAttiDbMessage");
    this.imuAtti.mapToClass(ImuAttiDbMessage);
    this.recMag = this.table("recMag");
    this.recMag.mapToClass(RecMagDbMessage);
  }

  public getDatabaseForPackageId(key: string): Table | null {
    switch(key) {
      case "12":
        return this.osdGeneral;
      case "16":
        return this.ultrasonic;
      case "1000":
        return this.controller;
      case "1700":
        return this.rcDebug;
      case "1710":
        return this.battery;
      case "2048":
        return this.imuAtti;
      case "2096":
        return this.gps;
      case "2256":
        return this.recMag;
    }
    return null;
  }

  public getAvailableDatabases(): DbInfo[] {
    return [
      {key: "12", database: this.osdGeneral},
      {key: "16", database: this.ultrasonic},
      {key: "1000", database: this.controller},
      {key: "1700", database: this.rcDebug},
      {key: "1710", database: this.battery},
      {key: "2048", database: this.imuAtti},
      {key: "2096", database: this.gps},
      {key: "2256", database: this.recMag}
    ];
  }
}

interface DbInfo {
  key: string;
  database: Table;
}

interface IDbFile {
  fileName: string;
  messageCount: number;
  fileDuration: number;
  flightDuration: number;
  startTime: number;
  id?: number;
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
  altitude: number;
  gpsOffset: number;
  gpsOffsetId: number;
  timeOffset: number;
  track: any[];
}

export class DbFile {
  public fileName: string;
  public messageCount: number;
  public flightDuration: number;
  public fileDuration: number;
  public startTime: number;
  public id!: number;
  public minLatitude: number;
  public maxLatitude: number;
  public minLongitude: number;
  public maxLongitude: number;
  public altitude: number;
  public gpsOffset: number;
  public gpsOffsetId: number;
  public timeOffset: number;
  public track: any[];

  constructor(fileName: string, messageCount: number, flightDuration: number, startTime: number, id: number,
              minLatitude: number, maxLatitude: number, minLongitude: number, maxLongitude: number, altitude: number,
              gpsOffset: number, track: any[], fileDuration: number, timeOffset: number, gpsOffsetId: number) {
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
    this.fileDuration = fileDuration;
    this.timeOffset = timeOffset;
    this.gpsOffsetId = gpsOffsetId;
  }
}

export class DbMessage {
  id: number;
  fileId: number;
  messageNum: number;
  offset: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number){
    this.id = id;
    this.fileId = fileId;
    this.messageNum = messageNum;
    this.offset = offset;
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
  time: string;
  distance: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, longitude: number, latitude: number, altitude: number,
              numGPS: number, second: number, velD: number, velE: number, velN: number, time: string, distance: number) {
    super(id, fileId, messageNum, offset);
    this.longitude = longitude;
    this.latitude = latitude;
    this.altitude = altitude;
    this.numGPS = numGPS;
    this.second = second;
    this.velD = velD;
    this.velE = velE;
    this.velN = velN;
    this.time = time;
    this.distance = distance;
  }
}

export class ControllerDbMessage extends DbMessage {
  ctrl_tick: number;
  ctrl_pitch: number;
  ctrl_roll: number;
  ctrl_yaw: number;
  ctrl_thr: number;
  ctrl_mode: number;
  mode_switch: number;
  motor_state: number;
  sig_level: number;
  ctrl_level: number;
  sim_model: number;
  max_height: number;
  max_radius: number;
  D2H_x: number;
  D2H_y: number;
  act_req_id: number;
  act_act_id: number;
  cmd_mod: number;
  mod_req_id: number;
  fw_flag: number;
  mot_sta: number;
  OH_take: number;
  rc_cnt: number;
  sup_rc: number;


  constructor(id: number, fileId: number, messageNum: number, offset: number, ctrl_pitch: number, ctrl_tick: number, ctrl_roll: number, ctrl_yaw: number, ctrl_thr: number,
              ctrl_mode: number, mode_switch: number, motor_state: number, sig_level: number, ctrl_level: number, sim_model: number,
              max_height: number, max_radius: number, D2H_x: number, D2H_y: number, act_req_id: number, act_act_id: number, cmd_mod: number,
              mod_req_id: number, fw_flag: number, mot_sta: number, OH_take: number, rc_cnt: number, sup_rc: number) {
    super(id, fileId, messageNum, offset);
    this.ctrl_tick = ctrl_tick;
    this.ctrl_pitch = ctrl_pitch;
    this.ctrl_roll = ctrl_roll;
    this.ctrl_yaw = ctrl_yaw;
    this.ctrl_thr = ctrl_thr;
    this.ctrl_mode = ctrl_mode;
    this.mode_switch = mode_switch;
    this.motor_state = motor_state;
    this.sig_level = sig_level;
    this.ctrl_level = ctrl_level;
    this.sim_model = sim_model;
    this.max_height = max_height;
    this.max_radius = max_radius;
    this.D2H_x = D2H_x;
    this.D2H_y = D2H_y;
    this.act_req_id = act_req_id;
    this.act_act_id = act_act_id;
    this.cmd_mod = cmd_mod;
    this.mod_req_id = mod_req_id;
    this.fw_flag = fw_flag;
    this.mot_sta = mot_sta;
    this.OH_take = OH_take;
    this.rc_cnt = rc_cnt;
    this.sup_rc = sup_rc;
  }
}

export class BatteryDbMessage extends DbMessage {
  cap_per: number;
  temp: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, cap_per: number, temp: number) {
    super(id, fileId, messageNum, offset);
    this.cap_per = cap_per;
    this.temp = temp;
  }
}

export class UltrasonicDbMessage extends DbMessage {
  usonic_h: number;
  usonic_flag: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, usonic_h: number, usonic_flag: number) {
    super(id, fileId, messageNum, offset);
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

  constructor(id: number, fileId: number, messageNum: number, offset: number, longtitude: number, latitude: number, relative_height: number,
              vgx: number, vgy: number, vgz: number, pitch: number, roll: number, yaw: number, mode1: number, latest_cmd: number,
              controller_state: number, gps_nums: number, gohome_landing_reason: number, start_fail_reason: number,
              controller_state_ext: number, ctrl_tick: number, ultrasonic_height: number, motor_startup_time: number,
              motor_startup_times: number, bat_alarm1: number, bat_alarm2: number, version_match: number,
              product_type: number, imu_init_fail_reason: number, stop_motor_reason: number, motor_start_error_code: number,
              sdk_ctrl_dev: number, yaw_rate: number) {
    super(id, fileId, messageNum, offset);
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

  constructor(id: number, fileId: number, messageNum: number, offset: number, cur_cmd: number, fail_safe: number, vedio_lost: number,
              data_lost: number, app_lost: number, frame_lost: number, rec_cnt: number, sky_con: number,
              gnd_con: number, connected: number, m_changed: number, arm_status: number, wifi_en: number,
              in_wifi: number) {
    super(id, fileId, messageNum, offset);
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

export class ImuAttiDbMessage extends DbMessage {
  longRad: number;
  latRad: number;
  longitudeDegrees: number;
  latitudeDegrees: number;
  baroPress: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  baroAlti: number;
  quatW: number;
  quatX: number;
  quatY: number;
  quatZ: number;
  ag_X: number;
  ag_Y: number;
  ag_Z: number;
  velN: number;
  velE: number;
  velD: number;
  gb_X: number;
  gb_Y: number;
  gb_Z: number;
  magX: number;
  magY: number;
  magZ: number;
  imuTemp: number;
  ty: number;
  tz: number;
  sensor_stat: number;
  filter_stat: number;
  numSats: number;
  atti_cnt: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, longRad: number, latRad: number, longitudeDegrees: number,
              latitudeDegrees: number, baroPress: number, accelX: number, accelY: number, accelZ: number, gyroX: number,
              gyroY: number, gyroZ: number, baroAlti: number, quatW: number, quatX: number, quatY: number, quatZ: number,
              ag_X: number, ag_Y: number, ag_Z: number, velN: number, velE: number, velD: number, gb_X: number,
              gb_Y: number, gb_Z: number, magX: number, magY: number, magZ: number, imuTemp: number, ty: number,
              tz: number, sensor_stat: number, filter_stat: number, numSats: number, atti_cnt: number) {
    super(id, fileId, messageNum, offset);
    this.longRad = longRad;
    this.latRad = latRad;
    this.longitudeDegrees = longitudeDegrees;
    this.latitudeDegrees = latitudeDegrees;
    this.baroPress = baroPress;
    this.accelX = accelX;
    this.accelY = accelY;
    this.accelZ = accelZ;
    this.gyroX = gyroX;
    this.gyroY = gyroY;
    this.gyroZ = gyroZ;
    this.baroAlti = baroAlti;
    this.quatW = quatW;
    this.quatX = quatX;
    this.quatY = quatY;
    this.quatZ = quatZ;
    this.ag_X = ag_X;
    this.ag_Y = ag_Y;
    this.ag_Z = ag_Z;
    this.velN = velN;
    this.velE = velE;
    this.velD = velD;
    this.gb_X = gb_X;
    this.gb_Y = gb_Y;
    this.gb_Z = gb_Z;
    this.magX = magX;
    this.magY = magY;
    this.magZ = magZ;
    this.imuTemp = imuTemp;
    this.ty = ty;
    this.tz = tz;
    this.sensor_stat = sensor_stat;
    this.filter_stat = filter_stat;
    this.numSats = numSats;
    this.atti_cnt = atti_cnt;
  }
}

export class RecMagDbMessage extends DbMessage {
  magX: number;
  magY: number;
  magZ: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, magX: number, magY: number, magZ: number) {
    super(id, fileId, messageNum, offset);
    this.magX = magX;
    this.magY = magY;
    this.magZ = magZ;
  }
}
