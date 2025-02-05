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
    activityTimeout: 20000,
    pongTimeout: 10000,
    wsHost: `${process.env.NEXT_PUBLIC_PUSHER_CLUSTER!}.pusher.com`,
    wssPort: 443
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
