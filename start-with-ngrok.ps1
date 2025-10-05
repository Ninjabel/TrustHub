param(
	[string]$NgrokUrl
)

$ErrorActionPreference = 'Stop'

function Get-NgrokUrlFromApi {
	try {
		$resp = Invoke-RestMethod -Uri 'http://127.0.0.1:4040/api/tunnels' -ErrorAction Stop
		if ($null -eq $resp.tunnels) { return $null }
		# Prefer an https tunnel
		$https = $resp.tunnels | Where-Object { $_.public_url -like 'https:*' } | Select-Object -First 1
		if ($https) { return $https.public_url }
		# Fallback to first tunnel
		return $resp.tunnels[0].public_url
	} catch {
		return $null
	}
}

if (-not $NgrokUrl) {
	Write-Output "Attempting to detect ngrok public URL from http://127.0.0.1:4040..."
	$NgrokUrl = Get-NgrokUrlFromApi
}

if (-not $NgrokUrl) {
	Write-Error "Could not detect ngrok URL. Start ngrok (e.g. `ngrok http 3000`) or pass the public URL as a parameter to this script.`nExample: .\start-with-ngrok.ps1 -NgrokUrl 'https://abcd-1234.ngrok.io'"
	exit 1
}

Write-Output "Using ngrok URL: $NgrokUrl"

# Load existing .env.ngrok from apps/web if present
$envFile = Join-Path -Path $PSScriptRoot -ChildPath 'apps\web\.env.ngrok'
if (Test-Path $envFile) {
	Write-Output "Loading env overrides from $envFile"
	Get-Content $envFile | ForEach-Object {
		if ($_ -match '^\s*#') { return }
		if ($_ -match '=') {
			$parts = $_ -split '=',2
			$name = $parts[0].Trim()
			$value = $parts[1].Trim().Trim('"')
			# Skip NEXTAUTH_URL if present; we'll override with detected ngrok url
			if ($name -in @('NEXTAUTH_URL','NEXTAUTH_URL_INTERNAL')) { return }
			if ($name) { Set-Item -Path env:$name -Value $value }
		}
	}
}

# Set the NEXTAUTH_URL and NEXTAUTH_URL_INTERNAL for build/start
Set-Item -Path env:NEXTAUTH_URL -Value $NgrokUrl
Set-Item -Path env:NEXTAUTH_URL_INTERNAL -Value $NgrokUrl

Write-Output "Building the app (prisma generate && next build)..."
Push-Location -Path (Join-Path $PSScriptRoot 'apps\web')
try {
	# run the build (uses package.json scripts)
	npm run build
	Write-Output "Starting the app (next start) with NEXTAUTH_URL=$NgrokUrl"
	npm run start
} finally {
	Pop-Location
}
