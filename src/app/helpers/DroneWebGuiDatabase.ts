import Dexie, {Table} from 'dexie';
import {error} from "../widget/anomaly/anomaly.component";

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
  escData: Dexie.Table<EscDataDbMessage, number>;
  motorCtrl: Dexie.Table<MotorCtrlDbMessage, number>;
  osdHome: Dexie.Table<OsdHomeDbMessage, number>;
  flyLog: Dexie.Table<LogDbMessage, number>;
  sdLog: Dexie.Table<LogDbMessage, number>;
  moduleNameLog: Dexie.Table<LogDbMessage, number>;
  recDefsLog: Dexie.Table<LogDbMessage, number>;
  sysConfigLog: Dexie.Table<LogDbMessage, number>;

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
      escData: '++id, fileId, [fileId+messageNum]',
      motorCtrl: '++id, fileId, [fileId+messageNum]',
      osdHome: '++id, fileId, [fileId+messageNum]',
      flyLog: '++id, fileId, [fileId+messageNum]',
      sdLog: '++id, fileId, [fileId+messageNum]',
      moduleNameLog: '++id, fileId, [fileId+messageNum]',
      recDefsLog: '++id, fileId, [fileId+messageNum]',
      sysConfigLog: '++id, fileId, [fileId+messageNum]',
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
    this.escData = this.table("escData");
    this.escData.mapToClass(EscDataDbMessage);
    this.motorCtrl = this.table("motorCtrl");
    this.motorCtrl.mapToClass(MotorCtrlDbMessage);
    this.osdHome = this.table("osdHome");
    this.osdHome.mapToClass(OsdHomeDbMessage);
    this.flyLog = this.table("flyLog");
    this.flyLog.mapToClass(LogDbMessage);
    this.sdLog = this.table("sdLog");
    this.sdLog.mapToClass(LogDbMessage);
    this.moduleNameLog = this.table("moduleNameLog");
    this.moduleNameLog.mapToClass(LogDbMessage);
    this.recDefsLog = this.table("recDefsLog");
    this.recDefsLog.mapToClass(LogDbMessage);
    this.sysConfigLog = this.table("sysConfigLog");
    this.sysConfigLog.mapToClass(LogDbMessage);
  }

  public getDatabaseForPackageId(key: string): Table | null {
    switch(key) {
      case "12":
        return this.osdGeneral;
      case "13":
        return this.osdHome;
      case "16":
        return this.ultrasonic;
      case "1000":
        return this.controller;
      case "1307":
        return this.motorCtrl;
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
      case "10090":
        return this.escData;
      case "32768":
        return this.flyLog;
      case "65280":
        return this.sdLog;
      case "65532":
        return this.moduleNameLog;
      case "65533":
        return this.recDefsLog;
      case "65535":
        return this.sysConfigLog;
    }
    return null;
  }

  public getAvailableDatabases(): DbInfo[] {
    return [
      {key: "12", database: this.osdGeneral, attrs: ['longtitude', 'latitude', 'relative_height', 'vgx', 'vgy', 'vgz',
          'pitch', 'roll', 'yaw', 'mode1', 'latest_cmd', 'controller_state', 'gps_nums', 'gohome_landing_reason',
          'start_fail_reason', 'controller_state_ext', 'ctrl_tick', 'ultrasonic_height', 'motor_startup_time',
          'motor_startup_times', 'bat_alarm1', 'bat_alarm2', 'version_match', 'product_type',
          'imu_init_fail_reason', 'stop_motor_reason', 'motor_start_error_code', 'sdk_ctrl_dev', 'yaw_rate']},
      {key: "13", database: this.osdHome, attrs: ['osd_lon','osd_lat','osd_alt','osd_home_state','fixed_altitude',
          'course_lock_torsion']},
      {key: "16", database: this.ultrasonic, attrs: ['usonic_h', 'usonic_flag', 'usonic_cnt']},
      {key: "1000", database: this.controller, attrs: ['ctrl_tick', 'ctrl_pitch', 'ctrl_roll', 'ctrl_yaw', 'ctrl_thr',
          'ctrl_mode', 'mode_switch', 'motor_state', 'sig_level', 'ctrl_level', 'sim_model', 'max_height', 'max_radius',
          'D2H_x', 'D2H_y', 'act_req_id', 'act_act_id', 'cmd_mod', 'mod_req_id', 'fw_flag', 'mot_sta', 'OH_take',
          'rc_cnt', 'sup_rc']},
      {key: "1700", database: this.rcDebug, attrs: ['cur_cmd', 'fail_safe', 'vedio_lost', 'data_lost', 'app_lost',
          'frame_lost', 'rec_cnt', 'sky_con', 'gnd_con', 'connected', 'm_changed', 'arm_status', 'wifi_en', 'in_wifi']},
      {key: "1710", database: this.battery, attrs: ['ad_v', 'r_time', 'ave_I', 'vol_t', 'pack_ve', 'I', 'r_cap',
          'cap_per', 'temp', 'right', 'l_cell', 'dyna_cnt', 'f_cap', 'out_ctl', 'out_ctl_f']},
      {key: "2048", database: this.imuAtti, attrs: ['longRad', 'latRad', 'longitudeDegrees', 'latitudeDegrees',
          'baroPress', 'accelX', 'accelY', 'accelZ', 'gyroX', 'gyroY', 'gyroZ', 'baroAlti', 'quatW', 'quatX', 'quatY',
          'quatZ', 'ag_X', 'ag_Y', 'ag_Z', 'velN', 'velE', 'velD', 'gb_X', 'gb_Y', 'gb_Z', 'magX', 'magY', 'magZ',
          'imuTemp', 'ty', 'tz', 'sensor_stat', 'filter_stat', 'numSats', 'atti_cnt']},
      {key: "2096", database: this.gps, attrs: ['latitude', 'longitude', 'altitude', 'velN', 'velE', 'velD', 'date',
          'time', 'hdop', 'pdop', 'hacc', 'sacc', 'numGPS', 'numGLN', 'numSV']},
      {key: "2256", database: this.recMag, attrs: ['magX', 'magY', 'magZ']},
      {key: "10090", database: this.escData, attrs: ['rfStatus', 'rfCurrent', 'rfSpeed', 'rfVolts', 'rfTemp',
          'rfPPM_recv', 'rfV_out', 'rfPPM_send', 'lfStatus', 'lfCurrent', 'lfSpeed', 'lfVolts', 'lfTemp', 'lfPPM_recv',
          'lfV_out', 'lfPPM_send', 'lbStatus', 'lbCurrent', 'lbSpeed', 'lbVolts', 'lbTemp', 'lbPPM_recv', 'lbV_out',
          'lbPPM_send', 'rbStatus', 'rbCurrent', 'rbSpeed', 'rbVolts', 'rbTemp', 'rbPPM_recv', 'rbV_out', 'rbPPM_send']},
      {key: "1307", database: this.motorCtrl, attrs: ['pwm1','pwm2','pwm3','pwm4','pwm5','pwm6','pwm7','pwm8']},
      {key: "32768", database: this.flyLog, attrs: ['text']},
      {key: "65280", database: this.sdLog, attrs: ['text']},
      {key: "65532", database: this.moduleNameLog, attrs: ['text']},
      {key: "65533", database: this.recDefsLog, attrs: ['text']},
      {key: "65535", database: this.sysConfigLog, attrs: ['text']}
    ];
  }
}

