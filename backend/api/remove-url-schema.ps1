$ErrorActionPreference = "Stop"
Set-Location "C:\Users\julio\saas-ia\backend\api"

$schemaPath = ".\prisma\schema.prisma"

Copy-Item $schemaPath ".\prisma\schema.prisma.bak_remove_url" -Force

# Lê como texto
$content = [System.IO.File]::ReadAllText($schemaPath)

# Remove BOM se existir
if ($content.Length -gt 0 -and $content[0] -eq [char]0xFEFF) {
  $content = $content.Substring(1)
}

# Remove QUALQUER linha que comece com "url" dentro do schema (Prisma 7 não permite)
# (modo multiline)
$content = $content -replace '(?m)^\s*url\s+.*\r?\n', ''

# Grava como UTF8 sem BOM
[System.IO.File]::WriteAllText($schemaPath, $content, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "OK: removi linhas url do schema.prisma e normalizei UTF8 sem BOM."
Write-Host ""
Write-Host "Bloco datasource db atual:"
(Get-Content $schemaPath -Raw | Select-String -Pattern '(?s)datasource db \{[\s\S]*?\}' -AllMatches).Matches.Value
