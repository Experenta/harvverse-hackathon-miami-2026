# AI Agent System for Harvverse

## Overview

The AI Agent system uses **dynamic rules** that automatically detect the context of user queries and switch between different expert personas. Each rule has its own system prompt, keywords, and available tools.

## Rules (Expert Personas)

### 1. **Agronomist** 🌾
- **Triggered by**: Keywords like "temperature", "humidity", "soil", "crop", "health", "disease", "irrigation", "harvest", "yield", "varietal"
- **System Prompt**: Expert in crop health, soil conditions, and farming practices
- **Available Tools**:
  - `getSensorData` - Get sensor readings
  - `getLotInfo` - Get lot information
  - `getAgronomicPlan` - Get farming plan details
  - `calculateGrowthMetrics` - Calculate health metrics

**Example Queries**:
- "What's the soil humidity trend?"
- "Should I adjust irrigation based on current conditions?"
- "Is the temperature optimal for this varietal?"

### 2. **Financial Analyst** 💰
- **Triggered by**: Keywords like "investment", "roi", "profit", "revenue", "cost", "price", "yield", "return", "financial", "money", "earnings", "split", "ticket", "margin", "budget"
- **System Prompt**: Expert in investment analysis, ROI, and financial projections
- **Available Tools**:
  - `getPlanInfo` - Get plan financial details
  - `getPartnershipData` - Get partnership information
  - `calculateROI` - Calculate return on investment
  - `getMarketPrices` - Get current market prices

**Example Queries**:
- "What's the ROI on this plan?"
- "How much profit will the farmer make?"
- "What's the current coffee price?"

### 3. **Data Scientist** 📊
- **Triggered by**: Keywords like "data", "analysis", "trend", "pattern", "prediction", "forecast", "anomaly", "statistics", "correlation", "model", "average", "median", "distribution"
- **System Prompt**: Expert in data analysis, trends, and predictive modeling
- **Available Tools**:
  - `getSensorHistory` - Get historical sensor data
  - `calculateStatistics` - Calculate statistical metrics
  - `detectAnomalies` - Detect unusual patterns
  - `predictYield` - Predict future yield

**Example Queries**:
- "Are there any anomalies in the sensor data?"
- "What's the trend in temperature over the last month?"
- "Can you predict the yield based on current conditions?"

### 4. **Farm Manager** 👨‍🌾
- **Triggered by**: Keywords like "task", "schedule", "labor", "equipment", "maintenance", "pest", "disease", "harvest", "logistics", "quality", "control", "operation", "daily", "work"
- **System Prompt**: Expert in day-to-day farm operations and resource management
- **Available Tools**:
  - `getLotInfo` - Get lot information
  - `getSensorData` - Get sensor readings
  - `getTaskSchedule` - Get task schedule
  - `getResourceStatus` - Get resource availability

**Example Queries**:
- "What tasks should I prioritize this week?"
- "Do we have enough labor for harvest?"
- "What equipment needs maintenance?"

### 5. **General Assistant** 🤖
- **Triggered by**: Default when no specific keywords match
- **System Prompt**: General purpose assistant for miscellaneous questions
- **Available Tools**:
  - `getLotInfo` - Get lot information
  - `getPlanInfo` - Get plan information
  - `getPartnershipData` - Get partnership information
  - `getSettlementInfo` - Get settlement information

## How It Works

1. **User sends a message** to the chat
2. **Rule detection** analyzes keywords in the message
3. **Appropriate rule is selected** based on keyword matches (minimum 2 keywords)
4. **System prompt is loaded** with the rule's instructions
5. **Available tools are prepared** for the AI to use
6. **AI generates response** using the rule's context and tools
7. **Message is saved** with the rule and tools used

## Tools Available

### Sensor Tools
- `getSensorData(moduleId, weeks)` - Get sensor readings for a module
- `calculateGrowthMetrics(moduleId, weeks)` - Calculate health metrics
- `detectAnomalies(moduleId, weeks)` - Detect unusual patterns
- `calculateStatistics(moduleId, weeks)` - Get statistical analysis

### Lot & Plan Tools
- `getLotInfo(lotCode)` - Get lot information
- `getPlanInfo(planCode)` - Get plan details
- `getAgronomicPlan(planCode)` - Get farming plan

### Financial Tools
- `calculateROI(investment, revenue, costs)` - Calculate ROI
- `getMarketPrices(varietal)` - Get current prices

### Partnership & Settlement Tools
- `getPartnershipData(partnershipId)` - Get partnership info
- `getSettlementInfo(settlementId)` - Get settlement details

### Operational Tools
- `getTaskSchedule(lotCode)` - Get task schedule
- `getResourceStatus(lotCode)` - Get resource availability
- `predictYield(moduleId, weeks)` - Predict yield

## Database Schema

### `chatMessages` Table
```typescript
{
  conversationId: string;      // Unique conversation ID
  role: "user" | "assistant";  // Message sender
  content: string;             // Message content
  rule?: string;               // Rule used (for assistant messages)
  toolsUsed?: string[];        // Tools used (for assistant messages)
  createdAt: number;           // Timestamp
}
```

### `conversations` Table
```typescript
{
  conversationId: string;      // Unique conversation ID
  lotCode?: string;            // Associated lot (optional)
  title: string;               // Conversation title
  createdAt: number;           // Creation timestamp
  updatedAt: number;           // Last update timestamp
}
```

## API Functions

### Chat Functions
- `createConversation(conversationId, lotCode, title)` - Create a new conversation
- `addMessage(conversationId, role, content, rule, toolsUsed)` - Add a message
- `getConversationHistory(conversationId, limit)` - Get chat history
- `getConversation(conversationId)` - Get conversation metadata
- `getConversationsByLot(lotCode)` - Get all conversations for a lot
- `getLatestMessages(conversationId, count)` - Get latest messages
- `deleteConversation(conversationId)` - Delete a conversation

### Agent Functions
- `processMessage(conversationId, message, lotCode)` - Process user message and generate response
- `executeToolQuery(tool, params)` - Execute a specific tool

## Frontend Components

### `AIChat` Component
```tsx
<AIChat
  conversationId="conv-123"
  lotCode="zafiro-001"
  title="Farm Assistant Chat"
/>
```

### `SensorStats` Component
```tsx
<SensorStats
  moduleId="50e963ae-6454-436f-b8b3-4a3740b22572"
  weeks={4}
/>
```

## Integration with Claude API

To integrate with Claude API, update the `generateResponse` function in `convex/ai/agent.ts`:

```typescript
async function generateResponse(
  systemPrompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  userMessage: string,
  tools: string[]
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...history,
        { role: "user", content: userMessage },
      ],
    }),
  });

  const data = await response.json();
  return data.content[0].text;
}
```

## Next Steps

1. **Migrate mock data to Convex**: Move lots and plans from mock files to Convex tables
2. **Integrate Claude API**: Add API key and implement actual AI responses
3. **Add more tools**: Create tools for specific use cases
4. **Enhance rule detection**: Add more keywords and improve detection logic
5. **Add authentication**: Secure conversations with user authentication
6. **Add real-time updates**: Use Convex subscriptions for live chat updates
