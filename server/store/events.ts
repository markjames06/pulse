import { EventEmitter } from 'node:events';
import { LocationShare, NotificationItem, Ping, SafetyCheckIn } from '../../src/types/index.js';

export interface CircleEvent {
  ping?: Ping;
  notification?: NotificationItem;
  share?: LocationShare;
  checkIn?: SafetyCheckIn;
}

export const circleEvents = new EventEmitter();

export function publishCircleEvent(circleId: string, event: CircleEvent) {
  circleEvents.emit(circleId, event);
}