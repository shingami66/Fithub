# Project Pulse

Project Pulse is a highly optimized, responsive fitness tracking PWA focused on ultra-fast workout logging, macro/calorie tracking, and modern dashboard analytics with a clean gym-focused UX.

## 🚀 Overview

The application is designed to be an enterprise-grade SaaS application prioritizing:

- **Ultra-fast workout logging** without heavy interfaces
- **Modern dashboard analytics**
- **Dark futuristic UI** featuring premium cards, neon accents, and smooth micro-interactions
- **Mobile-first responsiveness**
- **Clean separation of concerns** and architectural scalability

## 🏗 Architecture Overview

Built on a powerful modern stack:

- **Next.js 14** (App Router) for hybrid rendering
- **TypeScript** (Strict Mode) for type safety
- **Tailwind CSS** for rapid styling
- **MongoDB Atlas** for scalable persistence
- **Framer Motion** & **Lucide React** for UI polish

For deep dives into our architectural decisions, view our documentation in the `/docs` folder:

- [Architecture](docs/architecture.md)
- [API Design](docs/api-design.md)
- [Database Schema](docs/db-schema.md)
- [Deployment Guide](docs/deployment.md)
- [Decisions](docs/decisions.md)
- [Coding Standards](docs/coding-standards.md)

## 📁 Folder Structure

We follow a feature-first, scalable folder structure:

```
project-pulse/
├── app/             # App Router pages, layouts, and API routes
├── components/      # Shared React components (ui/, layout/)
├── config/          # Global application configurations (site, navigation, dashboard)
├── docs/            # Technical documentation
├── lib/             # Business logic (db/, auth/, services/, utils/, validations/)
└── types/           # Shared TypeScript types
```

## 🛠 Setup Instructions

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <repo-url> project-pulse
   cd project-pulse
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Environment Setup**:
   Copy the example environment variables and add your own credentials.
   ```bash
   cp .env.example .env.local
   ```
   _Note: Make sure you configure MongoDB Atlas and Google OAuth credentials in `.env.local`._

## 💻 Development Commands

- `pnpm dev` - Start the Next.js development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm prepare` - Setup Husky git hooks (run automatically on install)

## 🎨 Design Philosophy

Project Pulse utilizes a premium fitness SaaS aesthetic:

- Default dark mode with neon accents (`#deff9a`)
- Bento Box layout structures with soft shadows and subtle glow effects
- Material 3 inspired spacing and minimal visual clutter
- High readability for gym environments
