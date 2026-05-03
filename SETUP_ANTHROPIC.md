# Setup Anthropic API (Claude)

## Get Your API Key

1. Go to https://console.anthropic.com/account/keys
2. Sign in or create an account
3. Click "Create Key"
4. Copy the key

## Add to Environment

Create or update `.env.local` in `packages/nextjs/`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Verify It Works

1. Make sure `pnpm convex dev` is running
2. Run `pnpm start` (or `pnpm -F nextjs dev`)
3. Visit `http://localhost:3000/demo/configure`
4. You should see the AI Agent streaming responses from Claude

## Troubleshooting

### "API key not found"
- Check that `.env.local` exists in `packages/nextjs/`
- Verify the key starts with `sk-ant-`
- Restart the dev server after adding the key

### "Rate limit exceeded"
- You've hit Anthropic's rate limit
- Wait a few minutes and try again
- Consider upgrading your Anthropic plan

### "Invalid API key"
- Double-check the key is correct
- Generate a new key if needed
- Make sure there are no extra spaces

## Cost

Anthropic charges per token used. Claude 3.5 Sonnet is a good balance of cost and quality.

## Next Steps

Once Anthropic is configured:

1. Visit `/demo/configure` to see the AI Agent in action
2. The agent will stream responses about the coffee lot using Claude
3. Try different prompts to test the system

---

For more info: https://docs.anthropic.com/en/api/getting-started
