---
name: logo-edge-cleaner
description: Clean up logo PNG/SVG edges by removing white/near-background halos and sharpening alpha. Use when refining transparent logos, removing fringing/white pixels, or producing cleaner PNGs from embedded SVG images.
---

# Logo Edge Cleaner

Use this skill to remove white/near-background specks and sharpen edges on transparent logo images.

## Workflow

1) Prefer the script in `scripts/clean_logo_edges.ps1`.
2) If the input is an SVG with an embedded PNG (`data:image/png;base64`), pass the SVG path directly; the script extracts the PNG automatically.
3) Review the output on dark and light backgrounds. If halos remain, adjust parameters.

## Script usage

```
powershell -ExecutionPolicy Bypass -File .github/skills/logo-edge-cleaner/scripts/clean_logo_edges.ps1 ^
  -InputPath "Images/Logo/ayuta_logo_transparent.svg" ^
  -OutputPath "Images/Logo/ayuta_logo_transparent_clean.png"
```

### Common adjustments

- Increase `-DropAlphaMax` to remove more faint near-background pixels.
- Increase `-BgDistMax` to treat more near-background colors as removable.
- Lower `-AlphaGamma` to make edges crisper (more opaque).
- Enable `-RemoveNearBgSpecks` to delete tiny near-background clusters.
- Increase `-MaxSpeckSize` if specks remain.

## Notes

- This script is tuned for light backgrounds (e.g., off-white). It estimates the background from fully transparent pixels.
- Avoid aggressive settings that can thin strokes or remove fine details.
