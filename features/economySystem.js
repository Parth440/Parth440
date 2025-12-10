/**
 * Economy System
 * Manages coins, daily rewards, and transactions
 */

const config = require('../config/config');

class EconomySystem {
  constructor(bot, db, logger) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
  }

  /**
   * Get user balance
   */
  getBalance(userId) {
    const economy = this.db.get('economy', userId);
    return economy ? economy.coins : 0;
  }

  /**
   * Add coins to user
   */
  addCoins(userId, amount) {
    const current = this.getBalance(userId);
    const newBalance = current + amount;
    
    this.db.update('economy', userId, {
      coins: newBalance,
      lastUpdate: Date.now()
    });

    return newBalance;
  }

  /**
   * Remove coins from user
   */
  removeCoins(userId, amount) {
    const current = this.getBalance(userId);
    
    if (current < amount) {
      return { success: false, message: 'Insufficient coins!' };
    }

    const newBalance = current - amount;
    this.db.update('economy', userId, {
      coins: newBalance,
      lastUpdate: Date.now()
    });

    return { success: true, balance: newBalance };
  }

  /**
   * Transfer coins between users
   */
  transfer(fromUserId, toUserId, amount) {
    if (amount <= 0) {
      return { success: false, message: 'Amount must be positive!' };
    }

    const fromBalance = this.getBalance(fromUserId);
    
    if (fromBalance < amount) {
      return { success: false, message: 'Insufficient coins!' };
    }

    this.removeCoins(fromUserId, amount);
    this.addCoins(toUserId, amount);

    // Log transaction
    this.db.push('transactions', 'history', {
      from: fromUserId,
      to: toUserId,
      amount: amount,
      timestamp: Date.now()
    });

    return { 
      success: true, 
      message: `Transferred ${amount} coins successfully!` 
    };
  }

  /**
   * Claim daily reward
   */
  claimDaily(userId) {
    const economy = this.db.get('economy', userId) || {};
    const lastDaily = economy.lastDaily || 0;
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    if (now - lastDaily < dayInMs) {
      const timeLeft = dayInMs - (now - lastDaily);
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      return { 
        success: false, 
        message: `Daily reward already claimed! Come back in ${hoursLeft}h ${minutesLeft}m` 
      };
    }

    const reward = config.DAILY_REWARD_AMOUNT;
    const newBalance = this.addCoins(userId, reward);

    this.db.update('economy', userId, {
      lastDaily: now,
      dailyStreak: (economy.dailyStreak || 0) + 1
    });

    return { 
      success: true, 
      message: `Daily reward claimed! +${reward} coins. New balance: ${newBalance}`,
      reward: reward,
      balance: newBalance
    };
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit = 10) {
    return this.db.top('economy', 'coins', limit);
  }

  /**
   * Get user rank
   */
  getUserRank(userId) {
    const sorted = this.db.sort('economy', 'coins', 'desc');
    const rank = sorted.findIndex(entry => entry.key === userId);
    return rank === -1 ? null : rank + 1;
  }

  /**
   * Award coins for activity
   */
  awardActivityCoins(userId, amount = 1) {
    this.addCoins(userId, amount);
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(userId, limit = 10) {
    const allTransactions = this.db.get('transactions', 'history') || [];
    const userTransactions = allTransactions.filter(t => 
      t.from === userId || t.to === userId
    );
    return userTransactions.slice(-limit);
  }

  /**
   * Get total coins in circulation
   */
  getTotalCoins() {
    const allEconomy = this.db.values('economy');
    return allEconomy.reduce((sum, user) => sum + (user.coins || 0), 0);
  }

  /**
   * Reset user economy
   */
  resetUser(userId) {
    this.db.delete('economy', userId);
    return { success: true, message: 'User economy reset!' };
  }

  /**
   * Get economy stats
   */
  getStats() {
    const allUsers = this.db.values('economy');
    const totalCoins = this.getTotalCoins();
    const avgCoins = allUsers.length > 0 ? totalCoins / allUsers.length : 0;

    return {
      totalUsers: allUsers.length,
      totalCoins: totalCoins,
      averageCoins: Math.floor(avgCoins),
      richestUser: allUsers.reduce((max, user) => 
        (user.coins || 0) > (max.coins || 0) ? user : max, 
        { coins: 0 }
      )
    };
  }
}

module.exports = EconomySystem;
