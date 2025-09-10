# Civic-Connect AI

A dual-platform municipal issue reporting system with AI-powered triage and offline-first functionality.

## Architecture

- **Admin Web Portal**: Next.js with TypeScript, Tailwind CSS
- **Citizen Mobile App**: React Native with Expo (planned)
- **Shared**: TypeScript types, utilities, mock API layer

## Features

### Citizen Portal (Mobile - Planned)
- Report issues with photo/video and GPS
- AI-powered categorization and duplicate detection
- Offline-first with sync queue
- Real-time status tracking
- Public transparency dashboard

### Admin Portal (Web)
- Live intake dashboard with map clustering
- One-click acknowledgment and assignment
- Automated routing by department/ward
- Field operations oversight
- Analytics and KPI tracking

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start mock API server (in separate terminal)
npm run mock-server
\`\`\`

## Project Structure

\`\`\`
├── app/                 # Next.js app router pages
├── components/          # Shared React components  
├── types/              # TypeScript type definitions
├── lib/
│   ├── constants.ts    # App constants and enums
│   └── utils/          # Utility functions
├── api/                # Mock API server
└── store/              # Zustand state management
\`\`\`

## Mock Data

The application uses MSW (Mock Service Worker) for API mocking during development. Real backend integration points are clearly marked with comments.

## Development Notes

- All AI features (triage, deduplication) are stubbed for demo
- Offline queue system implemented for mobile sync
- Privacy features (face blurring) are placeholder implementations
- Geofencing uses simple radius calculations
