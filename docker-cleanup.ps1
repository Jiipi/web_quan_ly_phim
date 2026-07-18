# Xay-dung-website-quan-ly-phim/docker-cleanup.ps1
# Dùng Docker Desktop để chạy script này

Write-Host "=== Docker Cleanup ===" -ForegroundColor Cyan

# Xóa build cache cũ
Write-Host "Dang xoa build cache..." -ForegroundColor Yellow
docker builder prune -af

# Xóa image không dùng
Write-Host "Dang xoa image khong su dung..." -ForegroundColor Yellow
docker image prune -af

# Xóa container đã stop
Write-Host "Dang xoa container da stop..." -ForegroundColor Yellow
docker container prune -f

# Kiểm tra disk usage
Write-Host "`n=== Docker Disk Usage ===" -ForegroundColor Cyan
docker system df

Write-Host "`nDone!" -ForegroundColor Green
