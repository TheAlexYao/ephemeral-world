**Frontend:**  
• **Next.js with React & TypeScript (App Router):**  
-- Builds a clean, minimal UI with Tailwind CSS, Radix UI, and Lucide-React for icons.

**Authentication:**  
• **next-auth + @worldcoin/minikit-js:**  
-- Enables frictionless, WorldID-based login with automatic user authentication.

**Backend (Serverless Functions):**  
• **Real-Time Messaging:**  
-- Implement WebSocket connections (or similar) for live, ephemeral chat communication.  
-- Each chat room is created on demand and accessed via deep linking (using Quick Actions from the World docs).

**Data Storage:**  
• **Redis:**  
-- Used for ephemeral chat messages, leveraging its in‑memory speed and native TTL functionality to auto-delete messages after a set period (e.g., 60 seconds).  
• **Turso:**  
-- A persistent SQL database for storing long-term data such as user profiles, usage analytics, and room creation logs.