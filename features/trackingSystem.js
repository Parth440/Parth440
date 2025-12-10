/**
 * Tracking System
 * Tracks user activity, time, XP, and levels
 */

const config = require('../config/config');

class TrackingSystem {
  constructor(bot, db, logger) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    this.activeUsers = new Map(); // userId -> join timestamp
  }

  /**
   * Track user join
   */
  trackJoin(user) {
    this.activeUsers.set(user.id, Date.now());
    
    // Update tracking data
    const tracking = this.db.get('tracking', user.id) || {
      userId: user.id,
      username: user.username,
      totalTime: 0,
      xp: 0,
      level: 1,
      messageCount: 0,
      joinCount: 0,
      firstJoin: Date.now()
    };

    tracking.joinCount++;
    tracking.lastJoin = Date.now();
    tracking.username = user.username; // Update username

    this.db.set('tracking', user.id, tracking);
  }

  /**
   * Track user leave
   */
  trackLeave(user) {
    const joinTime = this.activeUsers.get(user.id);
    
    if (joinTime) {
      const sessionTime = Date.now() - joinTime;
      const tracking = this.db.get('tracking', user.id);
      
      if (tracking) {
        tracking.totalTime += sessionTime;
        tracking.lastLeave = Date.now();
        
        // Award XP for time spent (2 XP per minute)
        const minutesSpent = Math.floor(sessionTime / 60000);
        const xpGained = minutesSpent * config.XP_PER_MINUTE;
        
        if (xpGained > 0) {
          this.addXP(user.id, xpGained);
        }
        
        this.db.set('tracking', user.id, tracking);
      }
      
      this.activeUsers.delete(user.id);
    }
  }

  /**
   * Track message
   */
  trackMessage(user) {
    const tracking = this.db.get('tracking', user.id) || {
      userId: user.id,
      username: user.username,
      totalTime: 0,
      xp: 0,
      level: 1,
      messageCount: 0,
      joinCount: 0,
      firstJoin: Date.now()
    };

    tracking.messageCount++;
    tracking.lastMessage = Date.now();
    
    // Award XP for message
    this.addXP(user.id, config.XP_PER_MESSAGE);
    
    this.db.set('tracking', user.id, tracking);
  }

  /**
   * Add XP and check for level up
   */
  addXP(userId, amount) {
    const tracking = this.db.get('tracking', userId);
    
    if (!tracking) return;

    const oldLevel = tracking.level || 1;
    tracking.xp = (tracking.xp || 0) + amount;
    
    // Calculate new level (100 XP per level)
    const newLevel = Math.floor(tracking.xp / 100) + 1;
    
    if (newLevel > oldLevel) {
      tracking.level = newLevel;
      this.db.set('tracking', userId, tracking);
      
      // Notify level up
      this.bot.message.send(
        `🎉 Congratulations! @${tracking.username} reached level ${newLevel}!`
      ).catch(e => this.logger.error('Error sending level up message:', e));
      
      return { leveledUp: true, newLevel: newLevel };
    }
    
    this.db.set('tracking', userId, tracking);
    return { leveledUp: false };
  }

  /**
   * Get user stats
   */
  getUserStats(userId) {
    const tracking = this.db.get('tracking', userId);
    
    if (!tracking) {
      return null;
    }

    // Calculate time in readable format
    const totalMinutes = Math.floor(tracking.totalTime / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      ...tracking,
      timeFormatted: `${hours}h ${minutes}m`,
      xpToNextLevel: 100 - (tracking.xp % 100)
    };
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(type = 'xp', limit = 10) {
    const field = type === 'time' ? 'totalTime' : 'xp';
    return this.db.top('tracking', field, limit);
  }

  /**
   * Get user rank
   */
  getUserRank(userId, type = 'xp') {
    const field = type === 'time' ? 'totalTime' : 'xp';
    const sorted = this.db.sort('tracking', field, 'desc');
    const rank = sorted.findIndex(entry => entry.key === userId);
    return rank === -1 ? null : rank + 1;
  }

  /**
   * Get active users count
   */
  getActiveUsersCount() {
    return this.activeUsers.size;
  }

  /**
   * Get total tracked users
   */
  getTotalUsers() {
    return this.db.count('tracking');
  }

  /**
   * Get room statistics
   */
  getRoomStats() {
    const allTracking = this.db.values('tracking');
    
    const totalMessages = allTracking.reduce((sum, t) => sum + (t.messageCount || 0), 0);
    const totalTime = allTracking.reduce((sum, t) => sum + (t.totalTime || 0), 0);
    const avgLevel = allTracking.reduce((sum, t) => sum + (t.level || 1), 0) / allTracking.length;

    return {
      totalUsers: allTracking.length,
      activeUsers: this.activeUsers.size,
      totalMessages: totalMessages,
      totalTime: Math.floor(totalTime / 60000), // in minutes
      averageLevel: Math.floor(avgLevel)
    };
  }

  /**
   * Reset user stats
   */
  resetUser(userId) {
    this.db.delete('tracking', userId);
    this.activeUsers.delete(userId);
    return { success: true, message: 'User stats reset!' };
  }

  /**
   * Get most active users today
   */
  getMostActiveToday(limit = 5) {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const recentActive = this.db.filter('tracking', (key, value) => {
      return value.lastMessage && value.lastMessage > oneDayAgo;
    });

    return recentActive
      .sort((a, b) => (b.messageCount || 0) - (a.messageCount || 0))
      .slice(0, limit);
  }

  /**
   * Award bonus XP
   */
  awardBonusXP(userId, amount, reason) {
    this.addXP(userId, amount);
    
    this.db.push('tracking', `bonuses_${userId}`, {
      amount: amount,
      reason: reason,
      timestamp: Date.now()
    });

    return { success: true, message: `Awarded ${amount} bonus XP!` };
  }
}

module.exports = TrackingSystem;
