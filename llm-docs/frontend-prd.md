## **Product Requirements Document (PRD): Ephemeral Frontend**

### **Product Name:**

**Ephemeral** -- Instant, vanish-as-you-go chat

### **Tagline:**

"Spontaneous convos, unfiltered ideas, self-destructing chats."

* * *

### **Overview:**

Ephemeral's frontend is a minimalist, mobile-first chat interface that enables real‑time, temporary conversations. With a focus on privacy and spontaneity, the app lets users join chat rooms instantly via deep links (powered by World's quick actions), send messages that auto-delete after 60 seconds, and enjoy a clean, distraction‑free experience--all without the hassle of traditional sign-ups thanks to WorldID integration.

* * *

### **Target Users:**

- **Privacy-Focused End Users:**  
Digitally native individuals (students, creatives, young professionals) who value spontaneous communication without the burden of permanent records.

- **Casual Collaborators & Social Ritual Seekers:**  
Users looking for unfiltered, in‑the-moment interaction--ideal for brainstorming, quick check‑ins, and digital high‑fives.

* * *

### **Technical Stack:**

- **Frontend Framework & Language:**  
-- Next.js (app router) with React and TypeScript  
-- Serverless functions for backend API endpoints
- **Styling & UI Components:**  
-- Tailwind CSS (for a utility-first, responsive, minimal design)  
-- Radix UI (for accessible, consistent components)  
-- Lucide-react (for clean, flat icons)
- **Authentication & Integration:**  
-- next‑auth combined with @worldcoin/minikit‑js for frictionless WorldID authentication  
-- Deep linking for instant room joining
- **Real-Time Communication:**  
-- WebSockets (via Pusher or an equivalent library) for live messaging
- **Data Storage (Backend Integration):**  
-- Redis for ephemeral message storage (with a 60‑second TTL)  
-- Turso for persistent data like user profiles and room metadata
* * *

### **Functional Requirements:**

1. **Landing/Onboarding Page:**

    - Display the Ephemeral logo and tagline.
    - Provide frictionless WorldID-based authentication (via next‑auth) so users access the app instantly.
    - (Optional) A "Create Room" call-to-action button that triggers room creation.
2. **Chat Room Page (/room/[roomId]):**

    - **Header:**  
-- Back button (using a ChevronLeft icon).  
-- Room title and minimal branding.
    - **Room Info Section:**  
-- Display participant count.  
-- "Share Room" button that copies the deep-linked URL to the clipboard.
    - **Connection Status Indicator:**  
-- A floating component that shows current connection state (e.g., connecting, connected, disconnected) with color-coded cues.
    - **Warning Banner:**  
-- A minimal alert (e.g., "Room link copied to clipboard!") that briefly appears when sharing.
    - **Message Feed Area:**  
-- A scrollable area listing messages chronologically.  
-- Each message shows the sender's name (or initial), content, and a subtle countdown (displaying remaining seconds until deletion).
    - **Input Area:**  
-- A text field with a placeholder ("Message") and a Send button (icon-based) for composing and sending new messages.
3. **Real-Time Updates & Ephemeral Messaging:**

    - Integrate with the WebSocket API so that messages are received and displayed in real time.
    - Auto-delete messages on the UI when the server's TTL (60 seconds) expires--using a visual fade or countdown.
4. **Deep Linking:**

    - Ensure that room creation returns a unique URL that users can share, allowing frictionless joining via World's quick actions.
5. **Error Handling & Connection Feedback:**

    - Display minimal error messages or connection status updates if the WebSocket connection fails.
    - Provide visual feedback for actions (e.g., copying a link, sending a message).
6. **Split Payment Feature:**
   - **Receipt Scanner:**
     - Camera button in chat interface
     - OCR processing overlay/animation
     - Display digitized receipt with items, tax, service charge
   
   - **Split Card Component:**
     - Show total amount in original currency (MYR)
     - Display USD conversion
     - Per-person amount calculation
     - Real-time participant joining visualization
     - 60-second countdown timer
     - World ID verification indicators
   
   - **Payment Integration:**
     - Automatic World ID wallet trigger
     - Payment confirmation display
     - Success/failure animations
     - Transaction status updates in chat

