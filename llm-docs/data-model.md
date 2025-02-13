### **Persistent Data (Stored in Turso)**

1. **User**

    - **userId** (UUID, Primary Key)
    - **worldId** (String, unique identifier provided by WorldID)
    - **displayName** (String)
    - **email** (String, optional)
    - **createdAt** (Timestamp)
    - **lastActive** (Timestamp)
2. **ChatRoom**

    - **roomId** (UUID, Primary Key)
    - **createdBy** (UUID, Foreign Key referencing User.userId)
    - **createdAt** (Timestamp)
    - **deepLink** (String, URL for quick room access)
    - _(Optional)_ **active** (Boolean, to indicate if the room is currently in use)
3. **SessionLog (Optional, for analytics)**

    - **sessionId** (UUID, Primary Key)
    - **userId** (UUID, Foreign Key referencing User.userId)
    - **roomId** (UUID, Foreign Key referencing ChatRoom.roomId)
    - **joinTime** (Timestamp)
    - **leaveTime** (Timestamp)

4. **GroupTravelFund**

    - **fundId** (UUID, Primary Key)
    - **name** (String, e.g., "KL Trip Fund")
    - **goalAmount** (Decimal)
    - **currentAmount** (Decimal)
    - **createdAt** (Timestamp)
    - **updatedAt** (Timestamp)

5. **GroupMember**

    - **groupId** (UUID, Foreign Key referencing GroupTravelFund.fundId)
    - **userId** (UUID, Foreign Key referencing User.userId)
    - **joinedAt** (Timestamp)
    - **role** (String, e.g., 'admin', 'member')

6. **TravelContribution**

    - **contributionId** (UUID, Primary Key)
    - **fundId** (UUID, Foreign Key referencing GroupTravelFund.fundId)
    - **userId** (UUID, Foreign Key referencing User.userId)
    - **amount** (Decimal)
    - **fromSplitId** (UUID, optional - links to a split payment)
    - **message** (String, optional note about the contribution)
    - **createdAt** (Timestamp)
* * *

### **Ephemeral Data (Stored in Redis)**

Since chat messages are meant to be transient, they'll be stored in Redis with a built-in TTL. You won't need to persist full message history, but you might structure each message as follows:

4. **ChatMessage (Ephemeral)**
    - **messageId** (UUID or unique string)
    - **roomId** (UUID, to associate with a ChatRoom)
    - **senderId** (UUID, referencing User.userId)
    - **content** (String)
    - **createdAt** (Timestamp)
    - **TTL/ExpiresAt** -- Managed by Redis so that the key auto-expires (e.g., 60 seconds after creation)

5. **AI Suggestions (Ephemeral)**
    - **Key Format:** `ai:suggestion:{groupId}`
    - **Value:** JSON containing:
      - groupContext: {
        currentAmount: number,
        goalAmount: number,
        recentSplits: Array<{
          amount: number,
          participants: string[],
          date: string
        }>,
        recentContributions: Array<{
          userId: string,
          amount: number,
          date: string
        }>
      }
      - suggestions: Array<{
        targetUsers: string[],
        suggestedAmount: number,
        message: string,
        context: string
      }>
    - **TTL:** 1 hour (to maintain context relevance)

_Implementation Note:_  
When a user sends a message, your server pushes it into Redis (e.g., as a JSON value) and sets the key's TTL to 60 seconds. The WebSocket server broadcasts the message to all clients in the room. Once the TTL expires, Redis automatically deletes the message from memory, keeping the chat truly ephemeral.

* * *

### **Summary**

- **Turso** handles the persistent data: users, chat room details, and (optionally) session logs for usage analytics.
- **Redis** manages the ephemeral chat messages, using its in‑memory speed and TTL features to auto-delete messages after a set duration.