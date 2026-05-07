# Pipeline Persistence Testing Guide

## What Was Fixed

1. **Removed broken mount effect**: Removed the attempt to call `handleExecutePipeline` in the mount effect (it wasn't defined yet)
2. **Simplified restoration logic**: Now only restores state without auto-executing pipelines
3. **Added comprehensive logging**: All save/restore operations now log to console with `[Pipeline]` prefix
4. **Robust error handling**: All localStorage operations wrapped in try-catch blocks
5. **Immediate persistence**: Pipelines are saved to localStorage immediately after creation

## How to Test

### Step 1: Open DevTools Console
- Press `F12` or right-click → Inspect → Console tab
- Look for logs starting with `[Pipeline]`

### Step 2: Create a Pipeline
1. Click "New Pipeline" button
2. Fill in all fields:
   - **Pipeline Name**: "Test Pipeline"
   - **Select Project**: Choose any project
   - **Add Jobs**: Select at least one job from any category
3. Click "Create Pipeline"
4. **Check console** - You should see:
   ```
   [Pipeline] Pipeline saved to localStorage: pipeline-[timestamp]
   ```

### Step 3: Navigate Away and Back
1. Click to another tab (e.g., Dashboard, Projects)
2. **Wait a moment**
3. Click back to "Pipelines" tab
4. **Check console** - You should see:
   ```
   [Pipeline] Mount: Restoring state from localStorage
   [Pipeline] Restored pipelines: 1
   ```

### Step 4: Verify Pipeline Still Exists
- Your created pipeline should still be visible in the Pipelines list
- Expanded state should be restored (if you had it expanded)
- Selected pipeline ID should be restored

### Step 5: Test Browser Refresh
1. With the Pipelines tab open, press `F5` to refresh the page
2. **Wait for page to fully load**
3. Check console for restoration logs
4. **Pipeline should still be there!**

### Step 6: Check localStorage Directly (Browser DevTools)
1. Open DevTools
2. Go to **Application** → **Local Storage** → Your domain
3. Look for keys:
   - `pipelines` - Contains all your pipelines
   - `pipeline-ui-state` - Contains expanded/selected state
   - `pipeline-logs` - Contains execution logs
   - `pending-pipeline-approvals` - Contains approval requests
   - `pipeline-builder-state` - Contains draft builder state

## Expected Behavior

✅ **Pipelines persist** after navigating away and back
✅ **Pipelines persist** after page refresh
✅ **Expanded/Selected state** restores
✅ **No console errors** related to localStorage
✅ **Console shows `[Pipeline]` logs** confirming persistence operations

## Troubleshooting

### Pipelines Still Disappearing?
1. Check console for errors (look for `[Pipeline] Failed to...` messages)
2. Check browser's storage quota - some browsers limit localStorage
3. Check if localStorage is enabled in browser settings
4. Try clearing cache and testing again

### Console Logs Not Showing?
1. Make sure you're in the **Console** tab
2. Filter for "[Pipeline]" text
3. Make sure you're not filtering out warnings/errors

### localStorage Keys Not Appearing?
1. Make sure localStorage isn't disabled in privacy settings
2. Try creating a new pipeline first
3. Check the correct domain in Application → Local Storage

## How Persistence Works Now

### On Component Mount
```
1. Try to load 'pipelines' from localStorage
2. Try to load 'pipeline-logs' from localStorage
3. Try to load 'pending-pipeline-approvals' from localStorage
4. Try to load 'pipeline-ui-state' from localStorage
5. Try to load 'pipeline-builder-state' from localStorage
```

### After Any Change
```
React's dependency array triggers useEffect
→ localStorage.setItem() is called
→ Data is persisted immediately
→ Console logs the operation
```

### On Navigation Away & Back
```
1. Component unmounts (all state lost from memory)
2. User navigates back
3. Component mounts again
4. Mount effect restores all data from localStorage
5. UI renders with restored state
```

## Console Output Examples

### Successful Creation
```
[Pipeline] Pipeline saved to localStorage: pipeline-1738300800000
```

### Successful Mount Restoration
```
[Pipeline] Mount: Restoring state from localStorage
[Pipeline] Restored pipelines: 1
```

### Error During Save
```
[Pipeline] Failed to save pipelines to localStorage: QuotaExceededError
```
