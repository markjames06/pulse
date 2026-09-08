import webpush from 'web-push';
import { circles, pushSubscriptions } from './db.js';
import { NotificationItem } from '../../src/types/index.js';

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:hello@pulse.local';
const pushEnabled = Boolean(publicKey && privateKey);

if (pushEnabled) {
  webpush.setVapidDetails(subject, publicKey!, privateKey!);
}

export function getPushPublicKey() {
  return publicKey || null;
}

export async function sendCirclePush(circleId: string, notification: NotificationItem) {
  if (!pushEnabled) return;
  
  try {
    const circle = circles.get(circleId);
    if (!circle) return;
    
    const memberIds = new Set(circle.members.map((member) => member.userId));
    const targets = pushSubscriptions.filter((subscription) => memberIds.has(subscription.userId));

    await Promise.allSettled(targets.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          { endpoint: subscription.endpoint, keys: subscription.keys },
          JSON.stringify({ title: notification.title, body: notification.body, notificationId: notification.id })
        );
      } catch (error) {
        const statusCode = error && typeof error === 'object' && 'statusCode' in error ? error.statusCode : undefined;
        if (statusCode === 404 || statusCode === 410) {
          const index = pushSubscriptions.findIndex((item) => item.endpoint === subscription.endpoint);
          if (index >= 0) pushSubscriptions.splice(index, 1);
        } else {
          console.error('Push notification failed:', error);
        }
      }
    }));
  } catch (error) {
    console.error('Failed to send circle push notification:', error);
  }
}
