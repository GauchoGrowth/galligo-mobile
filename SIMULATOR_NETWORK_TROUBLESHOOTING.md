# iOS Simulator Network Troubleshooting Guide

## The Problem

Your iOS Simulator cannot reach external URLs (Supabase, Unsplash, flagcdn.com) even though your Mac has full internet connectivity. This causes the app to get stuck on "Loading your travels..." because all Supabase queries fail.

## Root Cause

The simulator shares your Mac's network connection but something is blocking it from making external HTTP/HTTPS requests. This is a macOS/Simulator configuration issue, NOT a code issue.

## Confirmed Working

✅ Your Mac has internet (curl to google.com works)
✅ Dev server connection (simulator reaches 192.168.68.103:8081)
✅ App code is correct
✅ Supabase client is configured properly

❌ Simulator cannot reach external domains

## Permanent Solutions (Try in Order)

### Solution 1: Check for VPN or Proxy Software

**Most common cause of simulator network issues.**

**VPN Apps to Check:**
- ExpressVPN
- NordVPN
- ProtonVPN
- Tunnelbear
- Any other VPN

**Network Tools to Check:**
- Charles Proxy
- Proxyman
- Wireshark
- Little Snitch
- Lulu Firewall

**How to Fix:**
1. Completely quit all VPN/proxy apps (not just disconnect - quit the app)
2. Restart the simulator:
   ```bash
   killall Simulator
   open -a Simulator
   ```
3. Reopen your app

### Solution 2: Reset Simulator Network Stack

```bash
# Close simulator
killall Simulator

# Shutdown all devices
xcrun simctl shutdown all

# Delete the specific simulator's network cache
rm -rf ~/Library/Developer/CoreSimulator/Devices/C020E08A-22B7-4772-B18D-3D0B6593F25F/data/Library/Caches/com.apple.nsurlsessiond

# Reboot simulator
xcrun simctl boot "iPhone 16 Pro"
open -a Simulator
```

### Solution 3: Reset All Simulator Content & Settings

**In the Simulator:**
1. Device → Erase All Content and Settings
2. Wait for simulator to reset
3. Run your app again: `npx expo run:ios --device "iPhone 16 Pro"`

**Note:** This will delete the app and all data. You'll need to rebuild and log in again.

### Solution 4: Check macOS Firewall

```bash
# Check if firewall is enabled
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# If enabled, temporarily disable to test
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# Test simulator now

# Re-enable after testing
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

**If this fixes it:**
1. Re-enable firewall
2. Go to System Settings → Network → Firewall → Options
3. Click the "+" button
4. Add: `/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app`
5. Set to "Allow incoming connections"

### Solution 5: Check Network Preferences

Sometimes network service order matters:

```bash
# List network services
networksetup -listnetworkserviceorder

# If you have multiple networks, set WiFi as top priority
sudo networksetup -ordernetworkservices "Wi-Fi" "Thunderbolt Bridge" ...
```

### Solution 6: Reset mDNSResponder (DNS Cache)

```bash
# Flush DNS cache
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Restart simulator
killall Simulator && open -a Simulator
```

### Solution 7: Delete and Recreate Simulator

```bash
# List all simulators
xcrun simctl list devices

# Delete the problematic one
xcrun simctl delete C020E08A-22B7-4772-B18D-3D0B6593F25F

# Create a fresh iPhone 16 Pro
xcrun simctl create "iPhone 16 Pro" "iPhone 16 Pro" "iOS-18-4"

# Boot it
xcrun simctl boot "iPhone 16 Pro"
open -a Simulator
```

Then rebuild your app.

### Solution 8: Reboot Your Mac

**Often the simplest fix.** macOS's network stack can get into a weird state. A full reboot often resolves it.

```bash
sudo reboot
```

### Solution 9: Use a Physical Device

If simulator network keeps breaking, test on a real iPhone:

```bash
# Connect iPhone via USB
# Trust the computer on your iPhone

# List devices
xcrun xctrace list devices

# Build for your iPhone
npx expo run:ios --device
```

**Advantages:**
- No network issues
- More accurate testing (real performance, gestures, etc.)
- Faster iteration (no simulator overhead)

## Quick Diagnostic Commands

```bash
# Test if simulator can reach internet (run INSIDE simulator Safari)
# Open Safari in simulator and navigate to: https://www.google.com

# Test from your Mac (should work)
curl -I https://bkzwaukiujlecuyabnny.supabase.co

# Check which processes are listening on port 8081
lsof -i :8081

# Check simulator status
xcrun simctl list devices | grep "iPhone 16 Pro"
```

## What We've Already Fixed in the Code

✅ Removed network diagnostic tests (no more error popups)
✅ Added NSAppTransportSecurity (allows HTTP/HTTPS)
✅ Updated /build command (includes simulator restart)
✅ Added network error handling in queries

## Recommended Next Steps

1. **Try Solution 1** (Check for VPN/Proxy) - Most likely cause
2. **Try Solution 8** (Reboot Mac) - Quickest comprehensive fix
3. **Try Solution 9** (Use iPhone) - Most reliable long-term

## If All Else Fails

The simulator network issue may be due to:
- macOS security software you're not aware of
- Corporate network policies
- ISP-level restrictions
- Corrupted macOS network preferences

**Best long-term solution: Use a physical iPhone for development.**

---

**Updated:** 2025-11-10
**Status:** Simulator network is broken, Mac network is fine
**Impact:** App cannot load data from Supabase cloud
