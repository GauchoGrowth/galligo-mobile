# Expo MCP Server Usage Guide

## What It Does

The Expo MCP server allows Claude Code to interact with your iOS simulator:
- Take screenshots of the running app
- View what's currently displayed
- Verify UI implementations automatically
- Interact with DevTools

## Prerequisites

- ✅ expo-mcp package installed as dev dependency
- ✅ Logged into Expo CLI: `npx expo whoami` (jwpepper22)
- ✅ Expo access token configured in `.claude/.mcp.json`
- ✅ Development server running: `npx expo start --dev-client`

## How to Use

### Starting the Dev Server

**Always start your dev server with MCP capabilities enabled:**
```bash
npx expo start --dev-client
```

**Important:** The Expo MCP can only connect when the dev server is running.

### Workflow

1. **Start dev server:**
   ```bash
   npx expo start --dev-client
   ```

2. **Open app on simulator:**
   - Press `i` in the terminal to open on iOS simulator
   - Or open the app from your iPhone 16 Pro simulator home screen

3. **Make code changes:**
   - Claude Code modifies component files
   - Changes appear in simulator via Hot Module Replacement (HMR)

4. **Verify with MCP:**
   - Claude Code uses Expo MCP to take screenshots
   - Validates the UI matches expectations
   - Reports back with visual confirmation

### Example Prompts

**After implementing a feature:**
- "Take a screenshot of the simulator to verify the new button rendered correctly"
- "Check if the PlaceCard component displays the marker stats"
- "Verify the bottom tab bar shows all 4 tabs"

**For iterative development:**
- "Add a blue circle to the top-left corner and verify it appears in the simulator"
- "Change the button color to red and confirm the change is visible"
- "Implement a modal and take a screenshot showing it overlays correctly"

**Testing workflows:**
- "Navigate to the Profile tab and take a screenshot"
- "Open the CreatePlace modal and verify it slides up from the bottom"
- "Scroll the places list and check if the scroll animation is smooth"

## Limitations

- **Single connection:** Only supports one dev server at a time
- **Simulators only:** Physical iOS devices are not supported via MCP
- **macOS only:** Requires macOS to run iOS simulators
- **SDK 54+:** You're on Expo SDK ~54.0.23 ✓
- **Dev server must be running:** MCP cannot control the simulator without active dev server

## Troubleshooting

### MCP Not Connecting

**Symptom:** "Cannot connect to Expo dev server" or similar errors.

**Solutions:**
1. Verify dev server is running: `npx expo start --dev-client`
2. Check the terminal shows "Metro waiting on..." message
3. Restart the MCP connection:
   - Stop the dev server: `Ctrl+C`
   - Restart: `npx expo start --dev-client`
   - Reload Claude Code (may require session restart)

### Screenshots Not Working

**Symptom:** "Cannot capture screenshot" or blank screenshots.

**Check simulator is booted:**
```bash
# List booted simulators
xcrun simctl list devices | grep Booted
```

**If no simulator is booted:**
- Open the simulator manually: `open -a Simulator`
- Or press `i` in the Expo dev server terminal
- Select "iPhone 16 Pro" from the simulator menu

**If simulator is booted but screenshots fail:**
- Ensure the app is actively running in the foreground
- Try closing and reopening the app
- Check that HMR is working (make a small code change)

### Token Errors

**Symptom:** "Authentication failed" or "Invalid token" errors.

**Solutions:**
1. Verify token is correct in `.claude/.mcp.json`
2. Check you're logged in: `npx expo whoami`
3. Generate a new token:
   - Visit: https://expo.dev/accounts/jwpepper22/settings/access-tokens
   - Create new token named "Claude Code MCP"
   - Update the token in `.claude/.mcp.json`
4. Restart Claude Code session

### App Not Updating After Code Changes

**Symptom:** Changes to code don't appear in simulator.

**Solutions:**
1. Check Fast Refresh is enabled (usually enabled by default)
2. Try shaking the device (Cmd+Ctrl+Z in simulator) → "Reload"
3. Restart dev server: `Ctrl+C` then `npx expo start --dev-client`
4. Clear Metro cache: `npx expo start --dev-client -c`

### "No Compatible Apps" Message

**Symptom:** Simulator shows "No compatible apps" or similar.

**This means you need to rebuild the development build:**
```bash
npx expo run:ios --device "iPhone 16 Pro"
```

This happens when:
- First time setup
- Added native dependencies
- Changed config plugins in app.json

## Advanced Usage

### Multiple Screens Testing
Claude Code can navigate through your app and capture multiple screenshots in sequence:

```
Prompt: "Navigate to the Explore tab, then open a place details screen,
         and take screenshots of each step"
```

### Visual Regression Testing
Use the MCP for visual verification after refactoring:

```
Prompt: "Take a screenshot of the HomeScreen before and after my styling changes
         to compare them"
```

### DevTools Integration
(Coming soon - direct DevTools manipulation via MCP)

### Video Recording
(Coming soon - the MCP may support video recording of interactions)

## Best Practices

### 1. Keep Dev Server Running
Don't stop/start the dev server frequently. Keep it running and let HMR handle updates.

### 2. Use Descriptive Prompts
Instead of: "Check the screen"
Use: "Take a screenshot of the Home tab showing the places list and verify the PlaceCard components are rendering"

### 3. Test After Major Changes
After implementing complex UI:
- Take screenshots
- Navigate through flows
- Verify animations and transitions

### 4. Clear Cache When Needed
If HMR seems stuck:
```bash
npx expo start --dev-client -c
```

## MCP Commands Available

The Expo MCP exposes these capabilities to Claude Code:
- `expo_screenshot` - Capture current simulator screen
- `expo_reload` - Reload the app
- `expo_inspect` - Get current screen hierarchy
- `expo_navigate` - Navigate to specific screens (if deep linking is configured)

**Note:** Claude Code uses these automatically based on your prompts.

## Configuration Reference

### .claude/.mcp.json Structure
```json
{
  "mcpServers": {
    "expo": {
      "command": "npx",
      "args": ["-y", "@expo/mcp-server"],
      "env": {
        "EXPO_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Environment Variables
- `EXPO_TOKEN`: Your Expo access token (required)
- Set in `.claude/.mcp.json` (already configured for you)

## Reference Links

- **Expo MCP Docs:** https://docs.expo.dev/eas/ai/mcp/
- **MCP Protocol:** https://modelcontextprotocol.io/
- **Expo Dev Client:** https://docs.expo.dev/develop/development-builds/introduction/
- **React Native Debugging:** https://reactnative.dev/docs/debugging

## Quick Start Checklist

Before asking Claude Code to interact with your simulator:

- [ ] Dev server is running: `npx expo start --dev-client`
- [ ] App is open in iOS simulator (iPhone 16 Pro)
- [ ] You can see the Metro bundler output in terminal
- [ ] HMR is working (test with a small code change)
- [ ] Claude Code session is active and connected to MCP

Once all checked, you're ready to use prompts like:
- "Take a screenshot to verify the UI"
- "Navigate to the Profile tab and show me what's there"
- "Check if the new button appears on the HomeScreen"

---

**Last Updated:** 2025-11-10
