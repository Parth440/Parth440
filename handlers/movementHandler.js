/**
 * Movement Handler
 * Handles player movement events
 */

class MovementHandler {
  constructor(bot, db, logger, systems) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    this.systems = systems;
  }

  /**
   * Handle player movement
   */
  async handle(user, position) {
    // Handle click teleport
    if (this.systems.clickTeleport) {
      await this.systems.clickTeleport.handleMovement(user, position);
    }

    // Handle emote pause/resume on walk
    if (this.systems.emoteSystem) {
      await this.systems.emoteSystem.handleWalkDetection(user, position);
    }
  }
}

module.exports = MovementHandler;
