export interface ChatMessage {
  messageId: string;    // Unique identifier (UUID or unique string)
  roomId: string;       // Associated ChatRoom ID
  senderId: string;     // References the user (users.id)
  type: 'text' | 'split' | 'travel-fund';  // Type of message
  content: string;      // The actual message content
  data?: any;          // Additional data for special message types
  createdAt: string;    // Timestamp as an ISO string
  expiresAt?: string;   // When the message expires (if temporary)
  // Note: TTL is managed by Redis automatically
}