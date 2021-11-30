import {ImuAttiDbMessage} from "./DroneWebGuiDatabase";

export function getOrientationFromImuAttiMessage(message: ImuAttiDbMessage | undefined) {
  if (message)
    return (Math.atan2(message.magX, message.magY) * 180 / Math.PI) -90;
  else
    return 0;
}
