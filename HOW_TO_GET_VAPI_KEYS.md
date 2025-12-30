# How to Get Your VAPI API Keys

## The Issue: Private vs Public Keys

VAPI has **two types** of API keys:

1. **PRIVATE Key** - For server-side API calls (what you need!)
2. **PUBLIC Key** - For client-side web calls only

**You MUST use the PRIVATE key for this dashboard.**

---

## Step-by-Step: Getting Your Private API Key

### 1. Go to VAPI Dashboard
Visit: [https://dashboard.vapi.ai](https://dashboard.vapi.ai)

### 2. Navigate to API Keys
- Click on your **account menu** (top right)
- Select **"API Keys"**

### 3. Copy the PRIVATE Key
- You'll see two keys listed:
  - **Private Key** ← This is what you need!
  - **Public Key** ← Don't use this one
- Click the **"Copy"** icon next to the **Private Key**

### 4. Add to Environment Variables
In your Vercel project settings:

\`\`\`
VAPI_API_KEY = sk_live_xxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

**Important:** The private key usually starts with `sk_live_` or `sk_test_`

---

## Your Other Required Variables

### VAPI_ASSISTANT_ID
You already have this: `bd8d6522-1374-4a01-8430-131fb476308c`

From the URL: `https://dashboard.vapi.ai/assistants/[ASSISTANT_ID]`

### VAPI_BASE_URL (Optional)
Default: `https://api.vapi.ai`

Only change this if you're using a custom VAPI endpoint.

### VAPI_PHONE_NUMBER_ID (Optional)
If you want to make outbound calls, you'll need a phone number ID from VAPI.

Go to: Dashboard → Phone Numbers → Copy the ID

---

## Troubleshooting

### Still getting 401 errors?

1. **Double-check you copied the PRIVATE key** (not public)
2. **Verify the key is active** in the VAPI dashboard
3. **Check for extra spaces** when pasting the key
4. **Redeploy** your app after adding environment variables

### How to verify which key you're using?

Private keys typically start with:
- `sk_live_...` (production)
- `sk_test_...` (testing)

Public keys typically start with:
- `pk_live_...` (production)
- `pk_test_...` (testing)

If your key starts with `pk_`, you're using the wrong key!

---

## Next Steps

Once you've added the correct PRIVATE API key:

1. Click **"Publish"** in v0 to redeploy
2. The connection status should turn green
3. You'll be able to make calls through the dashboard

Need help? Check the VAPI documentation: [https://docs.vapi.ai](https://docs.vapi.ai)
\`\`\`

\`\`\`tsx file="" isHidden