7. **Group Travel Fund Feature:**
   - **AI Suggestion Component:**
     ```typescript
     interface GroupTravelFundSuggestion {
       groupId: string;
       groupName: string;
       currentAmount: number;
       goalAmount: number;
       suggestions: Array<{
         targetUsers: Array<{
           userId: string;
           displayName: string;
         }>;
         suggestedAmount: number;
         message: string;
         context: string;
       }>;
     }
     ```
   - **Progress Display:**
     ```typescript
     interface GroupTravelFundProgress {
       groupId: string;
       groupName: string;
       currentAmount: number;
       goalAmount: number;
       percentComplete: number;
       members: Array<{
         userId: string;
         displayName: string;
         role: 'admin' | 'member';
         totalContributed: number;
       }>;
       recentActivity: Array<{
         type: 'contribution' | 'split';
         amount: number;
         date: string;
         participants: Array<{
           userId: string;
           displayName: string;
         }>;
         message?: string;
       }>;
     }
     ```
   - **Visual Elements:**
     - Group name and goal display
     - Progress bar showing current/goal amounts
     - Member list with contribution amounts
     - AI-generated group-specific suggestions
     - Quick-action contribution buttons
     - Recent group activity feed
     - Animated progress updates
   - **Integration:**
     - Automatic group creation from split payment participants
     - Contextual suggestions after group splits
     - Seamless integration with chat interface
     - Real-time updates on group contributions

* * *

### **Non-Functional Requirements:**

- **Performance:**  
-- The chat interface should load in under 2 seconds on mobile devices.  
-- Real-time interactions should have minimal latency.
- **Accessibility:**  
-- Use accessible components (Radix UI) and semantic HTML for screen readers.  
-- Ensure proper contrast and scalable text.
- **Responsiveness:**  
-- The design must adapt seamlessly to various mobile screen sizes and orientations.
- **Privacy & Security:**  
-- No permanent storage of chat messages; ensure Redis TTL is properly configured.  
-- Sanitize all inputs and implement basic rate limiting.
- **Scalability:**  
-- Use serverless functions and Redis for handling concurrent sessions effectively.
* * *

### **UI/UX Design Principles:**

- **Minimalism:**  
-- Focus on a single primary action per screen.  
-- Ample whitespace, clean typography, and a flat design aesthetic.
- **Consistency:**  
-- Use a neutral background (e.g., white/light gray) with one or two accent colors for interactive elements.  
-- Ensure icons, buttons, and input fields are styled consistently across the app.
- **User-Centric Interactions:**  
-- Provide instant visual feedback for user actions (sending messages, copying links, etc.).  
-- Use subtle animations (e.g., fading out messages) to indicate ephemeral behavior without being distracting.
- **Mobile-First Design:**  
-- Prioritize ease-of-use on small screens.  
-- Ensure touch-friendly elements and a simplified navigation flow.
* * *

### **Page Structure & Component Breakdown:**

1. **Landing/Onboarding Screen:**

    - **Header:** Logo and tagline.
    - **Main:** "Create Chat Room" button.
    - **Footer:** Brief explanation of Ephemeral's purpose.
2. **Chat Room Page:**

    - **Header:**  
-- Back Button  
-- Room Title and Branding
    - **Room Info & Status:**  
-- Participants count  
-- Share Room button -- Connection status indicator (top-right overlay)
    - **Warning Banner:**  
-- Brief message area for alerts (e.g., link copied)
    - **Message Feed:**  
-- List of messages with sender info, content, and a countdown timer.
    - **Input Area:**  
-- Text input field and Send button.

