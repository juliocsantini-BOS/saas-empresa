$ErrorActionPreference="Stop"
$baseUrl="http://127.0.0.1:3000"

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginBody = @{ email="admin@suaplataforma.com"; password="NovaSenhaForte#2026" } | ConvertTo-Json
$login = Invoke-RestMethod "$baseUrl/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -WebSession $session
$headers = @{ Authorization = "Bearer $($login.access_token)" }

Write-Host "1) /health" -ForegroundColor Cyan
Invoke-RestMethod "$baseUrl/health" -Headers $headers -Method GET | Out-Host

Write-Host "2) /v1/auth/me" -ForegroundColor Cyan
Invoke-RestMethod "$baseUrl/v1/auth/me" -Headers $headers -Method GET | Out-Host

Write-Host "3) Contando AuditLog no banco" -ForegroundColor Cyan
node .\audit-count.js