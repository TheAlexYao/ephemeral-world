* * *

## **Product Name:**

**Ephemeral**

## **Tagline:**

"Instant chats, effortless splits, and smart travel planning."

* * *

## **Overview:**

Ephemeral's frontend is a minimalist, mobile-first chat interface that enables real‑time, temporary conversations. With a focus on privacy and spontaneity, the app lets users join chat rooms instantly via deep links (powered by World's quick actions), send messages that auto-delete after 60 seconds, and enjoy a clean, distraction‑free experience--all without the hassle of traditional sign-ups thanks to WorldID integration. In addition, the product uniquely integrates group payment splitting and an AI-driven travel fund contribution feature that connects everyday transactions with long-term travel goals.

* * *

## **Target Users:**

- **Privacy-Focused End Users:**  
Digitally native individuals (students, creatives, young professionals) who value spontaneous communication without the burden of permanent records.

- **Casual Collaborators & Social Ritual Seekers:**  
Users looking for unfiltered, in‑the‑moment interaction--ideal for brainstorming, quick check‑ins, and digital high‑fives--while also benefiting from a streamlined way to split bills and save for shared travel goals.

* * *

## **Technical Stack:**

- **Frontend Framework & Language:**

    - Next.js (app router) with React and TypeScript
    - Serverless functions for backend API endpoints
- **Styling & UI Components:**

    - Tailwind CSS for a utility-first, responsive, minimal design
    - Radix UI for accessible, consistent components
    - Lucide-react for clean, flat icons
- **Authentication & Integration:**

    - next‑auth combined with @worldcoin/minikit‑js for frictionless WorldID authentication
    - Deep linking for instant room joining
- **Real-Time Communication:**

    - WebSockets (via Pusher or an equivalent library) for live messaging
- **Data Storage (Backend Integration):**

    - Redis for ephemeral message storage (with a 60‑second TTL)
    - Turso for persistent data like user profiles and room metadata
* * *

## **Functional Requirements:**

1. **Landing/Onboarding Page:**

    - Display the Ephemeral logo and tagline.
    - Provide frictionless WorldID-based authentication (via next‑auth) so users can access the app instantly.
    - _(Optional)_ A "Create Room" call-to-action button that triggers room creation.
2. **Chat Room Page (/room/[roomId]):**

    - **Header:**
        - Back button (using a ChevronLeft icon)
        - Room title and minimal branding.
    - **Room Info Section:**
        - Display participant count.
        - "Share Room" button that copies the deep-linked URL to the clipboard.
    - **Connection Status Indicator:**
        - A floating component showing current connection state (e.g., connecting, connected, disconnected) with color-coded cues.
    - **Warning Banner:**
        - A minimal alert (e.g., "Room link copied to clipboard!") that briefly appears when sharing.
    - **Message Feed Area:**
        - A scrollable area listing messages chronologically.
        - Each message displays the sender's name (or initial), content, and a subtle countdown (showing remaining seconds until deletion).
    - **Input Area:**
        - A text field with a placeholder ("Message") and a Send button (icon-based) for composing and sending new messages.
3. **Real-Time Updates & Ephemeral Messaging:**

    - Integrate with the WebSocket API so messages are received and displayed in real time.
    - Auto-delete messages on the UI when the server's TTL (60 seconds) expires, using a visual fade or countdown animation.
4. **Deep Linking:**

    - Ensure that room creation returns a unique URL that users can share, allowing frictionless joining via World's quick actions.
5. **Error Handling & Connection Feedback:**

    - Display minimal error messages or connection status updates if the WebSocket connection fails.
    - Provide visual feedback for actions (e.g., copying a link, sending a message).
6. **Split Payment Feature:**

    - **Receipt Scanner:**
        - A camera button within the chat interface.
        - An OCR processing overlay/animation that digitizes a receipt.
        - Display a detailed receipt (e.g., RM188.50 with Malaysian dishes, tax, and service charge) and auto-trigger a split command.
    - **Split Card Component:**
        - Show total amount in original currency (MYR) and display USD conversion.
        - Calculate per-person amounts and show a 60-second countdown timer.
        - Visualize real-time joining of participants with WorldID verification indicators.
    - **Payment Integration:**
        - Automatic wallet trigger via WorldID.
        - Payment confirmation display with success/failure animations.
        - Transaction status updates integrated into the chat.
7. **Group Travel Fund Feature:**

    - **AI Suggestion Component:**
        
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
        

    - **Progress Display:**
        
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
        

    - **Visual Elements:**
        - Group name and travel goal display.
        - A progress bar showing current contributions versus the goal.
        - A member list with individual contribution amounts.
        - AI-generated group-specific suggestions.
        - Quick-action buttons for contributions.
        - A recent activity feed with animated progress updates.
    - **Integration:**
        - Automatic group creation from split payment participants.
        - Contextual suggestions after group splits.
        - Seamless integration with the chat interface and real-time updates on contributions.
* * *

## **Non-Functional Requirements:**

- **Performance:**

    - The chat interface should load in under 2 seconds on mobile devices.
    - Real-time interactions must have minimal latency.
- **Accessibility:**

    - Utilize accessible components (Radix UI) and semantic HTML for screen reader compatibility.
    - Ensure appropriate contrast ratios and scalable text.
- **Responsiveness:**

    - The design must adapt seamlessly to various mobile screen sizes and orientations.
- **Privacy & Security:**

    - No permanent storage of chat messages; enforce Redis TTL settings rigorously.
    - Sanitize all inputs and implement basic rate limiting.
- **Scalability:**

    - Leverage serverless functions and Redis to handle a high number of concurrent sessions effectively.
* * *

## **UI/UX Design Principles:**

