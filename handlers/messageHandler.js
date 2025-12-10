/**
 * Message Handler
 * Handles all public chat messages and commands
 */

const config = require('../config/config');

class MessageHandler {
  constructor(bot, db, logger, systems) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    this.systems = systems;
  }

  /**
   * Handle incoming message
   */
  async handle(user, message) {
    // Check if message is a command
    const isCommand = config.COMMAND_PREFIXES.some(prefix => 
      message.startsWith(prefix)
    );

    if (isCommand) {
      await this.handleCommand(user, message);
    } else {
      // Check for emote by number or name (without prefix)
      await this.handleEmoteShortcut(user, message);
    }
  }

  /**
   * Handle emote shortcuts (just typing number or name)
   */
  async handleEmoteShortcut(user, message) {
    const trimmed = message.trim();
    
    // Check if it's a stop command
    if (['0', 'stop', 'off', 'break'].includes(trimmed.toLowerCase())) {
      const result = this.systems.emoteSystem.stopEmote(user.id);
      if (result.success) {
        await this.bot.whisper.send(user.id, result.message);
      }
      return;
    }

    // Check if it's an emote number or name
    const emote = this.systems.emoteSystem.getEmote(trimmed);
    if (emote) {
      const result = await this.systems.emoteSystem.startEmote(user.id, trimmed);
      if (result.success) {
        await this.bot.whisper.send(user.id, result.message);
      }
    }
  }

  /**
   * Handle command
   */
  async handleCommand(user, message) {
    // Remove prefix
    let command = message.slice(1).trim();
    const args = command.split(' ');
    const cmd = args[0].toLowerCase();
    const params = args.slice(1);

    this.logger.command(user.username, cmd);

    // Get user permission level
    const permLevel = this.systems.permissionSystem.getPermissionLevel(user.id);

    // Route to appropriate handler
    switch (cmd) {
      // Emote commands
      case 'emote':
      case 'dance':
      case 'wave':
        await this.handleEmoteCommand(user, params);
        break;
      
      case 'stopemote':
      case 'stop':
        await this.handleStopEmote(user);
        break;
      
      case 'emotelist':
      case 'emotes':
        await this.handleEmoteList(user, params);
        break;
      
      case 'emotewith':
      case 'emowith':
        await this.handleEmoteWith(user, params);
        break;
      
      case 'send':
      case 'emosend':
        await this.handleSendEmote(user, params);
        break;
      
      case 'emoteall':
        if (permLevel >= 2) {
          await this.handleEmoteAll(user, params);
        } else {
          await this.bot.whisper.send(user.id, 'You need mod permissions for this command!');
        }
        break;

      // Outfit commands
      case 'copy':
        if (permLevel >= 2) {
          await this.handleCopyOutfit(user);
        } else {
          await this.bot.whisper.send(user.id, 'Only mods and owners can use this command!');
        }
        break;
      
      case 'wear':
        if (permLevel >= 3) {
          await this.handleWear(user, params);
        }
        break;
      
      case 'remove':
        if (permLevel >= 3) {
          await this.handleRemove(user, params);
        }
        break;
      
      case 'buy':
        if (permLevel >= 3) {
          await this.handleBuy(user, params);
        }
        break;
      
      case 'save':
        if (permLevel >= 3) {
          await this.handleSaveOutfit(user, params);
        }
        break;
      
      case 'load':
        if (permLevel >= 3) {
          await this.handleLoadOutfit(user, params);
        }
        break;
      
      case 'random':
      case 'randomoutfit':
        if (permLevel >= 3) {
          await this.handleRandomOutfit(user);
        }
        break;
      
      case 'inventory':
        if (permLevel >= 3) {
          await this.handleInventory(user);
        }
        break;
      
      case 'clear':
      case 'clearoutfit':
        if (permLevel >= 3) {
          await this.handleClearOutfit(user);
        }
        break;

      // Permission commands
      case 'mod':
      case 'setmod':
        if (permLevel >= 3) {
          await this.handleSetMod(user, params);
        }
        break;
      
      case 'own':
      case 'setowner':
        if (permLevel >= 3) {
          await this.handleSetOwner(user, params);
        }
        break;
      
      case 'vip':
      case 'addvip':
        if (permLevel >= 2) {
          await this.handleAddVIP(user, params);
        }
        break;
      
      case 'removevip':
        if (permLevel >= 2) {
          await this.handleRemoveVIP(user, params);
        }
        break;
      
      case 'fixhome':
      case 'sethome':
        if (permLevel >= 2) {
          await this.handleSetHome(user);
        }
        break;
      
      case 'home':
      case 'gohome':
        if (permLevel >= 2) {
          await this.handleGoHome(user);
        }
        break;

      // Economy commands
      case 'mycoins':
      case 'balance':
      case 'coins':
        await this.handleBalance(user);
        break;
      
      case 'daily':
        await this.handleDaily(user);
        break;
      
      case 'transfer':
      case 'pay':
        await this.handleTransfer(user, params);
        break;
      
      case 'coinleaderboard':
      case 'richest':
        await this.handleCoinLeaderboard(user);
        break;

      // Tracking commands
      case 'mytime':
      case 'stats':
        await this.handleMyTime(user);
        break;
      
      case 'leaderboard':
      case 'top':
        await this.handleLeaderboard(user);
        break;
      
      case 'topusers':
        await this.handleTopUsers(user);
        break;

      // Moderation commands
      case 'kick':
        if (permLevel >= 2) {
          await this.handleKick(user, params);
        }
        break;
      
      case 'ban':
        if (permLevel >= 2) {
          await this.handleBan(user, params);
        }
        break;
      
      case 'mute':
        if (permLevel >= 2) {
          await this.handleMute(user, params);
        }
        break;
      
      case 'unmute':
        if (permLevel >= 2) {
          await this.handleUnmute(user, params);
        }
        break;
      
      case 'lockdown':
        if (permLevel >= 3) {
          await this.handleLockdown(user);
        }
        break;

      // Utility commands
      case 'help':
      case 'commands':
        await this.handleHelp(user);
        break;
      
      case 'ping':
        await this.bot.message.send('Pong! 🏓 Bot is online!');
        break;
      
      case 'whereami':
      case 'pos':
        await this.handleWhereAmI(user);
        break;

      // Teleport commands
      case 'summon':
        if (permLevel >= 2) {
          await this.handleSummon(user, params);
        }
        break;
      
      case 'teleport':
      case 'tp':
        if (permLevel >= 2) {
          await this.handleTeleport(user, params);
        }
        break;

      default:
        // Check if it's an emote number or name
        const emote = this.systems.emoteSystem.getEmote(cmd);
        if (emote) {
          await this.systems.emoteSystem.startEmote(user.id, cmd);
        }
        break;
    }
  }

  // Command implementations
  async handleEmoteCommand(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !emote <number or name>');
      return;
    }
    
    const result = await this.systems.emoteSystem.startEmote(user.id, params[0]);
    await this.bot.whisper.send(user.id, result.message);
  }

  async handleStopEmote(user) {
    const result = this.systems.emoteSystem.stopEmote(user.id);
    await this.bot.whisper.send(user.id, result.message);
  }

  async handleEmoteList(user, params) {
    const page = parseInt(params[0]) || 1;
    const list = this.systems.emoteSystem.getEmoteList(page, 20);
    
    let message = `📋 Emotes (Page ${list.page}/${list.totalPages}):\n`;
    list.emotes.forEach(e => {
      message += `${e.id}. ${e.name}\n`;
    });
    message += `\nTotal: ${list.total} emotes. Use !emotelist <page> for more.`;
    
    await this.bot.whisper.send(user.id, message);
  }

  async handleEmoteWith(user, params) {
    // Implementation for dual emote
    await this.bot.whisper.send(user.id, 'Emote with feature coming soon!');
  }

  async handleSendEmote(user, params) {
    if (params.length < 2) {
      await this.bot.whisper.send(user.id, 'Usage: !send @user <emote>');
      return;
    }
    
    // Extract user ID from mention
    const targetUsername = params[0].replace('@', '');
    const emote = params[1];
    
    // Find user in room
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === targetUsername.toLowerCase());
    
    if (target) {
      const result = await this.systems.emoteSystem.sendEmote(target[0].id, emote);
      await this.bot.whisper.send(user.id, result.message);
    } else {
      await this.bot.whisper.send(user.id, 'User not found in room!');
    }
  }

  async handleEmoteAll(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !emoteall <emote>');
      return;
    }
    
    const result = await this.systems.emoteSystem.emoteAll(params[0]);
    await this.bot.message.send(result.message);
  }

  async handleCopyOutfit(user) {
    await this.bot.message.send('Copying outfit... Please wait...');
    const result = await this.systems.outfitSystem.copyOutfit(user.id);
    await this.bot.message.send(result.message);
  }

  async handleWear(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !wear <itemId>');
      return;
    }
    
    const result = await this.systems.outfitSystem.wearItem(params[0]);
    await this.bot.whisper.send(user.id, result.message);
  }

  async handleRemove(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !remove <itemId>');
      return;
    }
    
    const result = await this.systems.outfitSystem.removeItem(params[0]);
    await this.bot.whisper.send(user.id, result.message);
  }

  async handleBuy(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !buy <itemId>');
      return;
    }
    
    const result = await this.systems.outfitSystem.buyItem(params[0]);
    await this.bot.whisper.send(user.id, result.message);
  }

  async handleSaveOutfit(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !save <name>');
      return;
    }
    
    const result = await this.systems.outfitSystem.saveOutfit(params.join(' '));
    await this.bot.whisper.send(user.id, result.message);
  }

  async handleLoadOutfit(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !load <name>');
      return;
    }
    
    const result = await this.systems.outfitSystem.loadOutfit(params.join(' '));
    await this.bot.whisper.send(user.id, result.message);
  }

  async handleRandomOutfit(user) {
    const result = await this.systems.outfitSystem.randomOutfit();
    await this.bot.whisper.send(user.id, result.message);
  }

  async handleInventory(user) {
    const inventory = await this.systems.outfitSystem.getInventory();
    await this.bot.whisper.send(user.id, `Bot has ${inventory.length} items in inventory.`);
  }

  async handleClearOutfit(user) {
    const result = await this.systems.outfitSystem.clearOutfit();
    await this.bot.whisper.send(user.id, result.message);
  }

  async handleSetMod(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !mod @user');
      return;
    }
    
    const username = params[0].replace('@', '');
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    
    if (target) {
      const result = this.systems.permissionSystem.addMod(target[0].id);
      await this.bot.message.send(result.message);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }

  async handleSetOwner(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !own @user');
      return;
    }
    
    const username = params[0].replace('@', '');
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    
    if (target) {
      const result = this.systems.permissionSystem.addOwner(target[0].id);
      await this.bot.message.send(result.message);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }

  async handleAddVIP(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !vip @user');
      return;
    }
    
    const username = params[0].replace('@', '');
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    
    if (target) {
      const result = this.systems.permissionSystem.addVIP(target[0].id);
      await this.bot.message.send(result.message);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }

  async handleRemoveVIP(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !removevip @user');
      return;
    }
    
    const username = params[0].replace('@', '');
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    
    if (target) {
      const result = this.systems.permissionSystem.removeVIP(target[0].id);
      await this.bot.message.send(result.message);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }

  async handleSetHome(user) {
    const result = await this.systems.permissionSystem.setHomePosition();
    await this.bot.message.send(result.message);
  }

  async handleGoHome(user) {
    const result = await this.systems.permissionSystem.goHome();
    await this.bot.message.send(result.message);
  }

  async handleBalance(user) {
    const balance = this.systems.economySystem.getBalance(user.id);
    await this.bot.whisper.send(user.id, `💰 Your balance: ${balance} coins`);
  }

  async handleDaily(user) {
    const result = this.systems.economySystem.claimDaily(user.id);
    await this.bot.whisper.send(user.id, result.message);
  }

  async handleTransfer(user, params) {
    if (params.length < 2) {
      await this.bot.whisper.send(user.id, 'Usage: !transfer @user <amount>');
      return;
    }
    
    const username = params[0].replace('@', '');
    const amount = parseInt(params[1]);
    
    if (isNaN(amount) || amount <= 0) {
      await this.bot.whisper.send(user.id, 'Invalid amount!');
      return;
    }
    
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    
    if (target) {
      const result = this.systems.economySystem.transfer(user.id, target[0].id, amount);
      await this.bot.whisper.send(user.id, result.message);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }

  async handleCoinLeaderboard(user) {
    const leaderboard = this.systems.economySystem.getLeaderboard(5);
    let message = '💰 Coin Leaderboard:\n';
    
    leaderboard.forEach((entry, index) => {
      message += `${index + 1}. ${entry.coins || 0} coins\n`;
    });
    
    await this.bot.message.send(message);
  }

  async handleMyTime(user) {
    const stats = this.systems.trackingSystem.getUserStats(user.id);
    
    if (!stats) {
      await this.bot.whisper.send(user.id, 'No stats available yet!');
      return;
    }
    
    const message = `📊 Your Stats:\n` +
      `⏱️ Time: ${stats.timeFormatted}\n` +
      `⭐ Level: ${stats.level}\n` +
      `✨ XP: ${stats.xp} (${stats.xpToNextLevel} to next level)\n` +
      `💬 Messages: ${stats.messageCount}`;
    
    await this.bot.whisper.send(user.id, message);
  }

  async handleLeaderboard(user) {
    const leaderboard = this.systems.trackingSystem.getLeaderboard('xp', 5);
    let message = '🏆 XP Leaderboard:\n';
    
    leaderboard.forEach((entry, index) => {
      message += `${index + 1}. Level ${entry.level || 1} - ${entry.xp || 0} XP\n`;
    });
    
    await this.bot.message.send(message);
  }

  async handleTopUsers(user) {
    const topUsers = this.systems.trackingSystem.getMostActiveToday(5);
    let message = '📈 Most Active Today:\n';
    
    topUsers.forEach((entry, index) => {
      message += `${index + 1}. ${entry.username}: ${entry.messageCount || 0} messages\n`;
    });
    
    await this.bot.message.send(message);
  }

  async handleKick(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !kick @user [reason]');
      return;
    }
    
    const username = params[0].replace('@', '');
    const reason = params.slice(1).join(' ') || 'No reason provided';
    
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    
    if (target) {
      const result = await this.systems.moderationSystem.kickUser(target[0].id, reason);
      await this.bot.message.send(result.message);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }

  async handleBan(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !ban @user [duration] [reason]');
      return;
    }
    
    const username = params[0].replace('@', '');
    const duration = parseInt(params[1]) || 3600;
    const reason = params.slice(2).join(' ') || 'No reason provided';
    
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    
    if (target) {
      const result = await this.systems.moderationSystem.banUser(target[0].id, duration, reason);
      await this.bot.message.send(result.message);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }

  async handleMute(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !mute @user [duration]');
      return;
    }
    
    const username = params[0].replace('@', '');
    const duration = parseInt(params[1]) || 60;
    
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    
    if (target) {
      const result = await this.systems.moderationSystem.muteUser(target[0].id, duration);
      await this.bot.message.send(result.message);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }

  async handleUnmute(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !unmute @user');
      return;
    }
    
    const username = params[0].replace('@', '');
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    
    if (target) {
      const result = await this.systems.moderationSystem.unmuteUser(target[0].id);
      await this.bot.message.send(result.message);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }

  async handleLockdown(user) {
    const result = this.systems.moderationSystem.toggleLockdown();
    await this.bot.message.send(result.message);
  }

  async handleHelp(user) {
    const permLevel = this.systems.permissionSystem.getPermissionLevel(user.id);
    
    let message = '📋 Available Commands:\n\n';
    message += '🎭 Emotes: Type number (1-279) or name, !emotelist, !stop\n';
    message += '💰 Economy: !mycoins, !daily, !transfer, !coinleaderboard\n';
    message += '📊 Stats: !mytime, !leaderboard, !topusers\n';
    message += '🔧 Utility: !help, !ping, !whereami\n';
    
    if (permLevel >= 1) {
      message += '\n👑 VIP Commands: (VIP zone access)\n';
    }
    
    if (permLevel >= 2) {
      message += '\n🛡️ Mod Commands: !kick, !ban, !mute, !summon, !copy\n';
    }
    
    if (permLevel >= 3) {
      message += '\n👔 Owner Commands: !mod, !own, !vip, !wear, !buy, !save, !load\n';
    }
    
    await this.bot.whisper.send(user.id, message);
  }

  async handleWhereAmI(user) {
    const players = await this.bot.room.players.get();
    const userPlayer = players.find(([p]) => p.id === user.id);
    
    if (userPlayer) {
      const pos = userPlayer[1];
      await this.bot.whisper.send(user.id, 
        `📍 Your position: (${pos.x}, ${pos.y}, ${pos.z}) facing ${pos.facing}`
      );
    }
  }

  async handleSummon(user, params) {
    if (params.length === 0) {
      await this.bot.whisper.send(user.id, 'Usage: !summon @user');
      return;
    }
    
    const username = params[0].replace('@', '');
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    const summoner = players.find(([p]) => p.id === user.id);
    
    if (target && summoner) {
      const pos = summoner[1];
      await this.bot.player.teleport(target[0].id, pos.x, pos.y, pos.z, pos.facing);
      await this.bot.message.send(`Summoned @${target[0].username}!`);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }

  async handleTeleport(user, params) {
    if (params.length < 4) {
      await this.bot.whisper.send(user.id, 'Usage: !tp @user <x> <y> <z>');
      return;
    }
    
    const username = params[0].replace('@', '');
    const x = parseFloat(params[1]);
    const y = parseFloat(params[2]);
    const z = parseFloat(params[3]);
    
    const players = await this.bot.room.players.get();
    const target = players.find(([p]) => p.username.toLowerCase() === username.toLowerCase());
    
    if (target) {
      await this.bot.player.teleport(target[0].id, x, y, z, 'FrontRight');
      await this.bot.message.send(`Teleported @${target[0].username}!`);
    } else {
      await this.bot.whisper.send(user.id, 'User not found!');
    }
  }
}

module.exports = MessageHandler;
