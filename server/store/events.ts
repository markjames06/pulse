import { EventEmitter } from 'node:events';
import { LocationShare, NotificationItem, Ping } from '../../src/types/index.js';

export interface CircleEvent {
  ping?: Ping;
  notification?: NotificationItem;
  share?: LocationShare;
}

export const circleEvents = new EventEmitter();

export function publishCircleEvent(circleId: string, event: CircleEvent) {
  circleEvents.emit(circleId, event);
}