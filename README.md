# GamZ — Complete Setup Guide
**By Gagandeep Singh Bansal | B.Tech CS 6th Semester**

---

## 📁 YOUR FILES LIST
```
GamZ/
├── index.html         ← Homepage (animated, creature, search, games)
├── auth.html          ← Sign In / Sign Up page
├── game-detail.html   ← Game page (screenshots, trial, buy)
├── download.html      ← Download page (after payment)
├── cart.html          ← Shopping cart
├── my-games.html      ← Profile + My Games
├── about.html         ← About Us
├── contact.html       ← Contact + Feedback form
├── privacy.html       ← Privacy, Terms, Refund, Delivery (all-in-one)
├── terms.html         ← Redirects to privacy.html
├── refund.html        ← Redirects to privacy.html
├── shipping.html      ← Redirects to privacy.html
└── README.md          ← This file
```

---

## 🖥️ STEP 1 — View Website Locally in VS Code

1. Open **VS Code**
2. Install the **"Live Server"** extension:
   - Click the Extensions icon (left sidebar)
   - Search: `Live Server`
   - Click Install (by Ritwick Dey)
3. Right-click on `index.html` → **"Open with Live Server"**
4. Your browser opens at `http://127.0.0.1:5500` — your website!

---

## 💻 STEP 2 — Software to Install on Your Laptop

| Software | Purpose | Download |
|----------|---------|----------|
| VS Code | Code editor | code.visualstudio.com |
| Git | Version control | git-scm.com |
| Node.js (optional) | For future backend | nodejs.org |
| Live Server (VS Code ext) | Local preview | Via VS Code extensions |

---

## 🔐 STEP 3 — Google Login (Firebase) — FREE

**This enables "Continue with Google" button. Takes ~10 minutes.**

### 3a. Create Firebase Project
1. Go to **console.firebase.google.com**
2. Click **"Add project"** → Name it `GamZ`
3. Click through the setup (disable Google Analytics if you want)

### 3b. Enable Google Authentication
1. In Firebase console → **Authentication** → **Sign-in method**
2. Click **Google** → Toggle Enable → Save
3. Add your email as support email

### 3c. Get Your Config Keys
1. Click the ⚙️ gear → **Project settings**
2. Scroll to **"Your apps"** → Click `</>` (Web)
3. Name it `GamZ Web` → Register app
4. Copy the `firebaseConfig` object shown

### 3d. Add Firebase to your project
Add this at the bottom of `auth.html` before `</body>`:
```html
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
<script>
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    // ... rest of your config
  };
  firebase.initializeApp(firebaseConfig);
</script>
```

### 3e. Replace the Google button handler in auth.html
Find `function handleGoogleAuth()` and replace with:
```javascript
function handleGoogleAuth() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      localStorage.setItem('gamz_user', JSON.stringify({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      }));
      window.location.href = 'index.html';
    })
    .catch((error) => alert('Google Sign-in failed: ' + error.message));
}
```

---

## 📧 STEP 4 — Welcome Emails (EmailJS) — FREE

**Sends welcome email to users when they sign up / sign in.**

### 4a. Setup EmailJS
1. Go to **emailjs.com** → Sign up free
2. Click **"Add New Service"** → Select **Gmail**
3. Connect your `gamzadventure@gmail.com` account
4. Note your **Service ID** (e.g., `service_abc123`)

### 4b. Create Email Template
1. Click **"Email Templates"** → **"Create New Template"**
2. Subject: `Welcome to GamZ, {{to_name}}! 🎮`
3. Body:
```
Hi {{to_name}},

Welcome to GamZ! 🎮

Your account has been created successfully.
Email: {{to_email}}

You can now browse and buy our games. Don't forget to try our free 30-second trials!

Happy Gaming,
Team GamZ
gamzadventure@gmail.com
```
4. Note your **Template ID** (e.g., `template_xyz456`)

### 4c. Add EmailJS to auth.html
Add in `<head>`:
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script>emailjs.init("YOUR_PUBLIC_KEY");</script>
```

In `handleSignUp()`, after `localStorage.setItem(...)`, add:
```javascript
emailjs.send('service_mab67kv', 'template_zdamwf6', {
  to_name: name,
  to_email: email
});
```

### 4d. Feedback Emails (contact.html)
In `submitFeedback()` in `contact.html`, replace the comment with:
```javascript
emailjs.send('service_abc123', 'template_feedback', {
  from_name: name,
  from_email: email,
  category: document.getElementById('fCat').value,
  message: msg
});
```
Create a separate "feedback" template in EmailJS with these variables.

---

## 💳 STEP 5 — Payment Gateway (Instamojo) — FREE for Students

**Instamojo is the best option for Indian students. No GST required.**

### 5a. Register on Instamojo
1. Go to **instamojo.com** → Sign up free
2. Fill your details — use your own name + PAN card
3. Add your bank account for receiving payments
4. You'll get test API keys immediately, live keys after KYC

### 5b. Create a Payment Link
1. In Instamojo dashboard → **"Payment Links"** → **"Create New"**
2. Create one payment link per game with the correct price
3. Copy each link

### 5c. Add payment links to game-detail.html
Find the `simulatePayment()` function and replace with:
```javascript
function simulatePayment() {
  // Instamojo payment links per game
  const paymentLinks = {
    1:  'https://www.instamojo.com/@yourusername/neon-drift-legends/',
    2:  'https://www.instamojo.com/@yourusername/turbo-street-rush/',
    // ... add for all 25 games
  };
  const link = paymentLinks[game.id];
  if (link) {
    window.open(link, '_blank');
  } else {
    alert('Payment link not set up yet. See README Step 5.');
  }
}
```

### 5b. After Payment — Redirect to Download
Instamojo lets you set a "Redirect URL" after payment. Set it to:
```
https://yourdomain.com/download.html?id=GAME_ID
```

---

## 🎮 STEP 6 — Upload Your Games & Set Download Links

### 6a. Upload game to Google Drive
1. Create a folder in Google Drive called `GamZ Games`
2. Upload your game `.zip` or `.exe` file
3. Right-click the file → **Share** → **"Anyone with the link"** → Copy link
4. The link looks like: `https://drive.google.com/file/d/FILE_ID_HERE/view`
5. Copy just the `FILE_ID_HERE` part

