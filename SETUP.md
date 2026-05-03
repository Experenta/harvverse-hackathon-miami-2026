# Harvverse AI Farm Assistant - Setup Guide

Complete guide to set up and run the Harvverse AI Farm Assistant project.

## Prerequisites

- Node.js 18+ and npm/pnpm
- Git
- Anthropic API key (for Claude AI)
- Convex account (free tier available)

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd harvverse

# Install dependencies using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 2. Environment Setup

Create `.env.local` in `packages/nextjs/`:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud

# Anthropic API
ANTHROPIC_API_KEY=your-anthropic-api-key
```

Create `.env.local` in root (if needed):

```bash
# Convex deployment
CONVEX_DEPLOYMENT=your-deployment-name
```

## Running the Project

### Development Workflow (3 Terminal Windows) - RECOMMENDED

**Terminal 1: Start Local Blockchain**
```bash
pnpm chain
```
This starts a local Hardhat network at `http://localhost:8545`. Keep this running.

**Terminal 2: Deploy Contracts & Start Convex Backend**
```bash
pnpm contracts:deploy
```
Wait for contracts to deploy, then in the same terminal:
```bash
pnpm convex dev
```
This starts Convex backend in development mode. Keep this running.

**Terminal 3: Start Next.js Frontend**
```bash
pnpm start
```
Frontend runs at `http://localhost:3000`. Open this in your browser.

### Quick Start (All-in-One)

If you prefer running everything in one terminal:

```bash
# Build everything
pnpm build

# Then run individually as needed
pnpm chain &
pnpm contracts:deploy &
pnpm start
```

## Database Seeding

The project uses Convex for the backend. To populate the database with sample data:

### Automatic Seeding

1. Navigate to `/demo/configure` in your browser
2. The page automatically loads with sample data from Convex
3. Chat with the AI assistant to see it in action

### Manual Seeding (if needed)

If you need to reseed the database:

1. Go to Convex dashboard
2. Delete existing data from tables: `lots`, `plans`, `agronomicPlans`, `sensorData`
3. Refresh `/demo/configure` page
4. Data will be reseeded automatically

## Project Structure

```
harvverse/
├── packages/
│   ├── hardhat/              # Smart contracts (Solidity)
│   │   ├── contracts/        # Contract source files
│   │   ├── deploy/           # Deployment scripts
│   │   └── test/             # Contract tests
│   └── nextjs/               # Frontend (React + Next.js)
│       ├── app/              # App Router pages
│       │   ├── demo/         # Demo pages
│       │   │   └── configure/  # AI Assistant (MAIN PAGE) ⭐
│       │   ├── api/          # API routes
│       │   │   └── chat/     # Chat API endpoint
│       │   └── blockexplorer/  # Local dev tools
│       └── components/       # React components
│           └── harvverse/    # Custom components
│               ├── AIChat.tsx              # Chat interface
│               ├── SensorStats.tsx         # Sensor metrics
│               └── AgronomicPlanDisplay.tsx # Plan display
├── convex/                   # Backend (Convex)
│   ├── schema.ts             # Database schema (7 tables)
│   ├── ai/
│   │   ├── tools.ts          # Query functions (5 active)
│   │   └── chat.ts           # Chat logic
│   ├── seed/                 # Database seeding
│   │   ├── agronomicPlans.ts # Real plan data
│   │   ├── lots.ts           # Real lot data
│   │   └── ...
│   └── http.ts               # HTTP endpoints
└── plans/                    # Documentation & data
    └── first-product-design/ # Agronomic plan data
```

## Key Pages

- **`/demo/configure`** - Main AI Farm Assistant (Chat + Metrics + Plan) ⭐ START HERE
- **`/debug`** - Contract debugging interface
- **`/blockexplorer`** - Local blockchain explorer (Hardhat only)

## Available Commands

```bash
# Development
pnpm start              # Start Next.js frontend
pnpm chain              # Start local blockchain
pnpm contracts:deploy   # Deploy contracts
pnpm convex dev         # Start Convex backend

# Code Quality
pnpm lint               # Lint all packages
pnpm format             # Format code

# Building
pnpm build              # Build all packages
pnpm next:build         # Build frontend only
pnpm compile            # Compile contracts

# Verification
pnpm verify --network <network>  # Verify contracts on chain
```

