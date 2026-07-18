# Xay-dung-website-quan-ly-phim/docker-compact.ps1
# Script to compact Docker WSL2 disk space (ext4.vhdx) using Windows diskpart.
# Run this script in PowerShell as Administrator or it will prompt for elevation.

Write-Host "=== Docker Disk Compaction (diskpart) ===" -ForegroundColor Cyan
Write-Host "Please make sure you have run prune/cleanup commands (e.g., .\docker-cleanup.ps1) first to free up space inside Docker." -ForegroundColor Yellow


# 1. Stop WSL2 and Docker Desktop
Write-Host "`nStopping WSL2 and Docker..." -ForegroundColor Yellow
wsl --shutdown
Write-Host "WSL stopped." -ForegroundColor Green

# 2. Find all VHDX files under Docker WSL directory
$wslDir = "$env:USERPROFILE\AppData\Local\Docker\wsl"
$vhdxFiles = Get-ChildItem -Path $wslDir -Filter "*.vhdx" -Recurse -ErrorAction SilentlyContinue

if ($vhdxFiles.Count -eq 0) {
    Write-Host "No VHDX files found in $wslDir." -ForegroundColor Red
    return
}

foreach ($file in $vhdxFiles) {
    $vhdxPath = $file.FullName
    Write-Host "`nFound VHDX at: $vhdxPath" -ForegroundColor Green
    Write-Host "Original file size: $([Math]::Round($file.Length / 1GB, 2)) GB" -ForegroundColor Cyan

    # 3. Create a temporary script file for diskpart
    $tempFile = [System.IO.Path]::GetTempFileName()
    @"
select vdisk file="$vhdxPath"
attach vdisk readonly
compact vdisk
detach vdisk
exit
"@ | Out-File -FilePath $tempFile -Encoding ascii

    Write-Host "Running diskpart compaction... (Requires Administrator permission)" -ForegroundColor Yellow
    # 4. Run diskpart with the script, prompting for elevation
    Start-Process diskpart -ArgumentList "/s `"$tempFile`"" -Verb RunAs -Wait

    # Clean up temp file
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
    }

    # Refresh file info
    $newFile = Get-Item $vhdxPath
    Write-Host "New file size: $([Math]::Round($newFile.Length / 1GB, 2)) GB" -ForegroundColor Cyan
}

Write-Host "`nCompaction process complete!" -ForegroundColor Green

