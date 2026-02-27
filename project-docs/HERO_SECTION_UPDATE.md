# Hero Section - Two-Column Grid Layout

## ✅ What's Been Updated:

### New Layout Structure:

**Two-Column Grid (lg:grid-cols-2):**

#### Left Column - Text Content:
- ✅ Badge with Shield icon
- ✅ Large heading with highlighted text
- ✅ Descriptive subtitle
- ✅ Two CTA buttons (Primary + Secondary)
- ✅ Stats row with 3 metrics (24/7, 3 Languages, 100% Confidential)
- ✅ Left-aligned for better readability

#### Right Column - Visual Content:
- ✅ Professional legal image (Lady Justice/Courtroom)
- ✅ Rounded corners with shadow
- ✅ Subtle gradient overlay
- ✅ Two floating cards:
  - AI Assistant card (top-left)
  - Verified Lawyers card (bottom-right)
- ✅ Decorative blur elements
- ✅ Smooth animations

## 🎨 Design Features:

### Image Selection:
The hero uses a professional legal image from Unsplash:
- **Current**: Lady Justice statue (symbol of law and justice)
- **Alternative options** you can use:

```tsx
// Option 1: Lady Justice (Current)
src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=1000&fit=crop"

// Option 2: Courtroom/Gavel
src="https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800&h=1000&fit=crop"

// Option 3: Law Books
src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=1000&fit=crop"

// Option 4: Modern Court Building
src="https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=800&h=1000&fit=crop"

// Option 5: Legal Documents
src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=1000&fit=crop"
```

### Floating Cards:
1. **AI Assistant Card** (Top-left)
   - Primary color background
   - MessageSquare icon
   - "24/7 Available" text
   - Floating animation (up/down)

2. **Verified Lawyers Card** (Bottom-right)
   - Secondary color background
   - Users icon
   - "500+ Lawyers" text
   - Floating animation (down/up)

### Responsive Behavior:
- **Desktop (lg+)**: Two columns side-by-side
- **Tablet/Mobile**: Stacks vertically (text first, then image)
- **Floating cards**: Hidden on mobile, visible on desktop

## 📱 Responsive Design:

```
Mobile (< 1024px):
┌─────────────────┐
│   Text Content  │
│   - Badge       │
│   - Title       │
│   - Subtitle    │
│   - Buttons     │
│   - Stats       │
├─────────────────┤
│   Image         │
│   (Full width)  │
└─────────────────┘

Desktop (≥ 1024px):
┌──────────────┬──────────────┐
│ Text Content │    Image     │
│ - Badge      │  [Justice]   │
│ - Title      │  [Statue]    │
│ - Subtitle   │  + Cards     │
│ - Buttons    │  + Blur      │
│ - Stats      │              │
└──────────────┴──────────────┘
```

## 🎯 Key Improvements:

1. **Better Visual Hierarchy**
   - Text content is easier to scan
   - Image provides visual interest
   - Balanced composition

2. **Professional Appearance**
   - High-quality legal imagery
   - Clean, modern layout
   - Consistent spacing

3. **Enhanced Engagement**
   - Floating cards draw attention
   - Animations add life
   - Clear call-to-action

4. **Improved Readability**
   - Left-aligned text (easier to read)
   - Better line length
   - Clear visual separation

## 🎨 Color Usage:

- **Primary (Navy)**: AI Assistant card, text highlights
- **Secondary (Emerald)**: Lawyers card
- **Accent (Gold)**: Badge icon, decorative elements
- **Neutral**: Text, backgrounds, borders

## ✨ Animations:

1. **Text Content**: Fade in from bottom (staggered)
2. **Image**: Fade in from right
3. **Floating Cards**: Continuous up/down motion
4. **Decorative Blurs**: Static background elements

## 🖼️ Image Recommendations:

For best results, use images that:
- ✅ Show legal/justice themes (scales, gavel, books, courtroom)
- ✅ Are high quality (at least 800x1000px)
- ✅ Have good lighting and contrast
- ✅ Work well with the overlay gradient
- ✅ Represent professionalism and trust

## 🔧 Customization Options:

### Change Image:
Replace the `src` attribute in line ~95 of HeroSection.tsx

### Adjust Image Height:
Change `h-[600px]` to your preferred height

### Modify Floating Cards:
Edit the content in the motion.div elements (lines ~100-130)

### Update Stats:
Modify the `stats` array in the translations object

---

The hero section now has a modern, professional two-column layout that effectively showcases both the value proposition and visual appeal of the legal platform! 🎉