- **Minimalism:**

    - Focus on one primary action per screen with ample whitespace and clean typography.
    - Use a flat design aesthetic.
- **Consistency:**

    - Use a neutral background (e.g., white/light gray) with one or two accent colors for interactive elements.
    - Ensure that icons, buttons, and input fields maintain a consistent style across the app.
- **User-Centric Interactions:**

    - Provide instant visual feedback for user actions (sending messages, copying links, etc.).
    - Use subtle animations (e.g., fading out messages) to indicate ephemeral behavior without distraction.
- **Mobile-First Design:**

    - Prioritize usability on small screens with touch-friendly elements and a simplified navigation flow.
* * *

## **Page Structure & Component Breakdown:**

1. **Landing/Onboarding Screen:**

    - **Header:**
        - Logo and tagline.
    - **Main Section:**
        - "Create Chat Room" button.
    - **Footer:**
        - Brief explanation of Ephemeral's purpose.
2. **Chat Room Page:**

    - **Header:**
        - Back Button, Room Title, and Branding.
    - **Room Info & Status:**
        - Participant count, Share Room button, and connection status indicator.
    - **Warning Banner:**
        - Brief alert area for actions like copying links.
    - **Message Feed:**
        - List of messages with sender info, content, and a countdown timer.
    - **Input Area:**
        - Text input field and Send button.
3. **Split Payment Components:**

    - **ReceiptScanner Component:**
        
                interface ReceiptData {
          restaurant: string;
          items: Array<{ name: string; price: number }>;
          tax: number;
          serviceCharge: number;
          total: number;
          currency: string;
        }
        

    - **SplitCard Component:**
        
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
        

    - **PaymentStatus Component:**
        
                interface PaymentStatusProps {
          status: 'pending' | 'processing' | 'success' | 'failed';
          amount: number;
          currency: string;
        }
        

4. **Travel Fund Components:**

    - **TravelFundPrompt Component:**
        
                interface TravelFundProps {
          currentAmount: number;
          goalAmount: number;
          onContribute: (amount: number) => void;
        }
        

* * *

## **UI/UX Flow:**

1. **Split Payment Flow:**

    - Camera icon in chat interface triggers receipt scanning.
    - Scanning overlay with progress animation.
    - Display of the receipt with an itemized breakdown.
    - Split card appears with participant slots and real-time joining animations.
    - Payment interface is triggered automatically with success/completion states.
2. **Travel Fund Flow:**

    - Following payment, an AI-driven prompt appears in the chat.
    - Expandable card displays travel fund details (e.g., "Do you want to contribute to the travel fund? Here's your goal: $1556/$3000").
    - Quick contribution options and a progress visualization are provided.
    - Confirmation feedback is given on contributions.
* * *

## **Additional Technical Integration:**

- **World ID Integration:**

    - Handles authentication and payment initiation via MiniKit.
    - Manages wallet interactions and transaction verifications.
- **Real-Time Updates:**

    - Split session management via Redis.
    - Pusher (or equivalent) events for participant coordination.
    - Broadcast of payment status and travel fund updates.
* * *

## **Updated Timeline:**

1. **Day 1:**

    - Set up the Next.js project with TypeScript, Tailwind CSS, and install dependencies (Radix UI, lucide-react).
    - Establish basic folder structure and initial UI skeleton.
2. **Day 2:**

    - Build the Landing/Onboarding screen with WorldID authentication integration.
    - Implement the "Create Chat Room" action that calls the backend API.
3. **Day 3:**

    - Develop the Chat Room Page header, room info component, and connection status indicator.
    - Create a warning banner component for brief alerts.
4. **Day 4:**

    - Build the Message Feed component with message cards featuring countdown timers.
    - Integrate a placeholder message array for UI testing.
5. **Day 5:**

    - Develop the Input Area component with a text field and Send button.
    - Wire up form submission logic (stubbed initially).
6. **Day 6:**

    - Integrate WebSocket connection logic for real-time messaging.
    - Connect UI events to simulated backend responses or a test server.
7. **Day 7:**

    - Conduct final QA, cross-browser and mobile testing, and polish UI details.
    - Prepare demo materials and documentation.
8. **Day 8:**

    - Implement the Receipt Scanner component.
    - Build the Split Card UI and integrate payment flow logic.
9. **Day 9:**

    - Develop the Travel Fund components.
    - Integrate the AI prompt system and polish animations/transitions.
10. **Day 10:**

    - End-to-end testing of the split payment and travel fund flows.
    - Optimize performance and complete final UI polish and documentation.
* * *

## **Success Metrics:**

- **Engagement:**
    - Number of rooms created, messages sent per session, and active users.
- **Performance:**
    - Page load times under 2 seconds; minimal real-time messaging latency.
- **User Feedback:**
    - Positive usability reviews regarding the ephemeral nature and seamless integrations.
- **Stability:**
    - Minimal connection errors and robust error handling.
- **Accessibility:**
    - Compliance with basic accessibility standards and positive user accessibility feedback.
* * *

## **Risks & Mitigations:**

- **WebSocket Connectivity:**
    - _Mitigation:_ Implement reconnection logic and clear fallback error messages.
- **Mobile Responsiveness:**
    - _Mitigation:_ Conduct thorough cross-device testing and utilize responsive design utilities in Tailwind.
- **Ephemeral Data Synchronization:**
    - _Mitigation:_ Use the server's clock for consistent countdown timers and gracefully handle any timing drift.
- **Privacy & Security:**
    - _Mitigation:_ Sanitize user input and enforce strict Redis TTL settings.
- **User Adoption of Travel Fund Feature:**
    - _Mitigation:_ Gather feedback early during MVP testing and refine the AI prompt UX based on user interaction patterns.
* * *