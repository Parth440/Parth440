/**
 * Moderation System
 * Handles kicks, bans, mutes, and room moderation
 */

class ModerationSystem {
  constructor(bot, db, logger) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    this.spamTracker = new Map();
  }

  /**
   * Kick user from room
   */
  async kickUser(userId, reason = 'No reason provided') {
    try {
      await this.bot.player.kick(userId);
      
      // Log the action
      this.db.push('moderation', 'kicks', {
        userId: userId,
        reason: reason,
        timestamp: Date.now()
      });

      return { success: true, message: 'User kicked successfully!' };
    } catch (error) {
      this.logger.error('Error kicking user:', error);
      return { success: false, message: 'Failed to kick user. Check bot permissions.' };
    }
  }

  /**
   * Ban user from room
   */
  async banUser(userId, duration = 3600, reason = 'No reason provided') {
    try {
      await this.bot.player.ban(userId, duration);
      
      // Log the action
      this.db.push('moderation', 'bans', {
        userId: userId,
        duration: duration,
        reason: reason,
        timestamp: Date.now()
      });

      return { success: true, message: `User banned for ${duration} seconds!` };
    } catch (error) {
      this.logger.error('Error banning user:', error);
      return { success: false, message: 'Failed to ban user. Check bot permissions.' };
    }
  }

  /**
   * Unban user
   */
  async unbanUser(userId) {
    try {
      await this.bot.player.unban(userId);
      return { success: true, message: 'User unbanned successfully!' };
    } catch (error) {
      this.logger.error('Error unbanning user:', error);
      return { success: false, message: 'Failed to unban user.' };
    }
  }

  /**
   * Mute user
   */
  async muteUser(userId, duration = 60) {
    try {
      await this.bot.player.mute(userId, duration);
      
      // Log the action
      this.db.push('moderation', 'mutes', {
        userId: userId,
        duration: duration,
        timestamp: Date.now()
      });

      return { success: true, message: `User muted for ${duration} seconds!` };
    } catch (error) {
      this.logger.error('Error muting user:', error);
      return { success: false, message: 'Failed to mute user.' };
    }
  }

  /**
   * Unmute user
   */
  async unmuteUser(userId) {
    try {
      await this.bot.player.unmute(userId);
      return { success: true, message: 'User unmuted successfully!' };
    } catch (error) {
      this.logger.error('Error unmuting user:', error);
      return { success: false, message: 'Failed to unmute user.' };
    }
  }

  /**
   * Track spam and auto-kick if threshold exceeded
   */
  trackSpam(userId, message) {
    const now = Date.now();
    
    if (!this.spamTracker.has(userId)) {
      this.spamTracker.set(userId, []);
    }

    const userMessages = this.spamTracker.get(userId);
    
    // Remove messages older than 10 seconds
    const recentMessages = userMessages.filter(msg => now - msg.timestamp < 10000);
    
    // Add current message
    recentMessages.push({ message, timestamp: now });
    this.spamTracker.set(userId, recentMessages);

    // Check if spam threshold exceeded
    if (recentMessages.length >= 5) {
      this.logger.warn(`Spam detected from user ${userId}`);
      return true;
    }

    return false;
  }

  /**
   * Check for bad words
   */
  containsBadWords(message) {
    const badWords = this.db.get('moderation', 'badwords') || [
      'scam', 'hack', 'cheat', 'steal'
    ];

    const lowerMessage = message.toLowerCase();
    return badWords.some(word => lowerMessage.includes(word));
  }

  /**
   * Add bad word to filter
   */
  addBadWord(word) {
    const badWords = this.db.get('moderation', 'badwords') || [];
    if (!badWords.includes(word.toLowerCase())) {
      badWords.push(word.toLowerCase());
      this.db.set('moderation', 'badwords', badWords);
      return { success: true, message: 'Bad word added to filter!' };
    }
    return { success: false, message: 'Word already in filter.' };
  }

  /**
   * Remove bad word from filter
   */
  removeBadWord(word) {
    let badWords = this.db.get('moderation', 'badwords') || [];
    const filtered = badWords.filter(w => w !== word.toLowerCase());
    
    if (filtered.length < badWords.length) {
      this.db.set('moderation', 'badwords', filtered);
      return { success: true, message: 'Bad word removed from filter!' };
    }
    return { success: false, message: 'Word not found in filter.' };
  }

  /**
   * Get moderation logs
   */
  getLogs(type = 'all', limit = 10) {
    if (type === 'all') {
      const kicks = this.db.get('moderation', 'kicks') || [];
      const bans = this.db.get('moderation', 'bans') || [];
      const mutes = this.db.get('moderation', 'mutes') || [];
      
      return {
        kicks: kicks.slice(-limit),
        bans: bans.slice(-limit),
        mutes: mutes.slice(-limit)
      };
    }

    const logs = this.db.get('moderation', type) || [];
    return logs.slice(-limit);
  }

  /**
   * Clear spam tracker for user
   */
  clearSpamTracker(userId) {
    this.spamTracker.delete(userId);
  }

  /**
   * Enable/disable lockdown mode
   */
  toggleLockdown() {
    const current = this.db.get('settings', 'lockdown') || false;
    this.db.set('settings', 'lockdown', !current);
    return { 
      success: true, 
      message: `Lockdown ${!current ? 'enabled' : 'disabled'}!`,
      lockdown: !current
    };
  }

  /**
   * Check if lockdown is active
   */
  isLockdown() {
    return this.db.get('settings', 'lockdown') || false;
  }

  /**
   * Warn user
   */
  warnUser(userId, reason) {
    const warnings = this.db.get('moderation', `warnings_${userId}`) || [];
    warnings.push({
      reason: reason,
      timestamp: Date.now()
    });
    
    this.db.set('moderation', `warnings_${userId}`, warnings);
    
    return { 
      success: true, 
      message: 'User warned!',
      totalWarnings: warnings.length
    };
  }

  /**
   * Get user warnings
   */
  getWarnings(userId) {
    return this.db.get('moderation', `warnings_${userId}`) || [];
  }

  /**
   * Clear user warnings
   */
  clearWarnings(userId) {
    this.db.delete('moderation', `warnings_${userId}`);
    return { success: true, message: 'Warnings cleared!' };
  }
}

module.exports = ModerationSystem;
