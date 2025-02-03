export interface ChatMessage {
  messageId: string;    // Unique identifier (UUID or unique string)
  roomId: string;       // Associated ChatRoom ID
  senderId: string;     // References the user (users.id)
  content: string;      // The actual message content
  createdAt: string;    // Timestamp as an ISO string (e.g., when the message was sent)
  // Note: TTL is managed by Redis automatically (e.g., with a 60-second expiry)
} 