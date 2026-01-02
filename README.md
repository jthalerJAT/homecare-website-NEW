# HomeCare Pro - React Website

Professional home care services website built with React.

## 🚀 Quick Deployment to Vercel

### Prerequisites
- [ ] Vercel account created at https://vercel.com (free)
- [ ] Git installed on your computer
- [ ] Node.js 18+ installed

### Deployment Steps

#### Option A: Deploy via Vercel Website (Easiest - No Command Line)

1. **Download this project** to your computer

2. **Go to https://vercel.com** and sign in

3. **Click "Add New Project"**

4. **Click "Deploy from Local Directory"** or upload the folder

5. **Vercel will automatically:**
   - Detect it's a React app
   - Install dependencies
   - Build the project
   - Deploy it live
   - Give you a URL like `homecare-pro.vercel.app`

6. **Done!** Your site is live in ~2 minutes

7. **Add Your Custom Domain:**
   - Go to Project Settings → Domains
   - Add your domain (e.g., `yourdomain.com`)
   - Follow Vercel's DNS instructions

---

#### Option B: Deploy via Command Line (More Control)

1. **Open Terminal/Command Prompt**

2. **Navigate to this folder:**
   ```bash
   cd path/to/homecare-pro-react
   ```

3. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

4. **Login to Vercel:**
   ```bash
   vercel login
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

6. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? **Select your account**
   - Link to existing project? **No**
   - What's your project's name? **homecare-pro**
   - In which directory is your code located? **./
   **
   - Auto-detect settings? **Yes**

7. **Done!** Vercel will give you a live URL

---

#### Option C: Deploy via GitHub (Best for Updates)

1. **Create GitHub account** at https://github.com (if you don't have one)

2. **Create new repository** called `homecare-pro`

3. **In this folder, run:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/homecare-pro.git
   git push -u origin main
   ```

4. **Go to Vercel.com** → New Project

5. **Import from GitHub:**
   - Select `homecare-pro` repository
   - Click Deploy

6. **Future updates are automatic:**
   - Edit files locally
   - Run: `git add . && git commit -m "Update" && git push`
   - Vercel automatically redeploys!

---

## 🏠 Local Development

Want to test locally before deploying?

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Opens at `http://localhost:3000`

---

## 📝 Transferring Your Domain from Wix

### Step 1: Unlock Domain in Wix
1. Log into Wix
2. Go to **Settings → Domains**
3. Click on your domain
4. Select **Transfer Domain Out**
5. Get the **Authorization Code** (EPP code)

### Step 2: Transfer to a Registrar (Choose One)
- **Namecheap** - $10.98/year (recommended)
- **Google Domains** - $12/year
- **GoDaddy** - $17.99/year

**In your chosen registrar:**
1. Select "Transfer Domain"
2. Enter your domain name
3. Enter the authorization code from Wix
4. Complete payment
5. Wait 5-7 days for transfer to complete

### Step 3: Point Domain to Vercel

**Once transfer is complete:**

1. **In Vercel:**
   - Go to your project
   - Settings → Domains
   - Add your domain (e.g., `yourdomain.com`)
   - Vercel will show DNS records needed

2. **In your Registrar (Namecheap/Google Domains):**
   - Go to DNS settings
   - Add the A record Vercel provides
   - Usually: `A @ 76.76.21.21`
   - Add CNAME: `www → cname.vercel-dns.com`

3. **Wait 24-48 hours** for DNS to propagate

4. **Done!** Your domain now points to your new site

---

## 🔧 Customization

### Change Colors
Edit `src/App.js` and search for:
- `#2dd4bf` (teal accent color)
- `#a855f7` (purple accent)
- `#0a0f1e` (dark background)

### Change Business Name
Search and replace `HomeCare Pro` with your business name

### Change Contact Info
Edit the footer section in `src/App.js`

### Add Your Logo
1. Add logo image to `public/` folder
2. In `src/App.js`, find the logo div in Navigation
3. Replace with: `<img src="/logo.png" alt="Logo" />`

---

## 📊 Connecting Backend API

Once you deploy the backend:

1. Create `src/config.js`:
```javascript
export const API_URL = 'https://your-backend-api.com';
```

2. In `src/App.js`, import and use:
```javascript
import { API_URL } from './config';

// In handleSubmit function:
await fetch(`${API_URL}/api/quote-requests`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

---

## 💰 Cost Comparison

### Current (Wix):
- Hosting: $27/month = **$324/year**
- Domain: Included but inflated

### New Setup (Vercel):
- Hosting: **FREE** (up to 100GB bandwidth)
- Domain: $12/year (at Namecheap)
- **Total: $12/year**
- **You save: $312/year** 💰

---

## 🆘 Troubleshooting

### "Command not found: npm"
**Solution:** Install Node.js from https://nodejs.org

### Build fails on Vercel
**Solution:** Check the build logs in Vercel dashboard. Usually a missing dependency.

### Domain not working after 48 hours
**Solution:** 
- Check DNS propagation at https://dnschecker.org
- Verify you added the correct A record and CNAME
- Contact Vercel support (they're very helpful!)

### Want to go back to Wix?
**Don't worry!** Your Wix site stays active until you:
1. Cancel the Wix subscription
2. Point the domain away from Wix

You can test everything on Vercel's temporary URL first!

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **React Docs:** https://react.dev
- **Domain Transfer Help:** Contact your registrar's support

---

## 🎯 Next Steps After Deployment

1. [ ] Deploy frontend to Vercel
2. [ ] Set up backend API (see backend-server.js)
3. [ ] Connect Stripe for payments
4. [ ] Transfer domain from Wix
5. [ ] Point domain to Vercel
6. [ ] Set up email (using SendGrid or similar)
7. [ ] Add Google Analytics (optional)
8. [ ] Launch! 🚀

---

**Questions?** The Vercel community is very helpful, or consult with a developer for custom features.

Good luck with your launch! 🎉
