# STC VAPI Dashboard - Integration Guide

## Overview
This dashboard is fully integrated with VAPI for AI-powered call center operations. Follow this guide to connect your VAPI account and start making calls with Agent Omar.

## Prerequisites

### 1. VAPI Account Setup
- Sign up at https://vapi.ai
- Create a new organization
- Note your API credentials

### 2. Required VAPI Credentials
You'll need the following from your VAPI dashboard:

- **API Key**: Found in Settings > API Keys
- **Assistant ID**: Create an assistant and copy its ID
- **Phone Number ID**: Purchase or configure a phone number in VAPI
- **Webhook Secret**: Generate in Settings > Webhooks

## Step-by-Step Integration

### Step 1: Configure Environment Variables

Add these to your Vercel project or `.env.local`:

```bash
VAPI_API_KEY=your_vapi_api_key_here
VAPI_BASE_URL=https://api.vapi.ai
VAPI_ASSISTANT_ID=your_assistant_id_here
VAPI_PHONE_NUMBER_ID=your_phone_number_id_here
VAPI_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 2: Create VAPI Assistant (Agent Omar)

1. Go to VAPI Dashboard > Assistants
2. Click "Create Assistant"
3. Configure the assistant:
   - **Name**: Agent Omar
   - **Voice**: Choose a professional male voice (recommended: 11Labs)
   - **Model**: GPT-4 or GPT-4-turbo
   - **System Prompt**: Copy from `lib/vapi-agent-prompt.ts`
   - **First Message**: "Hello, this is Omar from STC. Am I speaking with {{customer_name}}?"

4. Enable these features:
   - ✅ Recording
   - ✅ Transcription
   - ✅ End Call Function
   - ✅ Fillers (um, uh for natural speech)

5. Save and copy the Assistant ID

### Step 3: Configure Webhooks

1. In VAPI Dashboard > Webhooks
2. Add webhook URL: `https://your-domain.com/api/vapi/webhook`
3. Select events:
   - call.started
   - call.ended
   - transcript.updated
   - recording.ready
4. Save webhook secret

### Step 4: Test Connection

1. Navigate to Settings page in the dashboard
2. Enter your VAPI credentials
3. Click "Test Connection"
4. Verify connection status shows "Connected"

### Step 5: Make Your First Call

1. Go to "Call Management" page
2. Click "Make New Call"
3. Fill in customer details:
   - Customer Name
   - Phone Number
   - Account Balance
   - Due Date
   - Purpose
4. Click "Start Call with Agent Omar"

## VAPI API Endpoints Used

### Make Outbound Call
```typescript
POST https://api.vapi.ai/call
Headers:
  Authorization: Bearer YOUR_API_KEY
Body:
  {
    "assistantId": "YOUR_ASSISTANT_ID",
    "customer": {
      "number": "+966501234567",
      "name": "Ahmed Al-Rashid"
    },
    "metadata": {
      "accountBalance": "2450",
      "dueDate": "2025-02-15",
      "purpose": "Overdue Follow-up"
    }
  }
```

### Get Call Details
```typescript
GET https://api.vapi.ai/call/{callId}
Headers:
  Authorization: Bearer YOUR_API_KEY
```

### List Calls
```typescript
GET https://api.vapi.ai/call?status=in-progress&limit=50
Headers:
  Authorization: Bearer YOUR_API_KEY
```

### End Call
```typescript
DELETE https://api.vapi.ai/call/{callId}
Headers:
  Authorization: Bearer YOUR_API_KEY
```

## Dynamic Variables in Calls

The dashboard automatically passes these variables to VAPI:

- `{{customer_name}}` - Customer's full name
- `{{account_balance}}` - Outstanding balance
- `{{due_date}}` - Payment due date
- `{{phone_number}}` - Customer's phone number
- `{{purpose}}` - Reason for call

Agent Omar will use these in conversations automatically.

## Webhook Event Handling

The dashboard receives real-time updates via webhooks:

### call.started
Triggered when a call begins. Updates UI to show active call.

### call.ended
Triggered when call ends. Stores:
- Call duration
- Outcome
- Cost
- Final status

### transcript.updated
Real-time transcript updates during call. Displays live conversation.

### recording.ready
Triggered when recording is processed. Stores recording URL for playback.

## Real-time Features

### Live Call Monitoring
- See active calls in real-time
- View live transcripts as they happen
- Monitor call duration
- Control calls (mute, hold, end)

### Automatic Logging
All calls are automatically logged with:
- Complete transcript
- Recording
- Duration
- Outcome
- Customer sentiment analysis

## Agent Omar Capabilities

Agent Omar is configured to:

1. **Identify & Verify**: Confirms speaking with correct customer
2. **Inform**: Clearly states overdue amount and due date
3. **Negotiate**: Discusses payment options and arrangements
4. **Schedule**: Books callbacks if customer needs more time
5. **Escalate**: Handles disputes by escalating to billing
6. **Document**: Logs all outcomes and agreements

## Use Case Implementation

### Use Case 1: Overdue Follow-Up
```typescript
// Bulk schedule calls for overdue accounts
const overdueAccounts = await getOverdueAccounts()

for (const account of overdueAccounts) {
  await vapiClient.makeCall({
    name: account.customerName,
    phoneNumber: account.phoneNumber,
    accountBalance: account.balance,
    dueDate: account.dueDate,
    purpose: "Overdue Follow-up"
  })
}
```

### Use Case 2: Scheduled Callbacks
```typescript
// Schedule callback for specific date/time
await scheduleCallback({
  customerId: "cust-123",
  scheduledDate: "2025-02-15",
  scheduledTime: "10:00",
  purpose: "Payment plan follow-up"
})
```

## Troubleshooting

### Connection Issues
- Verify API key is correct
- Check if VAPI account is active
- Ensure webhook URL is publicly accessible

### Calls Not Starting
- Verify phone number format (+country code)
- Check VAPI account balance
- Ensure assistant ID is correct

### Webhooks Not Received
- Verify webhook URL is correct
- Check webhook secret matches
- Ensure endpoint is publicly accessible
- Check server logs for errors

## Best Practices

1. **Test with Small Batches**: Start with 5-10 calls to test
2. **Monitor Quality**: Review transcripts regularly
3. **Update Prompts**: Refine Agent Omar's responses based on outcomes
4. **Track Metrics**: Use analytics to measure success rates
5. **Handle Failures**: Implement retry logic for failed calls

## Support

For VAPI-specific issues:
- VAPI Documentation: https://docs.vapi.ai
- VAPI Support: support@vapi.ai

For dashboard issues:
- Check console logs for errors
- Review webhook delivery in VAPI dashboard
- Verify environment variables are set correctly

## Cost Considerations

VAPI charges per minute of call time:
- Typical call: 3-5 minutes
- Average cost: $0.10-0.20 per call
- Monitor usage in VAPI dashboard

## Next Steps

1. Configure your VAPI credentials in Settings
2. Create Agent Omar assistant in VAPI
3. Test with a few calls
4. Review transcripts and outcomes
5. Scale up to production volume

Your STC VAPI Dashboard is now ready for production use!
