# Pulse — Live Location Sharing & Trusted Circles

Pulse is a modern, privacy-focused, real-time location sharing and circle activity web application. Built with React 19, TypeScript, Express, Leaflet, and Tailwind CSS.

---

## 🏗️ Project Architecture & File Structure

The project follows a **Domain-Driven Architecture** for maximum modularity, clean separation of concerns, and instant developer navigation.

```
pulse/
├── server/                    # Express Backend Sub-modules
│   ├── middleware/            # Auth, rate limiter, input sanitizer
│   ├── routes/                # Express API routes (users, circles, shares, pings, memoryPins, notifications)
│   ├── store/                 # In-memory database store & initial seed data
│   └── utils/                 # Server utility helpers
├── src/                       # React Frontend Application
│   ├── api/                   # Modular API Client Layer
│   │   ├── client.ts          # Core fetch client wrapper with header injection & error handling
│   │   ├── users.api.ts       # User & profile API services
│   │   ├── circles.api.ts     # Circle management API services
│   │   ├── shares.api.ts      # Live location share API services
│   │   ├── pings.api.ts       # Ping check-in API services
│   │   ├── memoryPins.api.ts  # Memory pin API services
│   │   ├── notifications.api.ts # Activity notifications API services
│   │   └── index.ts           # Central API service barrel
│   ├── components/            # Domain-Structured UI Components
│   │   ├── circles/           # Circles management views & components
│   │   ├── layout/            # Navbar, ActiveShareBanner, NotificationsDrawer
│   │   ├── map/               # MapView, MapControls, MapOverlayActions, mapUtils
│   │   ├── memoryPins/        # Memory pins list & cards
│   │   ├── modals/            # ShareLocationModal, SendPingModal, MemoryPinsModal, SettingsModal, RegisterAccountModal
│   │   ├── pings/             # Pings list & cards
│   │   └── ui/                # Shared UI Primitives (Avatar, Badge)
│   ├── hooks/                 # Custom React Hooks (usePulseState, useModalState)
│   ├── types/                 # Modular Domain Types & Validation Schemas
│   │   ├── user.types.ts      # UserProfile & Auth interfaces
│   │   ├── circle.types.ts    # Circle interfaces & Zod schemas
│   │   ├── share.types.ts     # LocationShare interfaces & Zod schemas
│   │   ├── ping.types.ts      # Ping interfaces & Zod schemas
│   │   ├── memoryPin.types.ts # MemoryPin interfaces & Zod schemas
│   │   ├── notification.types.ts # NotificationItem interface
│   │   └── index.ts           # Central types barrel
│   ├── utils/                 # Formatting, date/time, and avatar utilities
│   ├── App.tsx                # Root container & main view switcher
│   ├── main.tsx               # Client entry file
│   └── index.css              # Custom styling & Leaflet map theme
├── server.ts                  # Server entry file
└── package.json
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Verify Code Quality & Type Safety
```bash
npm run lint
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🌟 Key Features

- **Live Location Sharing**: Share your live location with custom active timers (15m, 1h, 3h, 8h) and activity labels.
- **Trusted Circles**: Private groups limited strictly to max 5 members for family and close partners.
- **Circle Pings**: Instant alerts and check-in messages with optional attached GPS coordinates.
- **Memory Pins**: Bookmark memorable places, coffee spots, and meetups on the interactive map.
- **Interactive Map Controls**: Toggle map themes (Dark Voyager / OpenStreetMap), center on device GPS location, and toggle category layer visibility.
- **Privacy & Security**: Built-in rate limiting, HTML input sanitization, and instant account data purge capability.
