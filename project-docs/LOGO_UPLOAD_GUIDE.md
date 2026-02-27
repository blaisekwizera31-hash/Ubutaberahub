# How to Upload Your Logo - Visual Guide

## Your Logo Location
Your logo is currently at: `public/logow.png` in your project folder

---

## Option 1: Imgur (Fastest - 2 minutes)

### Step 1: Open Imgur
```
1. Go to: https://imgur.com
2. You'll see the homepage
```

### Step 2: Upload
```
1. Click the green "New post" button (top right)
   OR
2. Just drag your logo file onto the page
```

### Step 3: Find Your File
```
1. Navigate to your project folder
2. Go to: public/logow.png
3. Drag it to Imgur or click "Browse" to select it
```

### Step 4: Get the Link
```
1. After upload, you'll see your image
2. Right-click on the image
3. Select "Copy image address" (Chrome) or "Copy Image Link" (Firefox)
4. You'll get something like:
   https://i.imgur.com/AbC123.png
```

### Step 5: Use in Supabase
```
1. Go to Supabase Dashboard
2. Authentication → Email Templates → Reset Password
3. Find this line:
   <img src="https://your-domain.com/logo.png" ...>
4. Replace with:
   <img src="https://i.imgur.com/AbC123.png" ...>
5. Click Save
```

**Done! Your logo is now in emails.**

---

## Option 2: Supabase Storage (Recommended)

### Step 1: Go to Supabase Storage
```
1. Open: https://app.supabase.com
2. Select your project: "Ubutaberahub db"
3. Click "Storage" in left sidebar
```

### Step 2: Create Bucket
```
1. Click "Create a new bucket"
2. Name: public-assets
3. Toggle "Public bucket" to ON (important!)
4. Click "Create bucket"
```

### Step 3: Upload Logo
```
1. Click on "public-assets" bucket
2. Click "Upload file" button
3. Select public/logow.png from your computer
4. Click "Upload"
```

### Step 4: Get Public URL
```
1. You'll see your uploaded file: logow.png
2. Click on it
3. Look for "Public URL" or click "Copy URL"
4. You'll get something like:
   https://pbmwancclazpkiingwvr.supabase.co/storage/v1/object/public/public-assets/logow.png
```

### Step 5: Use in Email Template
```
1. Go to Authentication → Email Templates
2. Replace logo URL with your Supabase Storage URL
3. Save
```

**Done! Logo is hosted on your Supabase project.**

---

## Option 3: Deploy App to Vercel (Best Long-term)

### Step 1: Push to GitHub
```bash
# In your project terminal
git add .
git commit -m "Ready for deployment"
git push
```

### Step 2: Deploy to Vercel
```
1. Go to: https://vercel.com
2. Click "Sign Up" (use GitHub account)
3. Click "Import Project"
4. Select your GitHub repository
5. Click "Deploy"
6. Wait 2-3 minutes
```

### Step 3: Get Your URL
```
After deployment, you'll get:
https://your-app-name.vercel.app

Your logo is automatically at:
https://your-app-name.vercel.app/logow.png
```

### Step 4: Use in Email Template
```
Replace logo URL with:
https://your-app-name.vercel.app/logow.png
```

**Done! Logo is on your production domain.**

---

## Troubleshooting

### "Image not showing in email"
**Check:**
- Is the URL publicly accessible? (Open in incognito browser)
- Is it HTTPS? (not HTTP)
- Did you save the email template?
- Try a different email client (Gmail, Outlook)

**Solution:**
- Make sure bucket is PUBLIC (Supabase)
- Use direct image link (not webpage link)
- Clear email cache

### "Access Denied" error
**Problem:** Bucket is private

**Solution:**
1. Go to Supabase Storage
2. Click on bucket settings (gear icon)
3. Make sure "Public" is enabled
4. Or create a new public bucket

### "Image too large"
**Problem:** Logo file is too big for email

**Solution:**
1. Resize logo to max 200px width
2. Compress using: https://tinypng.com
3. Re-upload

---

## Which Method Should I Use?

### For Testing (Right Now):
✅ **Use Imgur** - Takes 2 minutes, no setup

### For Production (Later):
✅ **Use Supabase Storage** - Professional, same infrastructure
✅ **Or Deploy App** - Best long-term solution

### Avoid:
❌ Local file paths (won't work in emails)
❌ Private URLs (recipients can't see them)
❌ HTTP links (use HTTPS only)

---

## Quick Checklist

Before using logo URL in email:

- [ ] URL starts with `https://` (not `http://`)
- [ ] URL ends with `.png` or `.jpg` (direct image link)
- [ ] URL opens in incognito browser (publicly accessible)
- [ ] Image is reasonable size (< 200KB)
- [ ] Image dimensions are good (200-400px wide)

---

## Need Help?

If you're stuck, just:
1. Upload to Imgur (easiest)
2. Copy the image link
3. Send it to me
4. I'll help you add it to the email template

---

## Example URLs

**Good URLs (will work):**
```
✅ https://i.imgur.com/abc123.png
✅ https://your-project.supabase.co/storage/v1/object/public/assets/logo.png
✅ https://your-app.vercel.app/logo.png
✅ https://cdn.example.com/logo.png
```

**Bad URLs (won't work):**
```
❌ file:///C:/Users/You/project/public/logo.png (local file)
❌ http://example.com/logo.png (not HTTPS)
❌ https://imgur.com/abc123 (webpage, not direct image)
❌ https://private-bucket.s3.amazonaws.com/logo.png (private)
```

---

## After Uploading

Once you have your logo URL:

1. Copy the URL
2. Go to Supabase Dashboard
3. Authentication → Email Templates → Reset Password
4. Find: `<img src="https://your-domain.com/logo.png"`
5. Replace with your URL
6. Click Save
7. Test by requesting password reset

Your emails will now have your UBUTABERAhub logo! 🎉
