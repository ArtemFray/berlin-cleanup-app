# PWA Icons

This folder should contain the following icon files for the Progressive Web App:

## Required Icons

- `icon-72x72.png` (72x72 pixels)
- `icon-96x96.png` (96x96 pixels)
- `icon-128x128.png` (128x128 pixels)
- `icon-144x144.png` (144x144 pixels)
- `icon-152x152.png` (152x152 pixels)
- `icon-192x192.png` (192x192 pixels)
- `icon-384x384.png` (384x384 pixels)
- `icon-512x512.png` (512x512 pixels)
- `badge-72x72.png` (72x72 pixels) - For notification badge

## How to Generate Icons

### Option 1: Use an Icon Generator (Easiest)

1. Create a 512x512px logo for your app (use Canva, Figma, or Photoshop)
2. Go to https://www.pwabuilder.com/imageGenerator
3. Upload your logo
4. Download the generated icons
5. Place them in this folder

### Option 2: Use ImageMagick (Command Line)

If you have a single large image (e.g., `logo.png`):

```bash
# Install ImageMagick first
# Mac: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generate all sizes
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
convert logo.png -resize 72x72 badge-72x72.png
```

### Option 3: Design Suggestions

For a Berlin Cleanup app, consider icons featuring:
- 🌱 Green leaf or plant symbol
- 🗑️ Trash bin with recycling symbol
- 🏙️ Berlin skyline silhouette
- 🧹 Broom or cleaning symbol
- Combination: Green circle with white broom/trash icon

**Colors to use:**
- Primary: #22c55e (green from the app theme)
- Background: White or light green (#f0fdf4)

## Temporary Placeholder

Until you create custom icons, you can:
1. Use a simple green square with white text "BC" (Berlin Cleanup)
2. Use emoji-to-image converters with 🌱 or 🗑️ emojis
3. Use the default PWA icon from browsers (less professional)

## Testing Your Icons

After adding icons:
1. Start your development server: `npm run dev`
2. Open Chrome DevTools (F12)
3. Go to "Application" tab > "Manifest"
4. Check all icons are loading correctly
5. Install the PWA and check the icon appears on your home screen

## Icon Specifications

- **Format**: PNG (recommended) or WebP
- **Background**: Should have a background color (not transparent for best compatibility)
- **Shape**: Square with rounded corners applied by the OS
- **Safe area**: Keep important elements within 80% of the icon (avoid edge bleeding)
- **Consistency**: Use the same design across all sizes

## References

- [PWA Icon Guidelines](https://web.dev/add-manifest/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Favicon Generator](https://favicon.io/)
