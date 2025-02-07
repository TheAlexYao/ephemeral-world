export interface ChatRoom {
  roomId: string;
  name: string;
  createdBy: string;
  createdAt: string;
  deepLink: string;
  participants: {
    id: string;
    name: string;
    verified: boolean;
  }[];
}
