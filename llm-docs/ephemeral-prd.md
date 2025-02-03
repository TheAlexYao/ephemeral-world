### **Product Name:**

**Ephemeral** -- Instant, vanish-as-you-go chat

### **Tagline:**

"Spontaneous convos, unfiltered ideas, self-destructing chats."

### **Overview:**

A minimalist, real‑time chat tool for spontaneous conversations. No login hassle--seamless WorldID auth--and messages auto-delete after 60 seconds.

### **Target Users:**

-- The primary target for Ephemeral is a younger, privacy-focused audience. These are typically digitally native individuals (like students, creatives, or young professionals) who value spontaneous, unfiltered interactions without a permanent record. They appreciate tools that allow for quick, off‑the-cuff communication in a secure, frictionless environment, making ephemeral chats ideal for capturing raw ideas and fostering candid conversations. 

### **Core Features:**

1. **Instant Room Creation:**  
• Generate a unique, deep-linked chat room via a quick action.  
• No persistent data: rooms exist for the session only.

2. **Real-Time Messaging:**  
• Live chat using WebSockets.  
• Minimal UI: single-screen chat feed and text input.

3. **Ephemeral Messages:**  
• Messages stored in Redis with a 60‑second TTL.  
• Auto-delete ensures no trace--privacy and spontaneity.

4. **Seamless Authentication:**  
• WorldID integration via @worldcoin/minikit‑js & next‑auth.  
• No separate login--just instant access.

5. **Deep Linking:**  
• Allow users to join rooms instantly via shared links.

### **Technical Architecture:**

- **Frontend:** Next.js (app router), React, TypeScript, Tailwind CSS, Radix UI, Lucide‑React
- **Authentication:** next‑auth + @worldcoin/minikit‑js
- **Backend:** Serverless functions (Vercel), WebSocket layer (socket.io or equivalent)
- **Data Storage:**  
-- **Redis:** Ephemeral messages with TTL  
-- **Turso:** Persistent data (users, chat room metadata, optional session logs)
- **ORM (Optional):** Drizzzle ORM if needed for complex persistent queries

### **Design Principles:**

-- Ultra-minimal, focus on one primary action per screen  
-- Clean, flat UI with ample whitespace  
-- Emphasis on spontaneity and privacy; messages are transient by design

### **Metrics & Success Criteria:**

-- **Engagement:** # of rooms created, messages per session, active users  
-- **Performance:** Real-time latency, TTL accuracy on message deletion  
-- **Stability:** Minimal errors, robust WebSocket connectivity  
-- **User Feedback:** Candid, off‑the-cuff sharing without post‑chat regret

### **Risks & Considerations:**

-- **Timer Sync:** Ensure all clients see a unified countdown via server clock  
-- **Scalability:** Handling concurrent WebSocket connections  
-- **Security:** Rate limiting and input sanitization to prevent abuse  
-- **Privacy:** Confirm no residual data is cached or stored inadvertently

### **Timeline (Hackathon MVP):**

1. **Day 1--2:** Set up environment, authentication, and basic UI
2. **Day 3:** Implement room creation & deep linking
3. **Day 4:** Integrate WebSockets, build real-time messaging
4. **Day 5:** Connect Redis for ephemeral message storage with TTL
5. **Day 6:** Testing (unit/integration), error handling, logging
6. **Day 7:** Final QA, polish UI, prepare demo