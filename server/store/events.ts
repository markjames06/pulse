import { EventEmitter } from 'node:events';
import { LocationShare, NotificationItem, Ping, SafetyCheckIn, PulseMoment } from '../../src/types/index.js';
import { sendCirclePush } from './push.js';

export interface CircleEvent {
  ping?: Ping;
  notification?: NotificationItem;
  share?: LocationShare;
  checkIn?: SafetyCheckIn;
  moment?: PulseMoment;
}

export const circleEvents = new EventEmitter();

export function publishCircleEvent(circleId: string, event: CircleEvent) {
  circleEvents.emit(circleId, event);
  if (event.notification) void sendCirclePush(circleId, event.notification);
}