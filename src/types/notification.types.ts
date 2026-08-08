export interface NotificationItem {
  id: string;
  circleId: string;
  type: 'share_started' | 'share_stopped' | 'ping_received' | 'memory_pin_added' | 'member_joined';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  data?: any;
}
