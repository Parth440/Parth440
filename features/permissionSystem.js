/**
 * Permission System
 * Manages owners, mods, and VIPs
 */

class PermissionSystem {
  constructor(bot, db, logger) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    
    // Initialize default roles
    this.initializeRoles();
  }

  /**
   * Initialize default roles
   */
  initializeRoles() {
    if (!this.db.get('roles', 'owners')) {
      this.db.set('roles', 'owners', [this.bot.info.owner.id]);
    }
    if (!this.db.get('roles', 'mods')) {
      this.db.set('roles', 'mods', []);
    }
    if (!this.db.get('roles', 'vips')) {
      this.db.set('roles', 'vips', []);
    }
  }

  /**
   * Check if user is owner
   */
  isOwner(userId) {
    const owners = this.db.get('roles', 'owners') || [];
    return owners.includes(userId) || userId === this.bot.info.owner.id;
  }

  /**
   * Check if user is mod
   */
  isMod(userId) {
    const mods = this.db.get('roles', 'mods') || [];
    return mods.includes(userId);
  }

  /**
   * Check if user is VIP
   */
  isVIP(userId) {
    const vips = this.db.get('roles', 'vips') || [];
    return vips.includes(userId);
  }

  /**
   * Check if user is mod or owner
   */
  isModOrOwner(userId) {
    return this.isOwner(userId) || this.isMod(userId);
  }

  /**
   * Get user permission level
   */
  getPermissionLevel(userId) {
    if (this.isOwner(userId)) return 3;
    if (this.isMod(userId)) return 2;
    if (this.isVIP(userId)) return 1;
    return 0;
  }

  /**
   * Add owner
   */
  addOwner(userId) {
    const owners = this.db.get('roles', 'owners') || [];
    if (!owners.includes(userId)) {
      owners.push(userId);
      this.db.set('roles', 'owners', owners);
      return { success: true, message: 'User added as owner!' };
    }
    return { success: false, message: 'User is already an owner.' };
  }

  /**
   * Remove owner
   */
  removeOwner(userId) {
    let owners = this.db.get('roles', 'owners') || [];
    if (owners.includes(userId)) {
      owners = owners.filter(id => id !== userId);
      this.db.set('roles', 'owners', owners);
      return { success: true, message: 'Owner removed!' };
    }
    return { success: false, message: 'User is not an owner.' };
  }

  /**
   * Add mod
   */
  addMod(userId) {
    const mods = this.db.get('roles', 'mods') || [];
    if (!mods.includes(userId)) {
      mods.push(userId);
      this.db.set('roles', 'mods', mods);
      return { success: true, message: 'User added as moderator!' };
    }
    return { success: false, message: 'User is already a moderator.' };
  }

  /**
   * Remove mod
   */
  removeMod(userId) {
    let mods = this.db.get('roles', 'mods') || [];
    if (mods.includes(userId)) {
      mods = mods.filter(id => id !== userId);
      this.db.set('roles', 'mods', mods);
      return { success: true, message: 'Moderator removed!' };
    }
    return { success: false, message: 'User is not a moderator.' };
  }

  /**
   * Add VIP
   */
  addVIP(userId) {
    const vips = this.db.get('roles', 'vips') || [];
    if (!vips.includes(userId)) {
      vips.push(userId);
      this.db.set('roles', 'vips', vips);
      return { success: true, message: 'User added as VIP!' };
    }
    return { success: false, message: 'User is already a VIP.' };
  }

  /**
   * Remove VIP
   */
  removeVIP(userId) {
    let vips = this.db.get('roles', 'vips') || [];
    if (vips.includes(userId)) {
      vips = vips.filter(id => id !== userId);
      this.db.set('roles', 'vips', vips);
      return { success: true, message: 'VIP removed!' };
    }
    return { success: false, message: 'User is not a VIP.' };
  }

  /**
   * Get all owners
   */
  getOwners() {
    return this.db.get('roles', 'owners') || [];
  }

  /**
   * Get all mods
   */
  getMods() {
    return this.db.get('roles', 'mods') || [];
  }

  /**
   * Get all VIPs
   */
  getVIPs() {
    return this.db.get('roles', 'vips') || [];
  }

  /**
   * Get user role name
   */
  getRoleName(userId) {
    if (this.isOwner(userId)) return 'Owner';
    if (this.isMod(userId)) return 'Moderator';
    if (this.isVIP(userId)) return 'VIP';
    return 'User';
  }

  /**
   * Check if user has permission for command
   */
  hasPermission(userId, requiredLevel) {
    return this.getPermissionLevel(userId) >= requiredLevel;
  }

  /**
   * Set bot home position
   */
  async setHomePosition() {
    try {
      const players = await this.bot.room.players.get();
      const botPlayer = players.find(([player]) => player.id === this.bot.info.user.id);
      
      if (botPlayer) {
        const position = botPlayer[1];
        this.db.set('home_position', 'position', position);
        return { success: true, message: 'Home position saved!', position };
      }
      
      return { success: false, message: 'Could not find bot position.' };
    } catch (error) {
      this.logger.error('Error setting home position:', error);
      return { success: false, message: 'Failed to set home position.' };
    }
  }

  /**
   * Go to home position
   */
  async goHome() {
    try {
      const position = this.db.get('home_position', 'position');
      
      if (!position) {
        return { success: false, message: 'No home position set. Use !fixhome first.' };
      }

      await this.bot.move.walk(
        position.x,
        position.y,
        position.z,
        position.facing || 'FrontRight'
      );

      return { success: true, message: 'Returned to home position!' };
    } catch (error) {
      this.logger.error('Error going home:', error);
      return { success: false, message: 'Failed to go home.' };
    }
  }
}

module.exports = PermissionSystem;
