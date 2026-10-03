# Private Server Integration Guide

## Complete Setup for ARK Private Server with Auto-Join

This guide walks through setting up a complete ARK private server with the proxy helper app for cross-device joining and admin management.

## Part 1: Prerequisites

### Windows Server
- Windows Server 2016+ or Windows 10/11 Pro
- Administrator access
- 2+ CPU cores, 4GB+ RAM
- 100GB+ free disk space for ARK
- Stable internet connection

### Software
- ARK Dedicated Server (from Steam)
- Node.js 18+ (LTS recommended)
- Git

### Network
- Static IP or dynamic DNS
- Firewall rules allowing:
  - UDP 7777-7778 (ARK game server)
  - TCP 27015 (Steam query port)
  - TCP 8080 (proxy app - optional, localhost only is recommended)

## Part 2: Set up ARK Dedicated Server

### Step 1: Install ARK Server

1. Open Steam
2. Go to Tools
3. Download "ARK Dedicated Server"
4. Let it download to a local folder (e.g., `C:\ARK_Server`)
5. Once installed, verify by running `ShooterGameServer.exe`

### Step 2: Configure Server

Edit `C:\ARK_Server\ShooterGame\Saved\Config\WindowsServer\GameUserSettings.ini`:

```ini
[ServerSettings]
SessionName=My ARK Server
Port=7777
MaxPlayers=20
RCONEnabled=True
RCONPort=27020
RCONPassword=YourSecurePassword
AdminLogging=True
ServerLogIncludeTribes=True
ServerCrossSaveEnabled=False
AllowDownloadDinos=True
AllowDownloadItems=True
ClusterID=0
```

### Step 3: Start ARK Server

```bash
C:\ARK_Server\ShooterGame\Binaries\Win64\ShooterGameServer.exe
```

Or create a batch file (`start_server.bat`):

```batch
@echo off
cd C:\ARK_Server\ShooterGame\Binaries\Win64
ShooterGameServer.exe -server -log
pause
```

Verify the server is running by checking:
- Console output says "Server Ready"
- Players can connect via IP:7777 in ARK

## Part 3: Set up Proxy Helper App

### Step 1: Install Node.js and dependencies

```bash
cd C:\ArkProxyHelper
npm install
```

### Step 2: Create `.env` file

```bash
PORT=8080
APP_NAME=ArkProxyHelper
JOIN_CODE_TTL=900
ADMIN_PASSWORD=your_secure_password_here
LOG_DIR=C:/ArkProxyHelper/logs
DATABASE_DIR=C:/ArkProxyHelper/db
```

### Step 3: Test locally

```bash
node server.js
```

Expect output:
```
ArkProxyHelper v2.0 running on port 8080
  Web Join: http://localhost:8080
  Admin Panel: http://localhost:8080/admin
```

### Step 4: Test endpoints

```bash
# Health check
curl http://localhost:8080/api/health

# Generate join code
curl -X POST http://localhost:8080/api/join-code -H "Content-Type: application/json" -d '{"server":"default"}'
```

## Part 4: Set up as Windows Service (Auto-Start)

### Option A: Using NSSM (Recommended)

1. Download NSSM: https://nssm.cc/download
2. Extract to `C:\nssm`
3. Run as Administrator:

```bash
C:\nssm\nssm.exe install ArkProxyHelper "C:\Program Files\nodejs\node.exe" "C:\ArkProxyHelper\server.js"
```

4. Configure service:

```bash
C:\nssm\nssm.exe set ArkProxyHelper AppDirectory C:\ArkProxyHelper
C:\nssm\nssm.exe set ArkProxyHelper AppExit Default Restart
C:\nssm\nssm.exe set ArkProxyHelper AppRestartDelay 5000
```

5. Start service:

```bash
net start ArkProxyHelper
```

### Option B: Using Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Name: "ArkProxyHelper"
4. Trigger: "At startup"
5. Action: "Start a program"
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `C:\ArkProxyHelper\server.js`
   - Start in: `C:\ArkProxyHelper`
6. Click OK

## Part 5: Access Web Join and Admin Panel

### Local Access (same machine)

- Web Join: http://localhost:8080
- Admin Panel: http://localhost:8080/admin

### Remote Access (from another device)

If proxy is on a different machine, use its IP:

