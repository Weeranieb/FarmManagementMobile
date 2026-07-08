.DEFAULT_GOAL := help

VERSION := $(shell node -p "require('./app.json').expo.version")

# Prefer Android Studio JBR when JAVA_HOME unset (macOS; path has spaces).
ifeq ($(origin JAVA_HOME),undefined)
  export JAVA_HOME := /Applications/Android Studio.app/Contents/jbr/Contents/Home
endif
export ANDROID_HOME ?= $(HOME)/Library/Android/sdk

.PHONY: help android-light android-dev android-uat android-prod

help:
	@echo "FarmOS mobile"
	@echo ""
	@echo "  make android-light   # arm64 + minify APK (dev) → dist/ + ~/Downloads"
	@echo "  make android-dev     # universal release APK (dev) → dist/"
	@echo "  make android-uat     # universal release APK (uat) → dist/"
	@echo "  make android-prod    # universal release APK (prod) → dist/"

# Lightweight phone APK (arm64-v8a only). Copies to ~/Downloads.
android-light:
	bash scripts/build-android.sh dev light
	cp "dist/farm_os_$(VERSION)_dev_light.apk" "$(HOME)/Downloads/"
	@ls -lh "$(HOME)/Downloads/farm_os_$(VERSION)_dev_light.apk"

android-dev:
	bash scripts/build-android.sh dev

android-uat:
	bash scripts/build-android.sh uat

android-prod:
	bash scripts/build-android.sh prod