3. **Split Payment Components:**
   - **ReceiptScanner:**
     ```typescript
     interface ReceiptData {
       restaurant: string;
       items: Array<{ name: string; price: number }>;
       tax: number;
       serviceCharge: number;
       total: number;
       currency: string;
     }
     ```

   - **SplitCard:**
     ```typescript
     interface SplitCardProps {
       receipt: ReceiptData;
       participants: Array<{
         userId: string;
         avatar: string;
         verified: boolean;
       }>;
       onJoin: () => void;
       onComplete: () => void;
     }
     ```

   - **PaymentStatus:**
     ```typescript
     interface PaymentStatusProps {
       status: 'pending' | 'processing' | 'success' | 'failed';
       amount: number;
       currency: string;
     }
     ```

4. **Travel Fund Components:**
   - **TravelFundPrompt:**
     ```typescript
     interface TravelFundProps {
       currentAmount: number;
       goalAmount: number;
       onContribute: (amount: number) => void;
     }
     ```

* * *

### **UI/UX Flow:**

1. **Split Payment Flow:**
   - Camera icon in chat interface
   - Scanning overlay with progress animation
   - Receipt display with itemized breakdown
   - Split card appears with participant slots
   - Real-time joining animations
   - Payment interface trigger
   - Success/completion state

2. **Travel Fund Flow:**
   - AI prompt appears in chat stream
   - Expandable card with fund details
   - Quick contribution options
   - Progress visualization
   - Confirmation feedback

* * *

### **Additional Technical Integration:**

- **World ID Integration:**
  - Payment initiation via MiniKit
  - Wallet interaction handling
  - Transaction verification

- **Real-time Updates:**
  - Split session management in Redis
  - Pusher events for participant coordination
  - Payment status broadcasting

* * *

### **Updated Timeline:**

1. **Day 1:**  
-- Set up the Next.js project with TypeScript, Tailwind CSS, and install dependencies (Radix UI, lucide-react).  
-- Create a basic folder structure and initial UI skeleton.

2. **Day 2:**  
-- Build the Landing/Onboarding screen with WorldID authentication integration. -- Implement the "Create Chat Room" action that calls the backend API.

3. **Day 3:**  
-- Develop the Chat Room Page header, room info component, and connection status indicator. -- Create a warning banner component for brief alerts.

4. **Day 4:**  
-- Build the Message Feed component, designing the Message card with a countdown timer.  
-- Integrate a placeholder message array for UI testing.

5. **Day 5:**  
-- Develop the Input Area component with a text field and Send button.  
-- Wire up form submission logic (stubbed for now).

6. **Day 6:**  
-- Integrate WebSocket connection logic to handle real-time messaging.  
-- Connect UI events to simulated backend responses (or a test server).

7. **Day 7:**  
-- Final QA, cross-browser and mobile testing, and polish UI details.  
-- Prepare demo materials and documentation.

8. **Day 8:**
   - Implement Receipt Scanner component
   - Build Split Card UI
   - Add payment flow integration

9. **Day 9:**
   - Create Travel Fund components
   - Integrate AI prompt system
   - Polish animations and transitions

10. **Day 10:**
    - End-to-end testing of split payment flow
    - Performance optimization
    - Final UI polish and documentation

* * *

### **Success Metrics:**

- **Engagement:**  
-- Number of rooms created and messages sent per session.
- **Performance:**  
-- Page load times under 2 seconds; real-time messaging latency below acceptable thresholds.
- **User Feedback:**  
-- Positive usability feedback and minimal confusion over the ephemeral nature.
- **Stability:**  
-- Minimal errors in connection or message display.
- **Accessibility:**  
-- Compliance with basic accessibility standards.
* * *

### **Risks & Mitigations:**

- **WebSocket Connectivity:**  
-- Mitigation: Implement reconnection logic and fallback error messages.
- **Mobile Responsiveness:**  
-- Mitigation: Conduct thorough cross-device testing and use responsive design utilities in Tailwind.
- **Ephemeral Data Synchronization:**  
-- Mitigation: Ensure consistent countdown timers using the server's clock and handle potential timing drift gracefully.
- **Privacy & Security:**  
-- Mitigation: Sanitize user input and enforce strict Redis TTL settings.