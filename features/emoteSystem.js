/**
 * Emote System
 * Handles all 279 emotes with looping, pause on walk, and resume
 */

const emotesData = require('../data/emotes.json');

class EmoteSystem {
  constructor(bot, db, logger) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    this.emotes = emotesData.emotes;
    this.activeEmotes = new Map(); // userId -> { emoteId, interval }
    this.walkingUsers = new Set();
    this.autoEmoteInterval = null;
    this.currentAutoEmoteIndex = 0;
  }

  /**
   * Get emote by number or name
   */
  getEmote(input) {
    const num = parseInt(input);
    
    if (!isNaN(num)) {
      return this.emotes.find(e => e.id === num);
    }
    
    return this.emotes.find(e => 
      e.name.toLowerCase() === input.toLowerCase()
    );
  }

  /**
   * Start looping emote for user
   */
  async startEmote(userId, emoteInput) {
    const emote = this.getEmote(emoteInput);
    
    if (!emote) {
      return { success: false, message: 'Emote not found! Use !emotelist to see all emotes.' };
    }

    // Stop existing emote if any
    this.stopEmote(userId);

    // Start new emote loop
    const interval = setInterval(async () => {
      if (!this.walkingUsers.has(userId)) {
        try {
          await this.bot.player.emote(userId, emote.emote_id);
        } catch (error) {
          this.logger.error(`Error performing emote for ${userId}:`, error);
        }
      }
    }, 5000); // Repeat every 5 seconds

    this.activeEmotes.set(userId, {
      emoteId: emote.emote_id,
      emoteName: emote.name,
      interval: interval
    });

    // Perform immediately
    try {
      await this.bot.player.emote(userId, emote.emote_id);
      return { success: true, message: `Started emote: ${emote.name} (${emote.id})` };
    } catch (error) {
      this.stopEmote(userId);
      return { success: false, message: 'Failed to start emote. You may not own this emote.' };
    }
  }

  /**
   * Stop emote for user
   */
  stopEmote(userId) {
    const active = this.activeEmotes.get(userId);
    
    if (active) {
      clearInterval(active.interval);
      this.activeEmotes.delete(userId);
      return { success: true, message: 'Emote stopped!' };
    }
    
    return { success: false, message: 'No active emote to stop.' };
  }

  /**
   * Handle walk detection - pause emote when walking
   */
  async handleWalkDetection(user, position) {
    const userId = user.id;
    const lastPos = this.db.get('positions', userId);

    if (lastPos) {
      const moved = lastPos.x !== position.x || 
                   lastPos.y !== position.y || 
                   lastPos.z !== position.z;

      if (moved) {
        // User is walking
        if (!this.walkingUsers.has(userId)) {
          this.walkingUsers.add(userId);
          this.logger.debug(`User ${user.username} started walking - pausing emote`);
        }

        // Set timeout to detect when walking stops
        if (this.walkingTimeouts) {
          clearTimeout(this.walkingTimeouts.get(userId));
        }

        const timeout = setTimeout(() => {
          this.walkingUsers.delete(userId);
          this.logger.debug(`User ${user.username} stopped walking - resuming emote`);
        }, 2000); // 2 seconds of no movement = stopped walking

        if (!this.walkingTimeouts) {
          this.walkingTimeouts = new Map();
        }
        this.walkingTimeouts.set(userId, timeout);
      }
    }

    // Save current position
    this.db.set('positions', userId, position);
  }

  /**
   * Get emote list (paginated)
   */
  getEmoteList(page = 1, perPage = 20) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageEmotes = this.emotes.slice(start, end);
    const totalPages = Math.ceil(this.emotes.length / perPage);

    return {
      emotes: pageEmotes,
      page: page,
      totalPages: totalPages,
      total: this.emotes.length
    };
  }

  /**
   * Start auto emote for bot
   */
  startAutoEmote() {
    if (this.autoEmoteInterval) {
      return;
    }

    this.autoEmoteInterval = setInterval(async () => {
      try {
        const emote = this.emotes[this.currentAutoEmoteIndex];
        await this.bot.player.emote(this.bot.info.user.id, emote.emote_id);
        
        this.currentAutoEmoteIndex = (this.currentAutoEmoteIndex + 1) % this.emotes.length;
      } catch (error) {
        // Silently fail - bot may not own all emotes
      }
    }, 15000); // Every 15 seconds

    this.logger.info('Auto emote system started');
  }

  /**
   * Stop auto emote
   */
  stopAutoEmote() {
    if (this.autoEmoteInterval) {
      clearInterval(this.autoEmoteInterval);
      this.autoEmoteInterval = null;
      this.logger.info('Auto emote system stopped');
    }
  }

  /**
   * Perform emote on another user (send emote)
   */
  async sendEmote(targetUserId, emoteInput) {
    const emote = this.getEmote(emoteInput);
    
    if (!emote) {
      return { success: false, message: 'Emote not found!' };
    }

    try {
      await this.bot.player.emote(targetUserId, emote.emote_id);
      return { success: true, message: `Sent ${emote.name} to user!` };
    } catch (error) {
      return { success: false, message: 'Failed to send emote. User may not own it.' };
    }
  }

  /**
   * Perform emote on all users in room
   */
  async emoteAll(emoteInput) {
    const emote = this.getEmote(emoteInput);
    
    if (!emote) {
      return { success: false, message: 'Emote not found!' };
    }

    try {
      const players = await this.bot.room.players.get();
      let successCount = 0;

      for (const [player, position] of players) {
        try {
          await this.bot.player.emote(player.id, emote.emote_id);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 500)); // Delay between emotes
        } catch (error) {
          // Skip users who don't own the emote
        }
      }

      return { 
        success: true, 
        message: `Performed ${emote.name} on ${successCount} players!` 
      };
    } catch (error) {
      return { success: false, message: 'Failed to perform emote on all users.' };
    }
  }

  /**
   * Get active emote for user
   */
  getActiveEmote(userId) {
    return this.activeEmotes.get(userId);
  }

  /**
   * Cleanup on shutdown
   */
  cleanup() {
    // Stop all active emotes
    for (const [userId, data] of this.activeEmotes) {
      clearInterval(data.interval);
    }
    this.activeEmotes.clear();

    // Stop auto emote
    this.stopAutoEmote();

    // Clear walking timeouts
    if (this.walkingTimeouts) {
      for (const timeout of this.walkingTimeouts.values()) {
        clearTimeout(timeout);
      }
      this.walkingTimeouts.clear();
    }
  }
}

module.exports = EmoteSystem;
