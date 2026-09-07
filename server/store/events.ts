import { EventEmitter } from 'node:events';
import { NotificationItem, Ping } from '../../src/types/index.js';

export interface CircleEvent {
  ping?: Ping;
  notification?: NotificationItem;
}

export const circleEvents = new EventEmitter();

export function publishCircleEvent(circleId: string, event: CircleEvent) {
  circleEvents.emit(circleId, event);
}