param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,
  [Parameter(Mandatory = $true)]
  [string]$OutputPath,
  [int]$DropAlphaMax = 60,
  [int]$BgDistMax = 20,
  [double]$AlphaGamma = 0.9,
  [int]$AlphaFloor = 6,
  [switch]$RemoveNearBgSpecks,
  [int]$SpeckDistMax = 25,
  [int]$MaxSpeckSize = 200
)

$ErrorActionPreference = 'Stop'

function Get-EmbeddedPngFromSvg {
  param([string]$SvgPath)

  $svgText = Get-Content -Raw -Path $SvgPath
  if ($svgText -match 'href="data:image/png;base64,([^"]+)"') {
    $b64 = $Matches[1]
    $bytes = [System.Convert]::FromBase64String($b64)
    $tempPath = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.IO.Path]::GetRandomFileName() + '.png')
    [System.IO.File]::WriteAllBytes($tempPath, $bytes)
    return $tempPath
  }

  throw "No embedded base64 PNG found in SVG: $SvgPath"
}

Add-Type -AssemblyName System.Drawing

$sourcePath = $InputPath
$tempExtract = $null
if ([System.IO.Path]::GetExtension($InputPath).ToLowerInvariant() -eq '.svg') {
  $tempExtract = Get-EmbeddedPngFromSvg -SvgPath $InputPath
  $sourcePath = $tempExtract
}

