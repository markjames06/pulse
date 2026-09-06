import { usersApi } from './users.api';
import { circlesApi } from './circles.api';
import { sharesApi } from './shares.api';
import { pingsApi } from './pings.api';
import { memoryPinsApi } from './memoryPins.api';
import { notificationsApi } from './notifications.api';

export const api = {
  ...usersApi,
  ...circlesApi,
  ...sharesApi,
  ...pingsApi,
  ...memoryPinsApi,
  ...notificationsApi,
};
