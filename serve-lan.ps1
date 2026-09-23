# My Timetable - serve this folder to the local network.
# Only needs Windows PowerShell (no Node.js, no Python).
# NOTE: keep this file ASCII-only, so Windows PowerShell 5.1 parses it the same way.
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# 8080 may be taken by something else, so try a few ports and use the first free one.
$listener = $null
$port = 0
foreach ($candidate in 8080, 8081, 8090, 8123, 8321, 9021) {
  try {
    $try = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $candidate)
    $try.Start()
    $listener = $try
    $port = $candidate
    break
  } catch {
    # port busy -> try the next one
  }
}

if (-not $listener) {
  Write-Host "  No free port found (tried 8080, 8081, 8090, 8123, 8321, 9021)." -ForegroundColor Red
  exit 1
}

$lan = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) |
  Where-Object { $_.AddressFamily -eq "InterNetwork" } |
  Select-Object -First 1

Write-Host ""
Write-Host "  Serving folder:" -ForegroundColor Green
Write-Host "    $root"
Write-Host ""
Write-Host "  Open this on your phone (same Wi-Fi):" -ForegroundColor Green
Write-Host "    http://$($lan):$port" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Keep this window open. Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $client.ReceiveTimeout = 5000
      $buffer = New-Object byte[] 8192
      $sb = New-Object System.Text.StringBuilder
      do {
        $read = $stream.Read($buffer, 0, $buffer.Length)
        if ($read -le 0) { break }
        [void]$sb.Append([System.Text.Encoding]::ASCII.GetString($buffer, 0, $read))
      } while ($sb.ToString() -notmatch "`r`n`r`n")

      $request = $sb.ToString()
      $parts = ($request -split "`r`n")[0] -split " "
      $path = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
      $path = [System.Uri]::UnescapeDataString(($path -split "\?")[0])
      if ($path -eq "/") { $path = "/index.html" }

      $file = Join-Path $root ($path.TrimStart("/") -replace "/", "\")
      $full = [System.IO.Path]::GetFullPath($file)

      if ($full.StartsWith($root) -and (Test-Path $full -PathType Leaf)) {
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $ext = [System.IO.Path]::GetExtension($full).ToLower()
        $type = switch ($ext) {
          ".html" { "text/html; charset=utf-8" }
          ".css" { "text/css; charset=utf-8" }
          ".js" { "text/javascript; charset=utf-8" }
          ".json" { "application/json; charset=utf-8" }
          ".webmanifest" { "application/manifest+json; charset=utf-8" }
          ".png" { "image/png" }
          ".svg" { "image/svg+xml" }
          default { "application/octet-stream" }
        }
        $header = "HTTP/1.1 200 OK`r`nContent-Type: $type`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`nCache-Control: no-store`r`n`r`n"
        $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($hb, 0, $hb.Length)
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Flush()
      } else {
        $body = [System.Text.Encoding]::UTF8.GetBytes("not found")
        $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($hb, 0, $hb.Length)
        $stream.Write($body, 0, $body.Length)
        $stream.Flush()
      }
    } catch {
      # ignore a broken request, keep serving
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
