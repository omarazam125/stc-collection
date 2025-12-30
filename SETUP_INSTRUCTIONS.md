# STC VAPI Dashboard - Setup Instructions

## 🔐 Environment Variables Setup

You need to add the following environment variables to your Vercel project. These are server-side only variables (no `NEXT_PUBLIC_` prefix) to keep your API keys secure.

### Required Environment Variables

Go to your Vercel Project Settings → Environment Variables and add:

1. **VAPI_API_KEY** (Required)
   - Your VAPI API key from https://dashboard.vapi.ai/account
   - Example: `sk_live_xxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ Server-side only - never exposed to the browser

2. **VAPI_ASSISTANT_ID** (Required)
   - Your Agent Omar assistant ID
   - Example:`
   - You can find this in your VAPI dashboard URL

3. **VAPI_BASE_URL** (Optional)
   - Default: `https://api.vapi.ai`
   - Only change if VAPI provides a different endpoint

4. **VAPI_PHONE_NUMBER_ID** (Optional)
   - Your VAPI phone number ID if you have a specific number configured
   - Leave empty to use your default VAPI phone number

5. **VAPI_WEBHOOK_SECRET** (Required)
   - Your VAPI webhook secret for secure real-time updates
   - Example: `your_secret_here`

### How to Add Environment Variables in Vercel

1. Click the **Gear Icon** (⚙️) in the top right of the v0 interface
2. Select **Environment Variables**
3. Click **Add Variable**
4. Enter the variable name (e.g., `VAPI_API_KEY`)
5. Enter the value
6. Select which environments (Production, Preview, Development)
7. Click **Save**

### Security Note

⚠️ **Important**: All VAPI credentials must be server-side only. Never use the `NEXT_PUBLIC_` prefix for API keys, as this exposes them to the client browser.

✅ **Correct Configuration**:
```
VAPI_API_KEY=sk_live_xxxxx
VAPI_ASSISTANT_ID=bd8d6522-xxxx
VAPI_BASE_URL=https://api.vapi.ai
VAPI_WEBHOOK_SECRET=your_secret_here
```

All API calls are made from server-side routes and server actions to keep your credentials secure.

## 🚀 Getting Your VAPI Credentials

### 1. Get Your API Key

1. Go to https://dashboard.vapi.ai
2. Click on your profile/account settings
3. Navigate to **API Keys**
4. Copy your API key (starts with `sk_live_` or `sk_test_`)

### 2. Get Your Assistant ID

You already have this! It's: `bd8d6522-1374-4a01-8430-131fb476308c`

You can also find it in the URL when viewing your assistant:
`https://dashboard.vapi.ai/assistants/YOUR_ASSISTANT_ID`

### 3. Configure Agent Omar in VAPI

1. Go to your assistant: https://dashboard.vapi.ai/assistants/bd8
2. Copy the **System Prompt** from `AGENT_OMAR_PROMPT.md`
3. Paste it into the "System Prompt" field in VAPI
4. Set the **First Message**: `Hello, this is Omar from STC. Am I speaking with {{customer_name}}?`
5. Configure voice settings (ElevenLabs recommended)
6. Enable recording and transcription
7. Save your assistant

## 📞 Testing the Integration

1. After adding environment variables, redeploy your app or wait for the next deployment
2. Open the dashboard homepage
3. You should see a green "Connected to VAPI" status
4. Go to the **Calls** page
5. Click **Make New Call**
6. Fill in customer details
7. Click **Start Call with Agent Omar**
8. Agent Omar will call the customer!

## 🔍 Troubleshooting

### Connection Status Shows "Offline"

1. Check that all environment variables are set correctly in Project Settings
2. Verify your VAPI API key is valid (not expired)
3. Check the browser console for detailed error messages
4. Make sure your VAPI account is active and has credits

### Calls Not Working

1. Verify you have a phone number configured in VAPI
2. Check that your VAPI account has sufficient credits
3. Ensure the customer phone number is in the correct format (E.164: +966XXXXXXXXX)
4. Check the API logs in VAPI dashboard for errors

### Environment Variables Not Loading

1. After adding variables, you must redeploy your app
2. In v0, click **Publish** to deploy with new environment variables
3. Wait 1-2 minutes for deployment to complete
4. Refresh the page

## 📊 Next Steps

Once connected:

1. ✅ Test Agent Omar with a test call
2. ✅ Review call recordings and transcripts
3. ✅ Configure webhook URL for real-time updates
4. ✅ Import your customer list
5. ✅ Start making collection calls!

## 🆘 Need Help?

- VAPI Documentation: https://docs.vapi.ai
- VAPI Support: support@vapi.ai
- Check `AGENT_OMAR_PROMPT.md` for the complete agent configuration
