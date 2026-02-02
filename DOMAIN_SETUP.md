
# How to Connect Your Hostinger Domain to Netlify

Since I cannot access your Hostinger account directly, here is the exact process to connect your domain.

## Step 1: Tell Netlify about your domain
1.  Go to your **Netlify Dashboard** for this site.
2.  Click on **Site Settings** > **Domain management**.
3.  Click **"Add a domain"**.
4.  Enter your domain name (e.g., `www.yourshop.com`) and click **Verify**.
5.  Click **"Add domain"** again if prompted.

## Step 2: Get Netlify Nameservers
Once added, Netlify will show a warning "Check DNS configuration".
1.  Click on the warning or "Options" next to your domain.
2.  Select **"Set up Netlify DNS"**.
3.  Proceed through the steps until Netlify gives you **4 Nameservers**. They usually look like:
    -   `dns1.p0x.nsone.net`
    -   `dns2.p0x.nsone.net`
    -   `dns3.p0x.nsone.net`
    -   `dns4.p0x.nsone.net`
    *(Keep this tab open or copy these)*

## Step 3: Update Hostinger (Crucial Step)
1.  Log in to your **Hostinger Account**.
2.  Go to **Domains** and find your domain.
3.  Click **"Manage"**.
4.  Look for **"Nameservers"** in the sidebar or dashboard.
5.  Click **"Change"**.
6.  Select **"Change nameservers"** (Switch from "Hostinger nameservers" to "Custom nameservers").
7.  **Paste the 4 Netlify Nameservers** from Step 2 into the fields.
8.  Click **Save**.

## Step 4: Wait for Propagation
-   It can take anywhere from **10 minutes to 24 hours** for the changes to spread across the internet.
-   Once done, your site will automatically show up at your new domain!
