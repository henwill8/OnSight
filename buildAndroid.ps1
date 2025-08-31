# Run Expo prebuild to generate the Android native files
Write-Host "Running expo prebuild..."

try {
    # Run the expo prebuild command
    $prebuildResult = npx expo prebuild
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Expo prebuild failed, exiting..."
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error running expo prebuild: $_"
    exit 1
}

# Change directory to android folder
Write-Host "Changing directory to android..."
Set-Location -Path .\android

# Build the release APK using Gradle
Write-Host "Building release APK using Gradle..."
try {
    # Run the Gradle build command
    .\gradlew assembleRelease
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Gradle build failed, exiting..."
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error running Gradle build: $_"
    exit 1
}

# Install the APK on the connected Android device (ensure adb is in PATH)
Write-Host "Installing APK on the device..."
try {
    adb install .\app\build\outputs\apk\release\app-release.apk
    if ($LASTEXITCODE -ne 0) {
        Write-Host "APK installation failed, exiting..."
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error installing APK: $_"
    exit 1
}

# Start the app on the device using adb
Write-Host "Starting the app on the device..."
try {
    adb shell am start -n "com.henwill8.OnSight/.MainActivity"  # Replace with your app's package and main activity
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to start the app, exiting..."
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error starting app: $_"
    exit 1
}

# Start logcat to capture logs from the device related to your app's package name
Write-Host "Starting logcat to capture verbose logs from ReactNativeJS..."
Start-Process adb -ArgumentList "logcat", "*:S", "ReactNativeJS:V" -NoNewWindow -PassThru

# Go back to the original directory
Write-Host "Returning to original directory..."
Set-Location -Path ..

Write-Host "Build and installation complete. Logs will be captured in the background."
