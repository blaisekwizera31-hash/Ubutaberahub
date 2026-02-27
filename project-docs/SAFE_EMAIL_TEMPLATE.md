# Safe Email Template (No Blocked Keywords)

## This template avoids Supabase's blocked keywords

Copy and paste this into Supabase → Authentication → Email Templates → Magic Link:

```html
<h2 style="color: #000000; font-family: Arial, sans-serif;">Password Reset Code</h2>

<p style="font-family: Arial, sans-serif; color: #333333;">Hello,</p>

<p style="font-family: Arial, sans-serif; color: #333333;">
  You requested to reset your password for UBUTABERAhub. 
  Use the code below:
</p>

<div style="background-color: #f9f9f9; border: 2px solid #000000; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
  <p style="font-size: 14px; color: #666666; margin-bottom: 10px;">YOUR RESET CODE</p>
  <p style="font-size: 48px; font-weight: bold; color: #000000; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 0;">
    {{ .Token }}
  </p>
</div>

<div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
  <p style="font-family: Arial, sans-serif; color: #333333; font-weight: bold;">How to reset:</p>
  <p style="font-family: Arial, sans-serif; color: #333333;">1. Go back to UBUTABERAhub</p>
  <p style="font-family: Arial, sans-serif; color: #333333;">2. Enter the code above</p>
  <p style="font-family: Arial, sans-serif; color: #333333;">3. Create your new password</p>
  <p style="font-family: Arial, sans-serif; color: #333333;">4. Sign in</p>
</div>

<div style="background-color: #fff9e6; border-left: 4px solid #000000; padding: 15px; margin: 20px 0;">
  <p style="font-family: Arial, sans-serif; font-size: 14px; color: #666666;">
    This code expires in 10 minutes. If you did not request this, ignore this message.
  </p>
</div>

<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

<p style="font-family: Arial, sans-serif; font-size: 14px; color: #666666;">
  Need help? Contact support at support@ubutaberahub.rw
</p>

<p style="font-family: Arial, sans-serif; font-size: 14px; color: #666666; text-align: center;">
  <strong>UBUTABERAhub</strong><br>
  Rwanda's Digital Justice Platform<br>
  © 2024 UBUTABERAhub. All rights reserved.
</p>
```

---

## Even Simpler Version (If Above Still Fails)

If the above still has issues, use this minimal version:

```html
<h2>Password Reset Code</h2>

<p>Hello,</p>

<p>You requested to reset your password for UBUTABERAhub.</p>

<div style="background: #f9f9f9; border: 2px solid #000; padding: 30px; text-align: center; margin: 20px 0;">
  <p style="font-size: 48px; font-weight: bold; letter-spacing: 8px; margin: 0;">
    {{ .Token }}
  </p>
</div>

<p><strong>How to reset:</strong></p>
<p>1. Go back to UBUTABERAhub</p>
<p>2. Enter the code above</p>
<p>3. Create your new password</p>

<p>This code expires in 10 minutes.</p>

<hr>

<p style="text-align: center;">
  <strong>UBUTABERAhub</strong><br>
  Rwanda's Digital Justice Platform
</p>
```

---

## To Add Your Logo (After Template Works)

Once the template saves successfully, you can add your logo at the top:

```html
<div style="text-align: center; background: #000; padding: 20px;">
  <img src="YOUR_LOGO_URL_HERE" alt="UBUTABERAhub" style="max-width: 200px;">
</div>

<h2>Password Reset Code</h2>
<!-- rest of template -->
```

Replace `YOUR_LOGO_URL_HERE` with your actual logo URL.

---

## Common Blocked Keywords to Avoid

Supabase blocks these for security:
- script
- javascript
- onclick
- onerror
- eval
- iframe
- form
- input
- button (sometimes)
- meta (sometimes)

The templates above avoid all these keywords.

---

## Steps to Use:

1. Copy the "Safe Email Template" above
2. Go to Supabase → Authentication → Email Templates → Magic Link
3. Paste the template
4. Click Save
5. Should work now!

If it still fails, use the "Even Simpler Version" - that one definitely works!
