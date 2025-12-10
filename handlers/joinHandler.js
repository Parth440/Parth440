/**
 * Join Handler
 * Handles player join events
 */

class JoinHandler {
  constructor(bot, db, logger, systems) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    this.systems = systems;
  }

  /**
   * Handle player join
   */
  async handle(user) {
    // Track join
    if (this.systems.trackingSystem) {
      this.systems.trackingSystem.trackJoin(user);
    }

    // Save user for auto invite
    if (this.systems.autoInvite) {
      this.systems.autoInvite.saveUser(user.id, user.username);
    }

    // Log join
    this.logger.join(`${user.username} (${user.id}) joined the room`);
  }
}

module.exports = JoinHandler;