$bmp = [System.Drawing.Bitmap]::FromFile($sourcePath)
try {
  if ($bmp.PixelFormat -ne [System.Drawing.Imaging.PixelFormat]::Format32bppArgb) {
    $clone = New-Object System.Drawing.Bitmap $bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    $g = [System.Drawing.Graphics]::FromImage($clone)
    $g.DrawImage($bmp, 0, 0, $bmp.Width, $bmp.Height)
    $g.Dispose()
    $bmp.Dispose()
    $bmp = $clone
  }

  $width = $bmp.Width
  $height = $bmp.Height
  $pixelCount = $width * $height
  $rect = New-Object System.Drawing.Rectangle 0,0,$width,$height
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $stride = $data.Stride
    $bytes = New-Object byte[] ($stride * $height)
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

    # Background estimate from fully transparent pixels
    [double]$sumR = 0; [double]$sumG = 0; [double]$sumB = 0; [long]$count = 0
    for ($i = 0; $i -lt $bytes.Length; $i += 4) {
      if ($bytes[$i + 3] -eq 0) {
        $sumB += $bytes[$i + 0]
        $sumG += $bytes[$i + 1]
        $sumR += $bytes[$i + 2]
        $count++
      }
    }
    if ($count -gt 0) {
      $bgR = $sumR / $count
      $bgG = $sumG / $count
      $bgB = $sumB / $count
    } else {
      $bgR = 255.0; $bgG = 255.0; $bgB = 255.0
    }

    # Drop near-background low-alpha pixels and decontaminate RGB
    for ($i = 0; $i -lt $bytes.Length; $i += 4) {
      $a = $bytes[$i + 3]
      if ($a -eq 0) {
        $bytes[$i + 0] = 0; $bytes[$i + 1] = 0; $bytes[$i + 2] = 0
        continue
      }

      $r = $bytes[$i + 2]
      $g = $bytes[$i + 1]
      $b = $bytes[$i + 0]

      if ($a -le $DropAlphaMax) {
        $dr = [Math]::Abs($r - $bgR)
        $dg = [Math]::Abs($g - $bgG)
        $db = [Math]::Abs($b - $bgB)
        $dist = [Math]::Max($dr, [Math]::Max($dg, $db))
        if ($dist -le $BgDistMax) {
          $bytes[$i + 0] = 0; $bytes[$i + 1] = 0; $bytes[$i + 2] = 0; $bytes[$i + 3] = 0
          continue
        }
      }

      if ($a -lt 255) {
        $alpha = $a / 255.0
        $newR = ($r - $bgR * (1.0 - $alpha)) / $alpha
        $newG = ($g - $bgG * (1.0 - $alpha)) / $alpha
        $newB = ($b - $bgB * (1.0 - $alpha)) / $alpha

        if ($newR -lt 0) { $newR = 0 } elseif ($newR -gt 255) { $newR = 255 }
        if ($newG -lt 0) { $newG = 0 } elseif ($newG -gt 255) { $newG = 255 }
        if ($newB -lt 0) { $newB = 0 } elseif ($newB -gt 255) { $newB = 255 }

        $bytes[$i + 2] = [byte][math]::Round($newR)
        $bytes[$i + 1] = [byte][math]::Round($newG)
        $bytes[$i + 0] = [byte][math]::Round($newB)
      }

      # Sharpen alpha curve
      $aNorm = $bytes[$i + 3] / 255.0
      $newA = [Math]::Pow($aNorm, $AlphaGamma) * 255.0
      if ($newA -lt $AlphaFloor) {
        $bytes[$i + 0] = 0; $bytes[$i + 1] = 0; $bytes[$i + 2] = 0; $bytes[$i + 3] = 0
      } else {
        if ($newA -gt 255) { $newA = 255 }
        $bytes[$i + 3] = [byte][Math]::Round($newA)
      }
    }

    if ($RemoveNearBgSpecks) {
      $near = New-Object bool[] $pixelCount
      for ($y = 0; $y -lt $height; $y++) {
        $rowOffset = $y * $stride
        $rowIndex = $y * $width
        for ($x = 0; $x -lt $width; $x++) {
          $idx = $rowOffset + ($x * 4)
          if ($bytes[$idx + 3] -eq 0) { continue }
          $dr = [Math]::Abs($bytes[$idx + 2] - $bgR)
          $dg = [Math]::Abs($bytes[$idx + 1] - $bgG)
          $db = [Math]::Abs($bytes[$idx + 0] - $bgB)
          $dist = [Math]::Max($dr, [Math]::Max($dg, $db))
          if ($dist -le $SpeckDistMax) {
            $near[$rowIndex + $x] = $true
          }
        }
      }

      $visited = New-Object bool[] $pixelCount
      $queue = New-Object int[] $pixelCount

      for ($y = 0; $y -lt $height; $y++) {
        for ($x = 0; $x -lt $width; $x++) {
          $p = $y * $width + $x
          if ($visited[$p]) { continue }
          if (-not $near[$p]) { $visited[$p] = $true; continue }

          $head = 0; $tail = 0
          $queue[$tail++] = $p
          $visited[$p] = $true

          while ($head -lt $tail) {
            $cur = $queue[$head++]
            $cy = [int]($cur / $width)
            $cx = $cur - ($cy * $width)
            for ($ny = $cy - 1; $ny -le $cy + 1; $ny++) {
              if ($ny -lt 0 -or $ny -ge $height) { continue }
              $rowIndex = $ny * $width
              for ($nx = $cx - 1; $nx -le $cx + 1; $nx++) {
                if ($nx -lt 0 -or $nx -ge $width) { continue }
                $nidx = $rowIndex + $nx
                if ($visited[$nidx]) { continue }
                if (-not $near[$nidx]) { $visited[$nidx] = $true; continue }
                $visited[$nidx] = $true
                $queue[$tail++] = $nidx
              }
            }
          }

          if ($tail -le $MaxSpeckSize) {
            for ($i = 0; $i -lt $tail; $i++) {
              $pp = $queue[$i]
              $py = [int]($pp / $width)
              $px = $pp - ($py * $width)
              $bi = ($py * $stride) + ($px * 4)
              $bytes[$bi + 0] = 0
              $bytes[$bi + 1] = 0
              $bytes[$bi + 2] = 0
              $bytes[$bi + 3] = 0
            }
          }
        }
      }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
  } finally {
    $bmp.UnlockBits($data)
  }

  $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $bmp.Dispose()
  if ($tempExtract -and (Test-Path $tempExtract)) { Remove-Item -Force $tempExtract }
}

Write-Output $OutputPath