- Web Join: http://your-server-ip:8080
- Admin Panel: http://your-server-ip:8080/admin

**Note**: For production, bind proxy to localhost only and use a reverse proxy (nginx/Apache) with HTTPS.

## Part 6: Admin Panel Setup

### First Time Login

1. Go to http://localhost:8080/admin
2. Enter the `ADMIN_PASSWORD` from `.env`
3. Click Login

### Add Whitelisted Players

1. Go to **Whitelist** tab
2. Enter Player ID (can be any unique ID, or Steam ID for real servers)
3. Enter Player Name
4. Select Tier (guest/trusted/admin)
5. Click "Add to Whitelist"

### Manage Bans

1. Go to **Bans** tab
2. Enter Player ID and Name
3. Enter Reason
4. Enter Duration (0 = permanent)
5. Click "Ban Player"

## Part 7: Integration with ARK Mod

### In the ARK Mod Code

Update `ProxyInstaller.cpp` with your actual server:

```cpp
const FString DownloadURL = TEXT("https://your-domain.com/ark-proxy-installer-v2.0.exe");
const FString ExpectedSHA256 = TEXT("your_actual_sha256_hash");
const FString ProxyAppURL = TEXT("http://your-server-ip:8080");
```

## Part 8: Player Flow

1. **Player installs mod** in ARK
2. **Game launches**, mod checks for helper app
3. **Helper app auto-installs** in background (first time only)
4. **Helper app starts**, exposes join interface
5. **Player opens web browser** to http://localhost:8080 (or gets join code another way)
6. **Player enters join code**
7. **Proxy validates** against whitelist/bans
8. **Player connects** to actual ARK server
9. **Session tracked** - login/logout/heartbeat

## Part 9: Production Deployment Checklist

- [ ] Configure HTTPS for admin panel (use nginx + Let's Encrypt)
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Regular backups of `db/` folder
- [ ] Monitor `logs/activity.log` for issues
- [ ] Test firewall rules (port 8080 access)
- [ ] Test cross-device join (mobile/desktop/console)
- [ ] Monitor server resource usage (CPU, RAM, disk)
- [ ] Set up log rotation for large logs
- [ ] Test disaster recovery (restore from backup)

## Part 10: Troubleshooting

### Proxy app won't start

```bash
# Check Node.js is installed
node --version

# Check dependencies
npm install

# Run with verbose logging
node server.js
```

### Players can't join

1. Check player is whitelisted: Admin Panel > Whitelist tab
2. Check player is not banned: Admin Panel > Bans tab
3. Check join code is valid: Dashboard shows active sessions
4. Check firewall allows port 8080: `netstat -an | find ":8080"`

### ARK Server won't start

1. Check ARK files integrity in Steam
2. Check Windows Firewall allows UDP 7777
3. Check antivirus isn't blocking the process
4. Check disk space (need 100GB+)

### Players experience tether/distance issues

This is a **server-side game rule**, not something the proxy controls.

To disable tether on private server:

1. Edit `GameUserSettings.ini`
2. Add:
   ```ini
   [/Script/ShooterGame.ShooterGameCharacter]
   OverrideNomadPlayerCharacterOverride=True
   ```
3. Restart server

## Part 11: Advanced Configuration

### Custom join code length

Edit `proxy-app/modules/session-manager.js`, change:

```javascript
for (let i = 0; i < 6; i++) {  // Change 6 to desired length
```

### Custom admin endpoints

Add new routes to `proxy-app/server.js`:

```javascript
app.post('/api/admin/custom-endpoint', requireAdmin, (req, res) => {
  // Your custom logic
  res.json({ ok: true });
});
```

### Database persistence

All player data is stored in JSON files in `db/` folder:
- `players.json` — player login history
- `whitelist.json` — approved players
- `bans.json` — banned players
- `jail.json` — jailed players
- `sessions.json` — active join codes

## Support and Issues

For issues, check:
1. `logs/activity.log` for error details
2. Windows Event Viewer for system errors
3. ARK server logs in `C:\ARK_Server\ShooterGame\Saved\Logs\`
4. Node.js console output

## Next Steps

1. Deploy the mod to Steam Workshop
2. Share join codes with players
3. Monitor player activity via admin panel
4. Scale server as needed (increase MaxPlayers, server hardware)
