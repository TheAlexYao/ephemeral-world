import Pusher from 'pusher';
import PusherClient from 'pusher-js';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    activityTimeout: 60000,
    pongTimeout: 30000,
    channelAuthorization: {
      endpoint: '/api/pusher/auth',
      transport: 'ajax',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  }
);

pusherClient.connection.bind('error', (err: any) => {
  console.error('Pusher connection error:', err);
});

pusherClient.connection.bind('connected', () => {
  console.log('Connected to Pusher');
});

pusherClient.connection.bind('disconnected', () => {
  console.log('Disconnected from Pusher');
});
