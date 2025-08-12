# Build script for environment variable replacement
param(
    [string]$Environment = "development"
)

Write-Host "Building for environment: $Environment"

# Load environment variables from .env file
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]*)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Create build directory
if (!(Test-Path "build")) {
    New-Item -ItemType Directory -Path "build"
}

# Copy all files except .env and build directory
Get-ChildItem -Exclude ".env", "build", ".git*", "build.ps1" | Copy-Item -Destination "build" -Recurse -Force

# Replace placeholders in firebase-config-env.js
$configFile = "build/firebase-config-env.js"
if (Test-Path $configFile) {
    $content = Get-Content $configFile -Raw
    
    # Replace placeholders with actual environment variables
    $content = $content -replace '\{\{VITE_FIREBASE_API_KEY\}\}', $env:VITE_FIREBASE_API_KEY
    $content = $content -replace '\{\{VITE_FIREBASE_AUTH_DOMAIN\}\}', $env:VITE_FIREBASE_AUTH_DOMAIN
    $content = $content -replace '\{\{VITE_FIREBASE_PROJECT_ID\}\}', $env:VITE_FIREBASE_PROJECT_ID
    $content = $content -replace '\{\{VITE_FIREBASE_STORAGE_BUCKET\}\}', $env:VITE_FIREBASE_STORAGE_BUCKET
    $content = $content -replace '\{\{VITE_FIREBASE_MESSAGING_SENDER_ID\}\}', $env:VITE_FIREBASE_MESSAGING_SENDER_ID
    $content = $content -replace '\{\{VITE_FIREBASE_APP_ID\}\}', $env:VITE_FIREBASE_APP_ID
    $content = $content -replace '\{\{VITE_FIREBASE_MEASUREMENT_ID\}\}', $env:VITE_FIREBASE_MEASUREMENT_ID
    
    Set-Content $configFile -Value $content
}

# Update HTML to use the new config file
$htmlFile = "build/index.html"
if (Test-Path $htmlFile) {
    $htmlContent = Get-Content $htmlFile -Raw
    $htmlContent = $htmlContent -replace 'src="firebase-config\.js"', 'src="firebase-config-env.js"'
    Set-Content $htmlFile -Value $htmlContent
}

Write-Host "Build completed in 'build' directory"
