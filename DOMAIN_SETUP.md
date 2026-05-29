# 🚨 CRITICAL FIX: Whitelist Your Domain in Razorpay

The error **"Payment blocked as website does not match registered website(s)"** means Razorpay is blocking payments because it doesn't trust your website URL yet.

**You MUST do this to unlock payments:**

1.  **Login** to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2.  Go to **Settings** (Look for the Settings option, usually bottom-left).
3.  Click on **Website & app settings** (or just "Website").
4.  Adding your domain:
    *   Click **"Add Website"** or **"Manage Website"**.
    *   Enter your website URL: `https://divineguidancestudio.in`
    *   (Optional) Also add: `https://divineguidancestudio.netlify.app`
5.  **Save** the changes.

## ⚠️ Important Note
If you cannot find "Website Settings":
1.  Go to **API Keys** tab in Settings.
2.  If you generated the keys for "localhost" or a different site, you might need to **Regenerate the Keys** specifically for this new domain, OR find the "Whitelisted Domains" section under that Key's settings.

**Once you save this in Razorpay, the error will disappear INSTANTLY.**
