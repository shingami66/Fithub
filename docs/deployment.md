# Project Pulse — Deployment Guide

## Environments

| Environment | Purpose                           |
| ----------- | --------------------------------- |
| Development | Local development with hot reload |
| Staging     | Pre-production testing            |
| Production  | Live application                  |

## Prerequisites

- Node.js >= 18.x
- pnpm >= 8.x
- MongoDB Atlas account
- Google OAuth credentials (for auth)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable             | Description                            |
| -------------------- | -------------------------------------- |
| MONGODB_URI          | MongoDB Atlas connection string        |
| NEXTAUTH_SECRET      | Random secret for NextAuth.js sessions |
| GOOGLE_CLIENT_ID     | Google OAuth client ID                 |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret             |
| RAPIDAPI_KEY         | RapidAPI key for food/nutrition API    |

## Local Development

```bash
pnpm install
pnpm dev
```

App runs at `http://localhost:3000`.

## Production Build

```bash
pnpm build
pnpm start
```

## Vercel Deployment (Recommended)

1. Push to GitHub
2. Connect repository in Vercel dashboard
3. Set environment variables in Vercel project settings
4. Deploy

### Vercel Configuration

- Framework Preset: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

## Docker (Alternative)

Dockerfile and docker-compose configurations will be added when containerization is needed.
