# 📋 Complete Commands List

## 🎭 Emote Commands (279 Emotes Available)

### Basic Usage
- Type any number from **1-279** to start that emote
- Type emote **name** directly (e.g., `ghostfloat`, `wave`, `dance`)
- Emotes **loop automatically** until stopped
- Emotes **pause when walking**, resume when stopped

### Stop Emote
- `0` - Stop emote
- `stop` - Stop emote
- `off` - Stop emote
- `break` - Stop emote

### Emote Commands
- `!emotelist [page]` - View all 279 emotes (paginated)
- `!send @user <emote>` - Send emote to another user
- `!emoteall <emote>` - Perform emote on all users (Mod/Owner only)

### Examples
```
1                    # Start emote #1 (ghostfloat)
ghostfloat          # Start ghostfloat emote
wave                # Start wave emote
!emotelist          # View emotes page 1
!emotelist 2        # View emotes page 2
!send @john wave    # Send wave emote to john
stop                # Stop current emote
```

---

## 👔 Outfit Commands

### User Commands
- `!copy` - Copy your outfit to bot (Mod/Owner only)

### Owner Commands
- `!wear <itemId>` - Wear specific item
- `!remove <itemId>` - Remove specific item
- `!buy <itemId>` - Buy item from shop
- `!save <name>` - Save current outfit with name
- `!load <name>` - Load saved outfit by name
- `!random` - Apply random saved outfit
- `!inventory` - View bot's inventory
- `!clear` - Reset to default outfit
- `!search <query>` - Search items in inventory

### Examples
```
!copy                           # Copy user's outfit
!wear body-flesh               # Wear body item
!save CoolOutfit               # Save current outfit
!load CoolOutfit               # Load saved outfit
!random                        # Random outfit
!buy eye-n_basic2018malesquare # Buy item
```

---

## 💰 Economy Commands

### Balance & Coins
- `!mycoins` - Check your coin balance
- `!balance` - Check your coin balance
- `!coins` - Check your coin balance

### Daily Reward
- `!daily` - Claim daily reward (100 coins, 24h cooldown)

### Transfers
- `!transfer @user <amount>` - Send coins to another user
- `!pay @user <amount>` - Send coins to another user

### Leaderboard
- `!coinleaderboard` - View top coin holders
- `!richest` - View top coin holders

### Examples
```
!mycoins              # Check balance
!daily                # Claim daily reward
!transfer @john 50    # Send 50 coins to john
!coinleaderboard      # View top 5 richest
```

---

## 📊 Tracking & Stats Commands

### Personal Stats
- `!mytime` - View your time, level, XP, and messages
- `!stats` - View your stats

### Leaderboards
- `!leaderboard` - View XP leaderboard (top 5)
- `!top` - View XP leaderboard
- `!topusers` - Most active users today

### XP System
- Earn **5 XP per message**
- Earn **2 XP per minute** in room
- **100 XP per level**
- Automatic level up notifications

### Examples
```
!mytime         # Your stats
!leaderboard    # Top XP users
!topusers       # Most active today
```

---

## 🛡️ Moderation Commands (Mod/Owner)

### Kick & Ban
- `!kick @user [reason]` - Kick user from room
- `!ban @user [duration] [reason]` - Ban user (duration in seconds)
- `!unban @user` - Unban user

### Mute
- `!mute @user [duration]` - Mute user (duration in seconds)
- `!unmute @user` - Unmute user

### Room Control
- `!lockdown` - Toggle room lockdown mode

### Examples
```
!kick @spammer Spamming          # Kick with reason
!ban @troll 3600 Trolling        # Ban for 1 hour
!mute @loud 60                   # Mute for 60 seconds
!unmute @loud                    # Unmute user
!lockdown                        # Toggle lockdown
```

---

## 👑 Permission Commands (Owner)

### Add Roles
- `!mod @user` - Make user moderator
- `!setmod @user` - Make user moderator
- `!own @user` - Make user owner
- `!setowner @user` - Make user owner
- `!vip @user` - Make user VIP
- `!addvip @user` - Make user VIP

### Remove Roles
- `!removevip @user` - Remove VIP status

