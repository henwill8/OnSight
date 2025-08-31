# Run Expo prebuild to generate iOS native files
Write-Host "Running expo prebuild..."
try {
    $prebuildResult = npx expo prebuild
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Expo prebuild failed, exiting..."
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error running expo prebuild: $_"
    exit 1
}

# Change directory to ios folder
Write-Host "Changing directory to ios..."
Set-Location -Path .\ios

# Build the release app using xcodebuild
Write-Host "Building iOS app using xcodebuild..."
try {
    .\xcodebuild -scheme OnSight -workspace OnSight.xcworkspace -configuration Release -sdk iphonesimulator -derivedDataPath build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "xcodebuild failed, exiting..."
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error running xcodebuild: $_"
    exit 1
}

# Install the app on the simulator (replace device name or use booted simulator)
Write-Host "Installing app on the iOS simulator..."
try {
    $appPath = ".\build\Build\Products\Release-iphonesimulator\OnSight.app"
    xcrun simctl install booted $appPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "App installation on simulator failed, exiting..."
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error installing app on simulator: $_"
    exit 1
}

# Launch the app on the simulator
Write-Host "Launching app on simulator..."
try {
    xcrun simctl launch booted com.henwill8.OnSight  # Replace with your bundle identifier
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to launch app on simulator, exiting..."
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error launching app on simulator: $_"
    exit 1
}

# Start log streaming from the simulator
Write-Host "Starting logs from simulator..."
Start-Process xcrun -ArgumentList "simctl", "spawn", "booted", "log", "stream", "--predicate", 'processImagePath CONTAINS "OnSight"' -NoNewWindow -PassThru

# Go back to the original directory
Write-Host "Returning to original directory..."
Set-Location -Path ..

Write-Host "iOS build, installation, and logging complete."
