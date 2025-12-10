/**
 * Outfit System
 * Handles outfit copying, changing, saving, and item management
 */

class OutfitSystem {
  constructor(bot, db, logger) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
  }

  /**
   * Copy user's outfit to bot
   * Main feature: !copy command
   */
  async copyOutfit(userId) {
    try {
      // Fetch user's outfit
      const outfit = await this.bot.player.outfit.get(userId);
      
      if (!outfit || outfit.length === 0) {
        return { success: false, message: 'Could not fetch user outfit.' };
      }

      this.logger.info(`Copying outfit with ${outfit.length} items`);

      // Get bot's inventory
      const inventory = await this.bot.inventory.get();
      const inventoryIds = inventory.map(item => item.id);

      // Filter items bot owns or try to buy missing ones
      const finalOutfit = [];
      const missingItems = [];
      const boughtItems = [];

      for (const item of outfit) {
        if (inventoryIds.includes(item.id)) {
          finalOutfit.push(item);
        } else {
          // Try to buy the item
          try {
            await this.bot.items.buy(item.id);
            finalOutfit.push(item);
            boughtItems.push(item.id);
            this.logger.success(`Bought item: ${item.id}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay between purchases
          } catch (error) {
            missingItems.push(item.id);
            this.logger.warn(`Cannot buy item: ${item.id}`);
          }
        }
      }

      // Apply the outfit
      if (finalOutfit.length > 0) {
        await this.bot.outfit.change(finalOutfit);
        
        // Cache the outfit
        this.db.set('outfits', userId, {
          outfit: outfit,
          timestamp: Date.now()
        });

        let message = `Outfit copied! Applied ${finalOutfit.length}/${outfit.length} items.`;
        if (boughtItems.length > 0) {
          message += ` Bought ${boughtItems.length} new items.`;
        }
        if (missingItems.length > 0) {
          message += ` Skipped ${missingItems.length} unavailable items.`;
        }

        return { success: true, message: message };
      } else {
        return { success: false, message: 'No items could be applied.' };
      }

    } catch (error) {
      this.logger.error('Error copying outfit:', error);
      return { success: false, message: 'Failed to copy outfit.' };
    }
  }

  /**
   * Get bot's current outfit
   */
  async getCurrentOutfit() {
    try {
      return await this.bot.player.outfit.get(this.bot.info.user.id);
    } catch (error) {
      this.logger.error('Error getting current outfit:', error);
      return null;
    }
  }

  /**
   * Save current outfit with a name
   */
  async saveOutfit(name) {
    try {
      const outfit = await this.getCurrentOutfit();
      
      if (!outfit) {
        return { success: false, message: 'Could not get current outfit.' };
      }

      this.db.set('saved_outfits', name.toLowerCase(), {
        name: name,
        outfit: outfit,
        timestamp: Date.now()
      });

      return { success: true, message: `Outfit saved as "${name}"!` };
    } catch (error) {
      this.logger.error('Error saving outfit:', error);
      return { success: false, message: 'Failed to save outfit.' };
    }
  }

  /**
   * Load saved outfit by name
   */
  async loadOutfit(name) {
    try {
      const saved = this.db.get('saved_outfits', name.toLowerCase());
      
      if (!saved) {
        return { success: false, message: `Outfit "${name}" not found.` };
      }

      await this.bot.outfit.change(saved.outfit);
      return { success: true, message: `Loaded outfit "${name}"!` };
    } catch (error) {
      this.logger.error('Error loading outfit:', error);
      return { success: false, message: 'Failed to load outfit.' };
    }
  }

  /**
   * Get list of saved outfits
   */
  getSavedOutfits() {
    const outfits = this.db.get('saved_outfits') || {};
    return Object.values(outfits).map(o => o.name);
  }

  /**
   * Wear specific item
   */
  async wearItem(itemId) {
    try {
      const currentOutfit = await this.getCurrentOutfit();
      
      // Add the new item to outfit
      const newOutfit = [...currentOutfit, {
        type: 'clothing',
        amount: 1,
        id: itemId,
        account_bound: false,
        active_palette: 0
      }];

      await this.bot.outfit.change(newOutfit);
      return { success: true, message: `Wearing item: ${itemId}` };
    } catch (error) {
      this.logger.error('Error wearing item:', error);
      return { success: false, message: 'Failed to wear item.' };
    }
  }

  /**
   * Remove specific item
   */
  async removeItem(itemId) {
    try {
      const currentOutfit = await this.getCurrentOutfit();
      const newOutfit = currentOutfit.filter(item => item.id !== itemId);

      await this.bot.outfit.change(newOutfit);
      return { success: true, message: `Removed item: ${itemId}` };
    } catch (error) {
      this.logger.error('Error removing item:', error);
      return { success: false, message: 'Failed to remove item.' };
    }
  }

  /**
   * Buy item from shop
   */
  async buyItem(itemId) {
    try {
      await this.bot.items.buy(itemId);
      return { success: true, message: `Bought item: ${itemId}` };
    } catch (error) {
      this.logger.error('Error buying item:', error);
      return { success: false, message: 'Failed to buy item. It may not be available or you lack funds.' };
    }
  }

  /**
   * Get bot's inventory
   */
  async getInventory() {
    try {
      return await this.bot.inventory.get();
    } catch (error) {
      this.logger.error('Error getting inventory:', error);
      return [];
    }
  }

  /**
   * Clear outfit (set to default)
   */
  async clearOutfit() {
    try {
      await this.bot.outfit.change('default');
      return { success: true, message: 'Outfit cleared to default!' };
    } catch (error) {
      this.logger.error('Error clearing outfit:', error);
      return { success: false, message: 'Failed to clear outfit.' };
    }
  }

  /**
   * Apply random outfit from saved outfits
   */
  async randomOutfit() {
    try {
      const outfits = this.getSavedOutfits();
      
      if (outfits.length === 0) {
        return { success: false, message: 'No saved outfits available.' };
      }

      const randomName = outfits[Math.floor(Math.random() * outfits.length)];
      return await this.loadOutfit(randomName);
    } catch (error) {
      this.logger.error('Error applying random outfit:', error);
      return { success: false, message: 'Failed to apply random outfit.' };
    }
  }

  /**
   * Search items in inventory
   */
  async searchItems(query) {
    try {
      const inventory = await this.getInventory();
      const results = inventory.filter(item => 
        item.id.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        items: results,
        count: results.length
      };
    } catch (error) {
      this.logger.error('Error searching items:', error);
      return { success: false, items: [], count: 0 };
    }
  }

  /**
   * Get outfit categories
   */
  categorizeOutfit(outfit) {
    const categories = {
      body: [],
      hair: [],
      face: [],
      clothing: [],
      accessories: []
    };

    for (const item of outfit) {
      const id = item.id.toLowerCase();
      
      if (id.includes('body')) categories.body.push(item);
      else if (id.includes('hair')) categories.hair.push(item);
      else if (id.includes('eye') || id.includes('mouth') || id.includes('nose') || id.includes('eyebrow')) {
        categories.face.push(item);
      }
      else if (id.includes('shirt') || id.includes('pants') || id.includes('shoes') || id.includes('sock')) {
        categories.clothing.push(item);
      }
      else categories.accessories.push(item);
    }

    return categories;
  }

  /**
   * Delete saved outfit
   */
  deleteOutfit(name) {
    const deleted = this.db.delete('saved_outfits', name.toLowerCase());
    
    if (deleted) {
      return { success: true, message: `Deleted outfit "${name}"!` };
    }
    
    return { success: false, message: `Outfit "${name}" not found.` };
  }
}

module.exports = OutfitSystem;
