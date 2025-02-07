export interface ChatRoom {
  roomId: string;
  createdBy: string;
  createdAt: string;
  deepLink: string;
  participants: {
    id: string;
    name: string;
    verified: boolean;
  }[];
}
