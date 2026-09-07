import { usersApi } from './users.api';
import { circlesApi } from './circles.api';
import { sharesApi } from './shares.api';
import { pingsApi } from './pings.api';
import { memoryPinsApi } from './memoryPins.api';
import { notificationsApi } from './notifications.api';
import { checkInsApi } from './checkIns.api';
import { momentsApi } from './moments.api';
import { pushApi } from './push.api';
import { insightsApi } from './insights.api';
import { billingApi } from './billing.api';

export const api = {
  ...usersApi,
  ...circlesApi,
  ...sharesApi,
  ...pingsApi,
  ...memoryPinsApi,
  ...notificationsApi,
  ...checkInsApi,
  ...momentsApi,
  ...pushApi,
  ...insightsApi,
  ...billingApi,
};
