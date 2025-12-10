/**
 * Auto Invite System
 * Automatically invites users who have visited the room every 2 hours
 */

class AutoInvite {
  constructor(bot, db, logger) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    this.inviteInterval = null;
  }

  /**
   * Save user who entered room
   */
  saveUser(userId, username) {
    const players = this.db.get('players') || {};
    
    if (!players[userId]) {
      players[userId] = {
        id: userId,
        username: username,
        firstVisit: Date.now(),
        lastVisit: Date.now(),
        visitCount: 1
      };
    } else {
      players[userId].lastVisit = Date.now();
      players[userId].visitCount++;
      players[userId].username = username; // Update username
    }

    this.db.set('players', userId, players[userId]);
  }

  /**
   * Start auto invite system (every 2 hours)
   */
  startAutoInvite() {
    if (this.inviteInterval) {
      return;
    }

    // Run immediately on start
    this.sendInvites();

    // Then run every 2 hours
    this.inviteInterval = setInterval(() => {
      this.sendInvites();
    }, 7200000); // 2 hours

    this.logger.info('Auto invite system started (every 2 hours)');
  }

  /**
   * Send invites to all saved users not in room
   */
  async sendInvites() {
    try {
      const allPlayers = this.db.get('players') || {};
      const playerIds = Object.keys(allPlayers);

      if (playerIds.length === 0) {
        this.logger.info('No players to invite');
        return;
      }

      // Get current players in room
      const currentPlayers = await this.bot.room.players.get();
      const currentPlayerIds = currentPlayers.map(([player]) => player.id);

      // Filter out players already in room
      const toInvite = playerIds.filter(id => !currentPlayerIds.includes(id));

      this.logger.info(`Sending invites to ${toInvite.length} players`);

      let successCount = 0;
      let failCount = 0;

      for (const userId of toInvite) {
        try {
          // Get conversation ID for DM
          const conversations = await this.bot.inbox.conversations.get(false, null);
          const conversation = conversations.find(c => 
            c.member_ids.includes(userId)
          );

          if (conversation) {
            await this.bot.direct.send(
              conversation.id,
              `Hey! Come join us in the room! 🎉`
            );
            successCount++;

            // Update last invite time
            this.db.update('players', userId, {
              lastInvite: Date.now()
            });

            // Delay between invites to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          failCount++;
          this.logger.error(`Failed to invite ${userId}:`, error);
        }
      }

      this.logger.success(`Invites sent: ${successCount} success, ${failCount} failed`);

    } catch (error) {
      this.logger.error('Error in auto invite system:', error);
    }
  }

  /**
   * Manually invite specific user
   */
  async inviteUser(userId) {
    try {
      const conversations = await this.bot.inbox.conversations.get(false, null);
      const conversation = conversations.find(c => 
        c.member_ids.includes(userId)
      );

      if (conversation) {
        await this.bot.direct.send(
          conversation.id,
          `You're invited to join the room! 🎉`
        );
        return { success: true, message: 'Invite sent!' };
      } else {
        return { success: false, message: 'No conversation found with user.' };
      }
    } catch (error) {
      this.logger.error('Error inviting user:', error);
      return { success: false, message: 'Failed to send invite.' };
    }
  }

  /**
   * Get all saved players
   */
  getAllPlayers() {
    return this.db.values('players');
  }

  /**
   * Get player count
   */
  getPlayerCount() {
    return this.db.count('players');
  }

  /**
   * Stop auto invite system
   */
  stopAutoInvite() {
    if (this.inviteInterval) {
      clearInterval(this.inviteInterval);
      this.inviteInterval = null;
      this.logger.info('Auto invite system stopped');
    }
  }
}

module.exports = AutoInvite;