## Troubleshooting

### Port Already in Use

If ports 3000, 8545, or 5173 are in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or specify different port
PORT=3001 pnpm start
```

### Convex Connection Issues

```bash
# Regenerate Convex types
pnpm convex codegen

# Restart Convex dev server
pnpm convex dev
```

### Contract Deployment Fails

```bash
# Clear artifacts and redeploy
rm -rf packages/hardhat/artifacts
pnpm contracts:deploy
```

### Chat API Not Working

1. Verify `ANTHROPIC_API_KEY` is set in `packages/nextjs/.env.local`
2. Check browser console for errors
3. Verify Convex is running: `pnpm convex dev`
4. Check that `/demo/configure` page loads without errors

## Features

### AI Farm Assistant (`/demo/configure`)

Three-column layout showing:

1. **Chat Interface** (Left, 2 columns) - Ask questions about:
   - Sensor data and farm health
   - Agronomic plans and milestones
   - Investment analysis
   - Yield predictions
   - Cost breakdowns
   - Contract terms

2. **Sensor Metrics** (Middle, 1 column) - Real-time data:
   - Temperature and humidity trends
   - Farm health status
   - Anomaly detection
   - Yield predictions
   - Growth metrics

3. **Agronomic Plan** (Right, 1 column) - Plan details:
   - Cost breakdown with progress bars
   - 6 milestones with timeline
   - 34 detailed activities
   - 3-year yield projection
   - Contract rules and splits
   - Validator information

### Data

**Lot: Finca Zafiro (Honduras)**
- Code: `zafiro-001`
- Varietal: Parainema
- Altitude: 1,300 msnm
- Area: 0.7 hectáreas
- Region: Comayagua
- Status: Available

**Plan: HVPLAN-ZAF-L02-2026**
- Ticket: $3,425 USD
- Profile: C-Premium
- 6 milestones over 12 months
- 34 detailed activities
- Projected yields: Y1: 6qq, Y2: 10qq, Y3: 14qq
- Yield ceiling: 22qq
- Price: $3.50/lb (fixed), $2.50/lb (floor)
- Split: 60% farmer, 40% partner
- Validator: Jorge Alberto Lanza (Cup of Excellence Honduras 2013 Champion)

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, DaisyUI
- **Backend**: Convex (serverless database)
- **Smart Contracts**: Solidity, Hardhat
- **AI**: Anthropic Claude API (claude-opus-4-1-20250805)
- **Blockchain**: Ethereum (local Hardhat network)
- **Styling**: Tailwind CSS with DaisyUI components

## Important Notes

### Data Accuracy

- Claude AI **ONLY uses real data** from Convex database
- All data is passed directly to Claude in the system prompt
- Claude is instructed to NEVER invent or hallucinate data
- If data is missing, Claude will say "No tengo esa información en la base de datos"

### API Integration

- Chat API: `packages/nextjs/app/api/chat/route.ts`
- Uses `ConvexHttpClient` to fetch real data directly
- Passes all data to Claude in system prompt
- Supports streaming responses

### Database Schema

7 tables in Convex:
1. `modules` - IoT sensor modules
2. `sensorData` - Sensor readings (temperature, humidity, soil moisture)
3. `agronomicPlans` - Detailed agronomic plans with activities and milestones
4. `lots` - Farm lots with location and varietal info
5. `plans` - Investment plans with pricing and yields
6. `chatMessages` - Chat conversation history
7. `conversations` - Conversation metadata

## Support

For issues or questions:

1. Check the `/debug` page for contract state
2. Review Convex dashboard for database issues
3. Check browser console for frontend errors
4. Review terminal output for backend errors
5. Verify all 3 terminals are running (chain, contracts:deploy, start)

## Next Steps

1. Customize the agronomic plan data in `convex/seed/agronomicPlans.ts`
2. Add more lots in `convex/seed/lots.ts`
3. Integrate real sensor data sources
4. Deploy to production (Vercel for frontend, Convex for backend)
5. Set up real wallet integration

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Status**: In-time
