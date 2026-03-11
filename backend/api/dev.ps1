param(
  [ValidateSet("up","down","logs","migrate","status","health")] [string]$cmd="up"
)

$compose = "docker compose -f .\docker-compose.local.yml --env-file .\.env.docker"

function Health {
  try {
    $resp = Invoke-RestMethod "http://localhost:3000/health" -TimeoutSec 8
    $resp | Format-List | Out-Host
    Write-Host "✅ /health OK" -ForegroundColor Green
  } catch {
    Write-Host "❌ /health falhou. Logs:" -ForegroundColor Red
    docker logs --tail 150 saas_api_local | Out-Host
    throw
  }
}

switch ($cmd) {
  "up"      { iex "$compose up -d --remove-orphans"; iex "$compose ps"; Health }
  "down"    { iex "$compose down -v" }
  "logs"    { docker logs -f saas_api_local }
  "status"  { iex "$compose ps" }
  "health"  { Health }
  "migrate" { docker exec -it saas_api_local sh -lc "npx prisma migrate deploy" }
  default   { Write-Host "Uso: .\dev.ps1 [up|down|logs|status|health|migrate]" }
}
