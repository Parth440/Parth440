# 🤖 Highrise Bot - Complete Implementation

A comprehensive Highrise bot with **279 emotes**, outfit copying, click teleport, AI chat, economy system, moderation tools, and 100+ features!

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Commands](#commands)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Contributing](#contributing)

## ✨ Features

### 🎭 Emote System (279 Emotes)
- **279 unique emotes** available
- Type emote number (1-279) or name to start
- **Looping emotes** - automatically repeat
- **Auto pause on walk** - emotes pause when walking, resume when stopped
- Stop with `0`, `stop`, `off`, or `break`
- `!emotelist` - View all available emotes
- `!send @user <emote>` - Send emote to another user
- `!emoteall <emote>` - Perform emote on all users (Mod/Owner)

### 👔 Advanced Outfit System
- **!copy** - Copy user's outfit to bot (Mod/Owner)
  - Automatically tries to buy missing items
  - Skips unavailable items
  - Caches outfits for speed
- **!wear <itemId>** - Wear specific item (Owner)
- **!remove <itemId>** - Remove item (Owner)
- **!buy <itemId>** - Buy item from shop (Owner)
- **!save <name>** - Save current outfit (Owner)
- **!load <name>** - Load saved outfit (Owner)
- **!random** - Apply random saved outfit (Owner)
- **!inventory** - View bot's inventory (Owner)
- **!clear** - Reset to default outfit (Owner)

### 🚀 Click Teleport System
- Automatically detects clicks 4+ tiles away
- Instant teleportation to clicked location
- Distance calculation and validation
- Teleport history tracking

### 💬 AI Chat System (DM)
- Intelligent responses in direct messages
- First-time greeting with full command list
- Context-aware conversations
- Remembers last 10 messages per user
- Friendly personality with emojis

### 💰 Economy System
- **!mycoins** / **!balance** - Check your coin balance
- **!daily** - Claim daily reward (100 coins, 24h cooldown)
- **!transfer @user <amount>** - Send coins to others
- **!coinleaderboard** - View top coin holders
- Earn coins automatically by being active
- Transaction history tracking

### 📊 Tracking & Leveling System
- **!mytime** - View your stats (time, level, XP, messages)
- **!leaderboard** - Top XP users
- **!topusers** - Most active users today
- Automatic XP gain:
  - 5 XP per message
  - 2 XP per minute in room
- Level up notifications
- 100 XP per level

### 🛡️ Moderation System
- **!kick @user [reason]** - Kick user from room
- **!ban @user [duration] [reason]** - Ban user
- **!mute @user [duration]** - Mute user
- **!unmute @user** - Unmute user
- **!lockdown** - Toggle room lockdown
- Spam detection and auto-kick
- Bad word filter
- Warning system
- Moderation logs

### 👑 Permission System
- **Owner** - Full access to all commands
- **Moderator** - Moderation and management commands
- **VIP** - Special access and features
- **User** - Basic commands
- **!mod @user** - Make user moderator (Owner)
- **!own @user** - Make user owner (Owner)
- **!vip @user** - Make user VIP (Mod/Owner)
- **!removevip @user** - Remove VIP status

### 🏠 Bot Position Management
- **!fixhome** / **!sethome** - Save bot's current position
- **!home** / **!gohome** - Return bot to saved position
- Persistent position storage

### 📨 Auto Invite System
- Saves all users who visit the room
- Automatically invites users every 2 hours
- Only invites users not currently in room
- Prevents spam with cooldowns

### 🎯 Teleport & Summon
- **!summon @user** - Teleport user to your location (Mod/Owner)
- **!teleport @user <x> <y> <z>** - Teleport to coordinates (Mod/Owner)
- **!whereami** - Show your current position

### 🎉 Auto Features
- **Auto Welcome** - Greets new users with colorful message
- **Auto Reaction** - Sends ❤️ reaction on user join
- **Auto Goodbye** - Thanks users when they leave
- **Auto Emote** - Bot cycles through all 279 emotes every 15 seconds
- **Auto Promotion** - Room promotion messages every 30 minutes
- **Auto Invite** - Invites saved users every 2 hours

### 🔧 Utility Commands
- **!help** - Show available commands
- **!ping** - Check if bot is online
- **!whereami** - Show your position
- **!pos** - Show bot position

## 🚀 Installation

### Prerequisites
- Node.js 16.0 or higher
- npm or yarn
- Highrise account with bot token

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd highrise-bot-complete
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
BOT_TOKEN=your_bot_token_here
ROOM_ID=your_room_id_here
```

4. **Start the bot**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## ⚙️ Configuration

Edit `config/config.js` to customize:

```javascript
{
  BOT_TOKEN: 'your_token',
  ROOM_ID: 'your_room_id',
  
  // Feature toggles
  ENABLE_AUTO_EMOTE: true,
  ENABLE_AUTO_WELCOME: true,
  ENABLE_AUTO_PROMOTION: true,
  ENABLE_AI_CHAT: true,
  ENABLE_CLICK_TELEPORT: true,
  
  // Timing
  AUTO_EMOTE_INTERVAL: 15000, // 15 seconds
  AUTO_INVITE_INTERVAL: 7200000, // 2 hours
  AUTO_PROMOTION_INTERVAL: 1800000, // 30 minutes
  
  // Economy
  DAILY_REWARD_AMOUNT: 100,
  XP_PER_MESSAGE: 5,
  XP_PER_MINUTE: 2
}
```

## 📝 Commands

### For Everyone

| Command | Description |
|---------|-------------|
| `1-279` or `<emote name>` | Start emote (loops automatically) |
| `0`, `stop`, `off`, `break` | Stop current emote |
| `!emotelist [page]` | View all 279 emotes |
| `!mycoins`, `!balance` | Check your coin balance |
| `!daily` | Claim daily reward (100 coins) |
| `!transfer @user <amount>` | Send coins to another user |
| `!coinleaderboard` | View top coin holders |
| `!mytime`, `!stats` | View your stats and level |
| `!leaderboard` | View XP leaderboard |
| `!topusers` | Most active users today |
| `!help` | Show all commands |
| `!ping` | Check if bot is online |
| `!whereami` | Show your position |

### For VIPs

| Command | Description |
|---------|-------------|
| All user commands | + VIP zone access |

### For Moderators

| Command | Description |
|---------|-------------|
| `!copy` | Copy user's outfit to bot |
| `!kick @user [reason]` | Kick user from room |
| `!ban @user [duration] [reason]` | Ban user |
| `!mute @user [duration]` | Mute user |
| `!unmute @user` | Unmute user |
| `!summon @user` | Teleport user to you |
| `!teleport @user <x> <y> <z>` | Teleport user to coordinates |
| `!vip @user` | Make user VIP |
| `!removevip @user` | Remove VIP status |
| `!fixhome` | Save bot position |
| `!home` | Return to saved position |
| `!emoteall <emote>` | Perform emote on all users |

### For Owners

| Command | Description |
|---------|-------------|
| `!mod @user` | Make user moderator |
| `!own @user` | Make user owner |
| `!wear <itemId>` | Wear specific item |
| `!remove <itemId>` | Remove item |
| `!buy <itemId>` | Buy item from shop |
| `!save <name>` | Save current outfit |
| `!load <name>` | Load saved outfit |
| `!random` | Apply random outfit |
| `!inventory` | View bot inventory |
| `!clear` | Reset to default outfit |
| `!lockdown` | Toggle room lockdown |

## 📁 Project Structure

```
highrise-bot-complete/
├── config/
│   └── config.js              # Bot configuration
├── data/
│   └── emotes.json            # All 279 emotes data
├── database/                  # JSON database files (auto-generated)
│   ├── players.json
│   ├── roles.json
│   ├── economy.json
│   ├── tracking.json
│   ├── outfits.json
│   └── ...
├── features/
│   ├── emoteSystem.js         # 279 emotes with looping
│   ├── outfitSystem.js        # Outfit copy & management
│   ├── clickTeleport.js       # Click teleport system
│   ├── autoInvite.js          # Auto invite system
│   ├── permissionSystem.js    # Roles & permissions
│   ├── economySystem.js       # Coins & daily rewards
│   ├── moderationSystem.js    # Kick, ban, mute
│   └── trackingSystem.js      # XP, levels, stats
├── handlers/
│   ├── messageHandler.js      # Chat message handling
│   ├── dmHandler.js           # DM & AI chat
│   ├── joinHandler.js         # Player join events
│   ├── leaveHandler.js        # Player leave events
│   └── movementHandler.js     # Movement tracking
├── utils/
│   ├── database.js            # JSON database manager
│   └── logger.js              # Logging system
├── logs/                      # Log files (auto-generated)
├── .env.example               # Environment template
├── .gitignore
├── index.js                   # Main entry point
├── package.json
└── README.md
```

## 🎮 Usage

### Starting the Bot

```bash
npm start
```

### First Time Setup

1. Bot will automatically create database files
2. Owner is automatically set to room owner
3. Use `!fixhome` to set bot's home position
4. Use `!help` to see all commands

### Adding Moderators

```bash
!mod @username
```

### Managing Outfits

```bash
# Copy a user's outfit
!copy

# Save current outfit
!save MyOutfit

# Load saved outfit
!load MyOutfit

# Apply random outfit
!random
```

### Using Emotes

```bash
# Start emote by number
1

# Start emote by name
ghostfloat

# Stop emote
stop

# View all emotes
!emotelist
```

## 🔒 Permissions

The bot uses a 4-level permission system:

- **Level 0 (User)**: Basic commands
- **Level 1 (VIP)**: User commands + VIP features
- **Level 2 (Moderator)**: VIP + moderation commands
- **Level 3 (Owner)**: Full access to all commands

## 📊 Database

All data is stored in JSON files in the `database/` directory:

- `players.json` - User visit history
- `roles.json` - Owners, mods, VIPs
- `economy.json` - Coin balances
- `tracking.json` - XP, levels, time
- `outfits.json` - Saved outfits
- `dm_memory.json` - DM conversation history
- `moderation.json` - Kicks, bans, mutes
- And more...

## 🐛 Troubleshooting

### Bot won't start
- Check your `BOT_TOKEN` and `ROOM_ID` in `.env`
- Ensure Node.js 16+ is installed
- Run `npm install` to install dependencies

### Commands not working
- Check bot permissions in room
- Ensure you have the required permission level
- Check logs in `logs/` directory

### Emotes not working
- User must own the emote or it must be free
- Check if emote ID is correct in `data/emotes.json`

## 📝 License

MIT License - feel free to use and modify!

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Check the logs in `logs/` directory
- Review the Highrise SDK documentation
- Open an issue on GitHub

## 🎉 Credits

Built with:
- [Highrise SDK](https://highrise.sdk.addpotion.com/)
- Node.js
- Love and dedication ❤️

---

**Enjoy your fully-featured Highrise bot!** 🚀
