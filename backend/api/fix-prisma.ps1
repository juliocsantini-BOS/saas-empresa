$ErrorActionPreference = "Stop"

Set-Location "C:\Users\julio\saas-ia\backend\api"

$schemaPath = ".\prisma\schema.prisma"

# Backup (só se ainda não existir)
if (-not (Test-Path ".\prisma\schema.prisma.bak")) {
  Copy-Item $schemaPath ".\prisma\schema.prisma.bak" -Force
  Write-Host "✅ Backup criado: prisma\schema.prisma.bak"
} else {
  Write-Host "✅ Backup já existe: prisma\schema.prisma.bak"
}

# Remove BOM UTF-8 (EF BB BF) se existir
$bytes = [System.IO.File]::ReadAllBytes($schemaPath)

if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
  $bytesNoBom = $bytes[3..($bytes.Length-1)]
  [System.IO.File]::WriteAllBytes($schemaPath, $bytesNoBom)
  Write-Host "✅ BOM removido do schema.prisma"
} else {
  Write-Host "✅ schema.prisma já estava sem BOM"
}

# Reescreve como UTF8 SEM BOM (garantia extra)
$content = Get-Content $schemaPath -Raw
[System.IO.File]::WriteAllText($schemaPath, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "✅ schema.prisma normalizado (UTF8 sem BOM)"

# Mostra as 3 primeiras linhas
Write-Host "`n--- Primeiras 3 linhas do schema.prisma ---"
Get-Content $schemaPath -TotalCount 3

Write-Host "`n✅ Agora rode a migration:"
Write-Host "npx prisma migrate dev -n add_refresh_tokens"
