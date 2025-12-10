/**
 * Click Teleport System
 * Teleports users when they click 4+ tiles away
 */

class ClickTeleport {
  constructor(bot, db, logger) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    this.lastPositions = new Map();
    this.clickDetectionTimeout = new Map();
  }

  /**
   * Calculate distance between two positions
   */
  calculateDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Handle movement and detect clicks
   */
  async handleMovement(user, newPosition) {
    const userId = user.id;
    const lastPos = this.lastPositions.get(userId);

    if (lastPos) {
      const distance = this.calculateDistance(lastPos, newPosition);

      // If distance >= 4 tiles, it's likely a click teleport
      if (distance >= 4) {
        this.logger.info(`Click detected for ${user.username}: distance ${distance.toFixed(2)}`);
        
        // Teleport user to clicked position
        try {
          await this.bot.player.teleport(
            userId,
            newPosition.x,
            newPosition.y,
            newPosition.z,
            newPosition.facing || 'FrontRight'
          );

          // Log the teleport
          this.db.push('teleport_history', userId, {
            from: lastPos,
            to: newPosition,
            distance: distance,
            timestamp: Date.now()
          });

        } catch (error) {
          this.logger.error(`Error teleporting ${user.username}:`, error);
        }
      }
    }

    // Update last position
    this.lastPositions.set(userId, {
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
      facing: newPosition.facing
    });
  }

  /**
   * Teleport user to specific coordinates
   */
  async teleportUser(userId, x, y, z, facing = 'FrontRight') {
    try {
      await this.bot.player.teleport(userId, x, y, z, facing);
      return { success: true, message: `Teleported to (${x}, ${y}, ${z})` };
    } catch (error) {
      this.logger.error('Error teleporting user:', error);
      return { success: false, message: 'Failed to teleport user.' };
    }
  }

  /**
   * Get teleport history for user
   */
  getTeleportHistory(userId, limit = 10) {
    const history = this.db.get('teleport_history', userId) || [];
    return history.slice(-limit);
  }

  /**
   * Clear user's last position (on leave)
   */
  clearUserPosition(userId) {
    this.lastPositions.delete(userId);
    
    if (this.clickDetectionTimeout.has(userId)) {
      clearTimeout(this.clickDetectionTimeout.get(userId));
      this.clickDetectionTimeout.delete(userId);
    }
  }

  /**
   * Get all tracked positions
   */
  getAllPositions() {
    return Array.from(this.lastPositions.entries());
  }
}

module.exports = ClickTeleport;