### 6b. Update download.html
Find the `GAMES` array in `download.html`. Replace:
```
drive:"https://drive.google.com/uc?export=download&id=YOUR_FILE_ID_1"
```
With your actual file ID:
```
drive:"https://drive.google.com/uc?export=download&id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
```
Do this for each of the 25 games.

**✅ Answer to your question: Google Drive is totally fine for now.** 
It's free, works great, and is what many small indie devs use. 
When you have money, upgrade to AWS S3 or Cloudflare R2 for faster downloads.

---

## 🌐 STEP 7 — Put Website Online (GitHub + Netlify) — FREE & 24/7

### 7a. Install Git
1. Download from **git-scm.com**
2. Install with default settings

### 7b. Create GitHub Account
1. Go to **github.com** → Sign up free
2. Create a new repository named `gamz-website`
3. Make it **Public**

### 7c. Push your code to GitHub (first time)
Open a terminal in VS Code (Terminal → New Terminal):
```bash
cd path/to/your/GamZ/folder
git init
git add .
git commit -m "Initial GamZ website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gamz-website.git
git push -u origin main
```

### 7d. Deploy on Netlify (FREE — 24/7 live)
1. Go to **netlify.com** → Sign up with GitHub
2. Click **"New site from Git"**
3. Select **GitHub** → Select your `gamz-website` repo
4. Deploy settings: Branch = `main`, Build command = (leave empty), Publish directory = `/`
5. Click **"Deploy Site"**
6. Netlify gives you a URL like `gamz-adventure.netlify.app`

### 7e. Auto-deploy when teammates push changes
This is AUTOMATIC once set up! Any teammate does:
```bash
git add .
git commit -m "Updated game prices"
git push
```
And Netlify automatically redeploys within 1–2 minutes. ✅

### 7f. All 4 teammates — GitHub collaboration
1. Go to your GitHub repo → **Settings** → **Collaborators**
2. Add your teammates' GitHub usernames
3. They `git clone` the repo to their machine
4. They make changes → `git add . && git commit -m "change" && git push`
5. You review changes with Pull Requests (optional but recommended)

### 7g. Custom Domain (Optional, low-cost)
- **Freenom.com** — Free `.tk`, `.ml` domains (fine for students)
- **GoDaddy India** — `.in` domain ~₹500/year
- Connect it in Netlify → Domain settings → Add custom domain

---

## 👥 STEP 8 — User Signup Tracking (Admin View)

Currently users are stored in `localStorage`. For a real admin dashboard showing all signups:

### Quick free option — Google Sheets via Google Forms
1. Create a Google Form with: Name, Email, Signup Date
2. When user signs up in `auth.html`, submit silently to the form
3. All responses appear in a Google Sheet — your admin dashboard!

Add this to `handleSignUp()` in auth.html:
```javascript
// Submit to Google Form (replace with your form's submit URL)
fetch('https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse', {
  method:'POST', mode:'no-cors',
  body: new URLSearchParams({
    'entry.FIELD_1': name,
    'entry.FIELD_2': email,
    'entry.FIELD_3': new Date().toLocaleString('en-IN')
  })
});
```

---

## 📊 STEP 9 — Data Science Feature (Bonus — Your College Project!)

**Add a simple analytics dashboard to make this a real data science project:**

### What to track:
- How many users signed up per day (time-series graph)
- Which games are most popular (bar chart)
- Sales by category (pie chart)
- Revenue over time (line chart)

### How to do it free:
1. Store events in **Google Sheets** (via Forms as above)
2. Use **Chart.js** (already available in your HTML) to visualize
3. Create an `admin.html` page that reads and charts the data

This becomes your **"Web Analytics Dashboard"** data science project! 🎓

---

## 🔁 DAILY WORKFLOW FOR YOUR TEAM

```bash
# Every morning — get latest changes
git pull

# After making changes
git add .
git commit -m "What you changed"
git push
# → Netlify auto-updates in 1-2 min ✅
```

---

## ✅ CHECKLIST — Things to Do Manually

- [ ] Install VS Code + Live Server extension
- [ ] Install Git
- [ ] Create GitHub account + repo + push code
- [ ] Connect repo to Netlify
- [ ] Create Firebase project + enable Google Auth
- [ ] Set up EmailJS + welcome email template
- [ ] Register on Instamojo + create payment links for all 25 games
- [ ] Upload games to Google Drive + update download.html file IDs
- [ ] Add teammates as GitHub collaborators
- [ ] (Optional) Set up Google Forms for user tracking
- [ ] (Optional) Get a custom domain

---

## 📬 Support
Email: gamzadventure@gmail.com

**Good luck, Gagandeep! You've got this. 🚀🎮**
