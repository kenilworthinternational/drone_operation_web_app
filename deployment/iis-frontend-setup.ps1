$ErrorActionPreference = "Stop"

Import-Module WebAdministration

$prodRoot = "C:\inetpub\wwwroot\dsms-prod"
$devRoot = "C:\inetpub\wwwroot\dsms-dev"

$prodSiteName = "dsms-frontend-prod"
$devSiteName = "dsms-frontend-dev"

$prodHost = "dsms.kenilworthinternational.com"
$devHost = "dev-dsms.kenilworthinternational.com"

# Replace with the certificate thumbprint already provisioned on this server.
$certThumbprint = "<SET_CERT_THUMBPRINT>"

if (!(Test-Path $prodRoot)) { New-Item -ItemType Directory -Path $prodRoot -Force | Out-Null }
if (!(Test-Path $devRoot)) { New-Item -ItemType Directory -Path $devRoot -Force | Out-Null }

if (!(Get-Website -Name $prodSiteName -ErrorAction SilentlyContinue)) {
    New-Website -Name $prodSiteName -PhysicalPath $prodRoot -Port 80 -HostHeader $prodHost | Out-Null
}

if (!(Get-Website -Name $devSiteName -ErrorAction SilentlyContinue)) {
    New-Website -Name $devSiteName -PhysicalPath $devRoot -Port 80 -HostHeader $devHost | Out-Null
}

if (!(Get-WebBinding -Name $prodSiteName -Protocol https -ErrorAction SilentlyContinue)) {
    New-WebBinding -Name $prodSiteName -Protocol https -Port 443 -HostHeader $prodHost | Out-Null
}

if (!(Get-WebBinding -Name $devSiteName -Protocol https -ErrorAction SilentlyContinue)) {
    New-WebBinding -Name $devSiteName -Protocol https -Port 443 -HostHeader $devHost | Out-Null
}

if ($certThumbprint -eq "<SET_CERT_THUMBPRINT>") {
    Write-Host "Set certificate thumbprint before SSL binding assignment."
    exit 1
}

Push-Location IIS:\SslBindings
Get-Item "0.0.0.0!443!$prodHost" -ErrorAction SilentlyContinue | Remove-Item -ErrorAction SilentlyContinue
Get-Item "0.0.0.0!443!$devHost" -ErrorAction SilentlyContinue | Remove-Item -ErrorAction SilentlyContinue

Get-Item "cert:\LocalMachine\My\$certThumbprint" | New-Item "0.0.0.0!443!$prodHost" -Force | Out-Null
Get-Item "cert:\LocalMachine\My\$certThumbprint" | New-Item "0.0.0.0!443!$devHost" -Force | Out-Null
Pop-Location

Write-Host "IIS frontend sites and SSL bindings are configured."
