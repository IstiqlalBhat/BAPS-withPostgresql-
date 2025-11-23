# BAPS pyRevit Extension - Installation Guide

## Quick Installation

### Step 1: Copy Extension to pyRevit Extensions Folder

```powershell
# Windows PowerShell
$extensionsPath = "$env:APPDATA\pyRevit\Extensions"
Copy-Item -Recurse "C:\CodeJaai\BBAPS\BBAPS\pyrevit-extension" "$extensionsPath\BAPS.extension"
```

Or manually:
1. Navigate to `%APPDATA%\pyRevit\Extensions` in Windows Explorer
2. Copy the `pyrevit-extension` folder
3. Rename it to `BAPS.extension`

### Step 2: Add Extension Path (Alternative Method)

If you prefer to keep the extension in its current location:

1. Open Revit
2. Go to **pyRevit** tab → **Settings**
3. Add your extension path to **Custom Extension Directories**:
   ```
   C:\CodeJaai\BBAPS\BBAPS
   ```
4. Click **Save Settings and Reload**

### Step 3: Reload pyRevit

In Revit, click **pyRevit** → **Reload**

You should now see the **BAPS** tab with three buttons:
- **Login** (Auth panel)
- **Sync Elements** (Sync panel)  
- **Get Pricing** (Pricing panel)

## Usage

1. **Login**: Click to authenticate with BAPS backend
2. **Sync Elements**: Extract building elements from your Revit model
3. **Get Pricing**: Request AI-powered pricing suggestions

## Requirements

- Revit 2020 or later
- pyRevit 4.8+
- BAPS backend running on `http://localhost:3000`

## Configuration

To change the backend API URL, edit `lib/api_client.py`:

```python
def __init__(self, base_url='http://your-url.com/api', token=None):
```

## Troubleshooting

**Button doesn't appear?**
- Check that the folder is named `BAPS.extension`
- Reload pyRevit

**Login fails?**
- Make sure backend server is running on http://localhost:3000
- Check your email/password

**No elements found?**
- Ensure your Revit model has walls, doors, windows, or structural framing
- Check that elements are visible in the current view