export interface DbInfo {
  key: string;
  database: Table;
  attrs: string[];
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
  timeOffset: number;
  timeUntilGPS: number;
  timeUntilTakeOff: number;
  flightDate: string;
  flightStartTime: string;
  track: any[];
  errors: error[];
  productType: number;
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
  public timeOffset: number;
  public timeUntilGPS: number;
  public timeUntilTakeOff: number;
  public flightDate: string;
  public flightStartTime: string;
  public track: any[];
  public errors: error[];
  public productType: number;

  constructor(fileName: string, messageCount: number, flightDuration: number, startTime: number, id: number,
              minLatitude: number, maxLatitude: number, minLongitude: number, maxLongitude: number, altitude: number,
              gpsOffset: number, track: any[], fileDuration: number, timeOffset: number, timeUntilGPS: number,
              timeUntilTakeOff: number, flightDate: string, flightStartTime: string, errors: error[], productType: number) {
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
    this.timeOffset = timeOffset;
    this.timeUntilGPS = timeUntilGPS;
    this.timeUntilTakeOff = timeUntilTakeOff;
    this.flightDate = flightDate;
    this.flightStartTime = flightStartTime;
    this.errors = errors;
    this.productType = productType;
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
  ad_v: number;
  r_time: number; // TODO calculated time left
  ave_I: number;
  vol_t: number;
  pack_ve: number
  I: number;
  r_cap: number;
  right: number;
  l_cell: number;
  dyna_cnt: number;
  f_cap: number;
  out_ctl: number;
  out_ctl_f: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, cap_per: number, temp: number,
              ad_v: number, r_time: number, ave_I: number, vol_t: number, pack_ve: number, r_cap: number, l_cell: number,
              dyna_cnt: number, f_cap: number, out_ctl: number, out_ctl_f: number, I: number, right: number) {
    super(id, fileId, messageNum, offset);
    this.cap_per = cap_per;
    this.temp = temp;
    this.ad_v = ad_v;
    this.r_time = r_time;
    this.ave_I = ave_I;
    this.vol_t = vol_t;
    this.pack_ve = pack_ve;
    this.I = I;
    this.r_cap = r_cap;
    this.right = right;
    this.l_cell = l_cell;
    this.dyna_cnt = dyna_cnt;
    this.f_cap = f_cap;
    this.out_ctl = out_ctl;
    this.out_ctl_f = out_ctl_f;
  }
}

