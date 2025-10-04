$ErrorActionPreference = 'Stop'
$ws = New-Object Microsoft.PowerShell.Commands.WebRequestSession
# Fetch CSRF token
$csrf = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/csrf' -WebSession $ws
Write-Output "CSRF: $($csrf.csrfToken)"

# Post credentials
$body = @{
    csrfToken = $csrf.csrfToken
    email = 'admin@trusthub.demo'
    password = 'password123'
    callbackUrl = '/dashboard'
}
Write-Output "Posting credentials..."
$resp = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/callback/credentials' -Method Post -Body $body -WebSession $ws -ErrorAction SilentlyContinue
Write-Output 'SignInResponse (raw):'
if ($null -ne $resp) { $resp | ConvertTo-Json -Depth 5 } else { Write-Output '<no body>' }

# Fetch session
$session = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/session' -WebSession $ws -ErrorAction SilentlyContinue
Write-Output 'Session:'
if ($null -ne $session) { $session | ConvertTo-Json -Depth 5 } else { Write-Output '<no session>' }
