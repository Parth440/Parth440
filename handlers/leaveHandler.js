/**
 * Leave Handler
 * Handles player leave events
 */

class LeaveHandler {
  constructor(bot, db, logger, systems) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    this.systems = systems;
  }

  /**
   * Handle player leave
   */
  async handle(user) {
    // Track leave
    if (this.systems.trackingSystem) {
      this.systems.trackingSystem.trackLeave(user);
    }

    // Log leave
    this.logger.leave(`${user.username} (${user.id}) left the room`);
  }
}

module.exports = LeaveHandler;
