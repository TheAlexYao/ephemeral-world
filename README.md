# Ephemeral Chat

Spontaneous convos, unfiltered ideas, self-destructing chats.

## Features

- **Instant Room Creation**: Generate unique, deep-linked chat rooms via quick actions
- **Real-Time Messaging**: Live chat using WebSockets
- **Ephemeral Messages**: Messages auto-delete after 60 seconds
- **WorldID Authentication**: Seamless login with WorldID
- **Deep Linking**: Join rooms instantly via shared links

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide-React
- **Auth**: next-auth + @worldcoin/minikit-js
- **Backend**: Serverless functions (Vercel)
- **Data Storage**: 
  - Redis (ephemeral messages)
  - Turso (persistent data)
- **Real-time**: socket.io

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in the values
3. Install dependencies:
```bash
npm install
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Required environment variables in `.env.local`:

- `NEXT_PUBLIC_WORLDCOIN_APP_ID`: WorldID App ID
- `NEXT_PUBLIC_WORLDCOIN_ACTION`: WorldID Action name
- `REDIS_URL`: Redis connection URL
- `DATABASE_URL`: Turso database URL
- `NEXTAUTH_SECRET`: NextAuth secret key
- `NEXTAUTH_URL`: NextAuth URL (http://localhost:3000 in development)

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Architecture

- **Authentication**: WorldID integration for seamless login
- **Data Model**:
  - Users (Turso)
  - Chat Rooms (Turso)
  - Messages (Redis with 60s TTL)
- **UI Components**: Built with shadcn/ui system
- **Styling**: Tailwind CSS with custom theme

## License

MIT
