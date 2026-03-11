$ErrorActionPreference = "Stop"
Set-Location "C:\Users\julio\saas-ia\backend\api"

$schemaPath = ".\prisma\schema.prisma"

# Backup
Copy-Item $schemaPath ".\prisma\schema.prisma.bak_fix" -Force

# 1) Remover BOM UTF-8 (EF BB BF) se existir
$bytes = [System.IO.File]::ReadAllBytes($schemaPath)
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
  $bytes = $bytes[3..($bytes.Length-1)]
  [System.IO.File]::WriteAllBytes($schemaPath, $bytes)
}

# 2) Ler texto já sem BOM
$content = [System.IO.File]::ReadAllText($schemaPath)

# 3) REMOVER linha url do datasource (Prisma 7 não permite url no schema)
# remove qualquer linha: url = env("DATABASE_URL")
$content = $content -replace '^\s*url\s*=\s*env\("DATABASE_URL"\)\s*\r?\n', ''

# 4) Gravar como UTF8 sem BOM
[System.IO.File]::WriteAllText($schemaPath, $content, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "OK: schema.prisma sem BOM e sem url no datasource."
Write-Host ""
Write-Host "Primeiras 2 linhas:"
Get-Content $schemaPath -TotalCount 2
Write-Host ""
Write-Host "Bloco datasource db:"
(Get-Content $schemaPath -Raw | Select-String -Pattern '(?s)datasource db \{[\s\S]*?\}' -AllMatches).Matches.Value
