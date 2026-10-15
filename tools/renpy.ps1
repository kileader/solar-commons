param(
    [ValidateSet('setup', 'run', 'lint', 'test', 'web', 'desktop')]
    [string]$Command = 'run',
    [string]$SdkPath = $env:RENPY_SDK
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$version = '8.5.3'
if (-not $SdkPath) { $SdkPath = Join-Path $projectRoot ".tools/renpy-$version-sdk" }
$sdkParent = Split-Path -Parent $SdkPath

if ($Command -eq 'setup') {
    New-Item -ItemType Directory -Force -Path $sdkParent | Out-Null
    $packages = @(
        @{ Name = "renpy-$version-sdk.zip"; Hash = 'ff57648f9c04f27e381c48af6d8e3ee3cdec296bed4d3831f47f09b0a71b505e'; Destination = $sdkParent },
        @{ Name = "renpy-$version-web.zip"; Hash = '954db897e65f51ea63cb2fb7b203d02be0447f4e22069514020bbe6c6691fdfc'; Destination = $SdkPath }
    )
    foreach ($package in $packages) {
        $archivePath = Join-Path $sdkParent $package.Name
        if (-not (Test-Path -LiteralPath $archivePath)) {
            Invoke-WebRequest -Uri "https://www.renpy.org/dl/$version/$($package.Name)" -OutFile $archivePath
        }
        if ((Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash -ne $package.Hash) {
            throw "Checksum mismatch: $($package.Name). Remove that download and run setup again."
        }
        Expand-Archive -LiteralPath $archivePath -DestinationPath $package.Destination -Force
    }
    Write-Output "Ren'Py $version is ready at $SdkPath"
    exit 0
}

$runtime = Join-Path $SdkPath 'lib/py3-windows-x86_64/python.exe'
$entry = Join-Path $SdkPath 'renpy.py'
if (-not (Test-Path -LiteralPath $runtime)) { throw 'Run tools/renpy.ps1 setup, or set RENPY_SDK to an installed Ren''Py 8.5.3 SDK.' }
$qaPath = Join-Path $projectRoot '.qa'
New-Item -ItemType Directory -Force -Path $qaPath | Out-Null
switch ($Command) {
    'lint' { & $runtime $entry --savedir "$qaPath/saves" $projectRoot lint --error-code }
    'test' { & $runtime $entry --savedir "$qaPath/saves" $projectRoot test --overwrite-screenshots --report-detailed }
    'run' { & $runtime $entry $projectRoot run }
    'web' { & $runtime $entry "$SdkPath/launcher" web_build $projectRoot --destination "$projectRoot/dist" }
    'desktop' { & $runtime $entry "$SdkPath/launcher" distribute $projectRoot --package pc --destination "$qaPath/releases" }
}
exit $LASTEXITCODE
