# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js-based badminton cost calculator application built with TypeScript, React 19, and Tailwind CSS. The app calculates shared costs for badminton activities based on equipment usage, venue fees, and participation duration.

## Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React useState/useEffect with localStorage persistence
- **Icons**: Lucide React
- **Deployment**: Vercel (primary) + Netlify (secondary)

## Architecture

### Core Components
- **Main App**: `app/page.tsx` - Single-page application with badminton cost calculator
- **Layout**: `app/layout.tsx` - Basic HTML structure with Geist fonts
- **UI Components**: Located in `components/ui/` - shadcn/ui component library
- **Utilities**: `lib/utils.ts` - Helper functions (cn utility)
- **Hooks**: `hooks/` - Custom React hooks including toast notifications

### Key Features
- **Cost Calculation**: Calculates shared costs for 2-hour vs 3-hour participants
- **Settings Management**: Configurable pricing for shuttlecocks (per bucket or per unit) and venue fees
- **Local Storage**: Persists user settings and preferences
- **Responsive Design**: Mobile-first responsive layout
- **Copy to Clipboard**: Easy sharing of cost summaries

### Data Model
```typescript
interface BadmintonSettings {
  bucketPrice: number      // Price per bucket of shuttlecocks
  bucketQuantity: number   // Number of shuttlecocks per bucket
  singlePrice: number      // Price per individual shuttlecock
  venue2Hours: number      // 2-hour venue rental fee
  venue3Hours: number      // 3-hour venue rental fee
}
```

## Development Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Package Management
pnpm install         # Install dependencies (uses pnpm-lock.yaml)
```

## Project Structure

```
badmintion-share-calculator/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main calculator component
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── theme-provider.tsx # Theme provider
├── lib/                  # Utilities
│   └── utils.ts          # Helper functions
├── hooks/                # Custom React hooks
├── public/               # Static assets
├── netlify.toml          # Netlify deployment config
├── tailwind.config.ts    # Tailwind CSS configuration
├── components.json       # shadcn/ui configuration
└── package.json          # Dependencies and scripts
```

## Configuration Files

- **next.config.mjs**: Next.js configuration with ESLint/TypeScript build errors ignored for V0 deployments
- **tailwind.config.ts**: Tailwind CSS configuration with custom colors and animations
- **components.json**: shadcn/ui configuration with aliases and styling preferences
- **netlify.toml**: Netlify build configuration for Next.js plugin

## Deployment

The project is auto-deployed from V0.dev to both Vercel and Netlify:
- **Vercel**: Primary deployment (auto-synced from V0.dev)
- **Netlify**: Secondary deployment with Next.js plugin

Build settings for Netlify:
- Build command: `npm run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`


## Testing
- **End-to-End**: Testing with Cypress, Page Object Model (POM) approach
- **Key Components Verified:**
  1. Title and Header: "羽毛球费用计算器" (Badminton Cost Calculator) with
  calculator icon
  2. Settings Section: Configurable pricing settings with collapsible
  interface
  3. Input Fields: All required input fields present:
    - 3小时人数 (3-hour participants)
    - 2小时人数 (2-hour participants)
    - 6-7点球数 (6-7pm shuttlecock count)
    - 7-9点球数 (7-9pm shuttlecock count)
  4. Cost Display: Results section ready to display calculations
  5. Responsive Design: Mobile-optimized layout detected

  ✅ Styling:
  - Modern gradient background (green to blue)
  - Card-based UI components
  - Proper spacing and typography
  - Interactive hover states

  ✅ Functionality Ready:
  - Input validation (min="0" attributes)
  - Placeholder text for guidance
  - Collapsible settings panel
  - Copy functionality infrastructure in place