export class UltrasonicDbMessage extends DbMessage {
  usonic_h: number;
  usonic_flag: number;
  usonic_cnt: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, usonic_h: number, usonic_flag: number,
              usonic_cnt: number) {
    super(id, fileId, messageNum, offset);
    this.usonic_h = usonic_h;
    this.usonic_flag = usonic_flag;
    this.usonic_cnt = usonic_cnt;
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
  motor_startup_time: number; // Time the motor was on
  motor_startup_times: number; // #times the motor was started
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

export class EscDataDbMessage extends DbMessage {
  rfStatus: number;
  rfCurrent: number;
  rfSpeed: number;
  rfVolts: number;
  rfTemp: number;
  rfPPM_recv: number;
  rfV_out: number;
  rfPPM_send: number;
  lfStatus: number;
  lfCurrent: number;
  lfSpeed: number;
  lfVolts: number;
  lfTemp: number;
  lfPPM_recv: number;
  lfV_out: number;
  lfPPM_send: number;
  lbStatus: number;
  lbCurrent: number;
  lbSpeed: number;
  lbVolts: number;
  lbTemp: number;
  lbPPM_recv: number;
  lbV_out: number;
  lbPPM_send: number;
  rbStatus: number;
  rbCurrent: number;
  rbSpeed: number;
  rbVolts: number;
  rbTemp: number;
  rbPPM_recv: number;
  rbV_out: number;
  rbPPM_send: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, rfStatus: number, rfCurrent: number,
              rfSpeed: number, rfVolts: number, rfTemp: number, rfPPM_recv: number, rfV_out: number, rfPPM_send: number,
              lfStatus: number, lfCurrent: number, lfSpeed: number, lfVolts: number, lfTemp: number, lfPPM_recv: number,
              lfV_out: number, lfPPM_send: number, lbStatus: number, lbCurrent: number, lbSpeed: number, lbVolts: number,
              lbTemp: number, lbPPM_recv: number, lbV_out: number, lbPPM_send: number, rbStatus: number,
              rbCurrent: number, rbSpeed: number, rbVolts: number, rbTemp: number, rbPPM_recv: number, rbV_out: number,
              rbPPM_send: number) {
    super(id, fileId, messageNum, offset);
    this.rfStatus = rfStatus;
    this.rfCurrent = rfCurrent;
    this.rfSpeed = rfSpeed;
    this.rfVolts = rfVolts;
    this.rfTemp = rfTemp;
    this.rfPPM_recv = rfPPM_recv;
    this.rfV_out = rfV_out;
    this.rfPPM_send = rfPPM_send;
    this.lfStatus = lfStatus;
    this.lfCurrent = lfCurrent;
    this.lfSpeed = lfSpeed;
    this.lfVolts = lfVolts;
    this.lfTemp = lfTemp;
    this.lfPPM_recv = lfPPM_recv;
    this.lfV_out = lfV_out;
    this.lfPPM_send = lfPPM_send;
    this.lbStatus = lbStatus;
    this.lbCurrent = lbCurrent;
    this.lbSpeed = lbSpeed;
    this.lbVolts = lbVolts;
    this.lbTemp = lbTemp;
    this.lbPPM_recv = lbPPM_recv;
    this.lbV_out = lbV_out;
    this.lbPPM_send = lbPPM_send;
    this.rbStatus = rbStatus;
    this.rbCurrent = rbCurrent;
    this.rbSpeed = rbSpeed;
    this.rbVolts = rbVolts;
    this.rbTemp = rbTemp;
    this.rbPPM_recv = rbPPM_recv;
    this.rbV_out = rbV_out;
    this.rbPPM_send = rbPPM_send;
  }
}

export class MotorCtrlDbMessage extends DbMessage {
  pwm1: number;
  pwm2: number;
  pwm3: number;
  pwm4: number;
  pwm5: number;
  pwm6: number;
  pwm7: number;
  pwm8: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, pwm1: number, pwm2: number, pwm3: number,
              pwm4: number, pwm5: number, pwm6: number, pwm7: number, pwm8: number) {
    super(id, fileId, messageNum, offset);
    this.pwm1 = pwm1;
    this.pwm2 = pwm2;
    this.pwm3 = pwm3;
    this.pwm4 = pwm4;
    this.pwm5 = pwm5;
    this.pwm6 = pwm6;
    this.pwm7 = pwm7;
    this.pwm8 = pwm8;
  }
}

export class OsdHomeDbMessage extends DbMessage {
  osd_lon: number;
  osd_lat: number;
  osd_alt: number;
  osd_home_state: number;
  fixed_altitude: number;
  course_lock_torsion: number;

  constructor(id: number, fileId: number, messageNum: number, offset: number, osd_lon: number, osd_lat: number,
              osd_alt: number, osd_home_state: number, fixed_altitude: number, course_lock_torsion: number) {
    super(id, fileId, messageNum, offset);
    this.osd_lon = osd_lon;
    this.osd_lat = osd_lat;
    this.osd_alt = osd_alt;
    this.osd_home_state = osd_home_state;
    this.fixed_altitude = fixed_altitude;
    this.course_lock_torsion = course_lock_torsion;
  }
}

export class LogDbMessage extends DbMessage {
  text: string;

  constructor(id: number, fileId: number, messageNum: number, offset: number, text: string) {
    super(id, fileId, messageNum, offset);
    this.text = text;
  }
}
