# Tech Stack Documentation

## Overview

Next.js application with Convex backend, Better Auth authentication, and Tailwind CSS v4 styling. Built with TypeScript and React 19.

## Programming Language & Runtime

- **TypeScript**: 5.x
- **Node.js**: v18.20.8
- **Package Manager**: bun

## Frontend

### UI Framework

- **React**: 19.1.0
- **React DOM**: 19.1.0
- **Next.js**: 15.4.4 (App Router)

### Styling

- **Tailwind CSS**: v4
- **PostCSS**: @tailwindcss/postcss
- **tw-animate-css**: 1.3.6
- **Fonts**: Geist Sans, Geist Mono (Google Fonts)

### Component Libraries

- **Radix UI**: Full suite of primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, etc.)
- **shadcn/ui components**: Built on Radix UI
- **class-variance-authority**: 0.7.1
- **clsx**: 2.1.1
- **tailwind-merge**: 3.3.1

### State Management

- **jotai-x**: 2.3.3
- **React Hook Form**: 7.61.1
- **@hookform/resolvers**: 5.2.0

### Data Fetching

- **@tanstack/react-query**: 5.83.0
- **@convex-dev/react-query**: 0.0.0-alpha.11

### UI Components

- **cmdk**: 1.1.1 (Command palette)
- **date-fns**: 4.1.0 (Date utilities)
- **embla-carousel-react**: 8.6.0
- **input-otp**: 1.4.2
- **lucide-react**: 0.526.0 (Icons)
- **react-day-picker**: 9.8.1
- **react-resizable-panels**: 3.0.3
- **recharts**: 2.15.4 (Charts)
- **sonner**: 2.0.6 (Toast notifications)
- **vaul**: 1.1.2 (Drawer component)

### Utilities

- **next-themes**: 0.4.6 (Theme management)
- **nuqs**: 2.4.1 (URL state management)
- **ts-essentials**: 10.1.1

## Backend

### Backend Framework

- **Convex**: 1.25.2
- **convex-ents**: 0.15.0 (Entity system)
- **convex-helpers**: 0.1.99

### Authentication

- **better-auth**: 1.3.4
- **@convex-dev/better-auth**: 0.7.0 (Convex adapter)

### Backend Components

- **@convex-dev/aggregate**: 0.1.21
- **@convex-dev/rate-limiter**: 0.2.10

### Validation

- **zod**: 3.25.76

## Database & Storage

- **Convex Database**: Built-in reactive database
- **Schema**: Defined using convex-ents with users table

## Development Tools & Workflow

### Build Tools

- **Next.js Turbopack**: Development server
- **TypeScript**: Compiler with custom tsconfig

### Scripts

```json
{
  "build": "next build",
  "dev": "concurrently 'bun dev:app' 'bun dev:backend'",
  "dev:app": "next dev --turbopack",
  "dev:backend": "convex dev",
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "typecheck": "tsc --noEmit",
  "typecheck:watch": "bun typecheck --watch",
  "seed": "convex run seed:seed",
  "studio": "bun convex dashboard"
}
```

### Development Dependencies

- **ESLint**: v9 with Next.js config
- **@types/node**: v20
- **@types/react**: v19
- **@types/react-dom**: v19
- **concurrently**: 9.2.0

### Environment Configuration

- **@t3-oss/env-nextjs**: 0.13.8

## TypeScript Configuration

```json
{
  "strict": false,
  "strictNullChecks": true,
  "target": "es2022",
  "module": "esnext",
  "moduleResolution": "bundler",
  "jsx": "preserve",
  "paths": {
    "@/*": ["./src/*"],
    "@convex/*": ["./convex/*"]
  }
}
```

## Path Aliases

- `@/*` � `./src/*`
- `@convex/*` � `./convex/*`

## Convex Configuration

- Better Auth integration
- Rate limiting
- User aggregation
- Custom authentication with email verification
- Session management (30-day expiry, 15-day update age)