### Examples
```
!mod @john      # Make john a moderator
!own @sarah     # Make sarah an owner
!vip @mike      # Make mike a VIP
!removevip @mike # Remove mike's VIP
```

---

## 🏠 Bot Position Commands (Mod/Owner)

### Home Position
- `!fixhome` - Save bot's current position as home
- `!sethome` - Save bot's current position as home
- `!home` - Return bot to saved home position
- `!gohome` - Return bot to saved home position

### Examples
```
!fixhome    # Save current position
!home       # Go to saved position
```

---

## 🚀 Teleport Commands (Mod/Owner)

### Summon
- `!summon @user` - Teleport user to your location
- `!bringsummon @user` - Teleport user to your location

### Teleport
- `!teleport @user <x> <y> <z>` - Teleport user to coordinates
- `!tp @user <x> <y> <z>` - Teleport user to coordinates

### Position
- `!whereami` - Show your current position
- `!pos` - Show bot's current position

### Examples
```
!summon @john           # Bring john to you
!teleport @sarah 1 0 1  # Teleport sarah to (1,0,1)
!whereami               # Your position
```

---

## 🔧 Utility Commands

### Help & Info
- `!help` - Show available commands
- `!commands` - Show available commands
- `!ping` - Check if bot is online

### Position
- `!whereami` - Show your position
- `!pos` - Show bot position

### Examples
```
!help       # Show commands
!ping       # Check bot status
!whereami   # Your position
```

---

## 📨 Direct Message Commands

### AI Chat
- Send any message to bot in DM
- Bot responds with AI-like replies
- First time: Send `hi` or `hello` for welcome message with all commands

### Examples
```
hi              # Get welcome message
help            # Ask about commands
emotes          # Ask about emotes
coins           # Ask about economy
```

---

## 🎯 Special Features

### Auto Features (No Commands Needed)
- **Auto Welcome** - Bot welcomes new users
- **Auto Reaction** - Bot sends ❤️ on user join
- **Auto Goodbye** - Bot thanks users on leave
- **Auto Emote** - Bot cycles through emotes every 15 seconds
- **Auto Promotion** - Room promotion every 30 minutes
- **Auto Invite** - Invites saved users every 2 hours

### Click Teleport (No Commands Needed)
- Click anywhere 4+ tiles away
- Bot automatically teleports you there
- Works seamlessly in background

### Emote Pause/Resume (Automatic)
- Emotes pause when you walk
- Emotes resume when you stop
- No commands needed

---

## 📊 Permission Levels

### Level 0 - User (Everyone)
- Emote commands
- Economy commands
- Stats commands
- Utility commands

### Level 1 - VIP
- All user commands
- VIP zone access
- Special features

### Level 2 - Moderator
- All VIP commands
- Moderation commands
- Teleport commands
- Outfit copy command
- Bot position commands

### Level 3 - Owner
- All moderator commands
- Permission management
- Outfit management
- Full bot control

---

## 💡 Tips & Tricks

### Emotes
- Emotes loop automatically - no need to repeat
- Type just the number or name - no prefix needed
- Use `!emotelist` to discover new emotes
- Emotes pause when walking - very natural!

### Economy
- Claim daily reward every 24 hours
- Earn coins by being active
- Transfer coins to friends
- Check leaderboard to see richest users

### Stats
- Earn XP by chatting (5 XP per message)
- Earn XP by being in room (2 XP per minute)
- Level up every 100 XP
- Check your rank with `!mytime`

### Outfit
- Mods can copy any user's outfit with `!copy`
- Bot tries to buy missing items automatically
- Owners can save multiple outfits
- Use `!random` for quick outfit changes

---

## 🎮 Quick Reference

### Most Used Commands
```
# Emotes
1, wave, dance, !emotelist, stop

# Economy
!mycoins, !daily, !transfer @user 50

# Stats
!mytime, !leaderboard

# Moderation (Mod/Owner)
!kick @user, !ban @user, !mute @user

# Outfit (Mod/Owner)
!copy, !save, !load

# Utility
!help, !ping, !whereami
```

---

## 📞 Need Help?

- Type `!help` in room for command list
- DM the bot with `help` for detailed info
- Check README.md for full documentation
- All commands are case-insensitive

**Enjoy the bot!** 🎉
