import {ImuAttiDbMessage, RecMagDbMessage} from "./DroneWebGuiDatabase";

/**
 * returns orientation - north: 0°, east 90° (end of scale), west -90°, south -180°, south to east: [-180°,-270°[
 */
export function getOrientationFromImuAttiMessage(message: ImuAttiDbMessage | undefined) {
  if (message)
    return (Math.atan2(message.magX, message.magY) * 180 / Math.PI) -90;
  else
    return 0;
}

export function getOrientationFromRecMagMessage(message: RecMagDbMessage | undefined) {
  if (message)
    return (Math.atan2(message.magX, message.magY) * 180 / Math.PI) -90;
  else
    return 0;
}
