# boardgame-steam-finder 🛰️🎲

A unified recommendation engine that bridges the gap between physical tabletop libraries and digital Steam collections.

## The Vision

I have a collection of board games on BoardGameGeek and a video game library on Steam. Often, the "vibe" or mechanics I enjoy in one medium (e.g., Deck Building, Resource Management, Dungeon Crawling) translate to the other. This app analyzes both libraries to suggest what I should play next or what I’m missing from my collection.

## POC Goals

- Tech Stack: Simple, mobile-responsive web interface (React, Next.js, Tailwind CSS, Shadcn/ui, Typescript, deployed to Railway).
- API integrations: BoardGameGeek for board game collection data and
Steam API for digital library data.
- Storage: LocalStorage/SessionStorage for initial V1 to keep it lightweight.

## Core Features (Roadmap)

- Library Sync: Fetch "Owned" games from BGG and Steam.
- Tag Mapping: A logic engine that maps BGG "Mechanics" (e.g., Draft, Card-game) to Steam "Tags" (e.g., RPG).
- The "Vibe" Suggestor: A dashboard showing Steam games and board games I own.
- Discovery Mode: Suggesting new games based on cross-platform taste profile.

## Development 

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

Railway is used for deployment.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🚀 MVP Roadmap

### Phase 1: Data Scaffolding
- [x] Initialize Next.js project with Tailwind + Shadcn/UI.
- [ ] Create API routes for Steam (`/api/steam`) and BGG (`/api/bgg`).
- [x] Implement XML-to-JSON parser for BGG data.
- [x] Basic "Library View" displaying raw lists fetched from both platforms.
- [ ] Save library in localStorage to avoid duplicate calls

### Phase 2: The Suggestion Engine
- [ ] Build the `matchEngine` utility to find patterns in categories/mechanics.
- [ ] Implement search for games and board games separately by tags/categories filtering out already owned games

### Phase 3: Mobile-First Experience
- [ ] Design "Suggestion Cards" with content from API integrations
- [ ] UI/UX improvements post-POC

### Phase 4: Polish & Persistence
- [ ] PostgreSQL integration for sign up
- [ ] AI enhanced search, automated suggestion notifications
