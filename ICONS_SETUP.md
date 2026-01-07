# Icons Setup for PWA

To complete the PWA setup, you need to copy the icon files from the `assets/` folder to the `public/icons/` folder.

## Manual Steps:

1. Copy all icon files from `assets/` to `public/icons/`:
   - `icon-36x36.png`
   - `icon-48x48.png`
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

## Using Command Line (Windows):

```bash
copy assets\icon-*.png public\icons\
```

## Using Command Line (Linux/Mac):

```bash
cp assets/icon-*.png public/icons/
```

## Verification:

After copying, verify that all icon files exist in `public/icons/` directory. The PWA manifest references these files.

