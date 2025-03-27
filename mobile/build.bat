npx expo prebuild
cd .\android
.\gradlew assembleRelease
adb install .\app\build\outputs\apk\release\app-release.apk
cd ..\