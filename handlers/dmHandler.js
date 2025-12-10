/**
 * DM Handler
 * Handles all direct messages with AI chat
 */

class DMHandler {
  constructor(bot, db, logger, systems) {
    this.bot = bot;
    this.db = db;
    this.logger = logger;
    this.systems = systems;
  }

  /**
   * Handle incoming DM
   */
  async handle(user_id, data, message) {
    const lowerMessage = message.toLowerCase().trim();

    // Check if first time DM
    const dmHistory = this.db.get('dm_memory', user_id) || [];
    
    if (dmHistory.length === 0 && ['hi', 'hii', 'hello', 'hey'].includes(lowerMessage)) {
      await this.sendWelcomeMessage(data.id);
    } else {
      await this.handleAIChat(user_id, data.id, message);
    }

    // Save message to history
    dmHistory.push({
      message: message,
      timestamp: Date.now(),
      from: 'user'
    });
    
    // Keep only last 10 messages
    if (dmHistory.length > 10) {
      dmHistory.shift();
    }
    
    this.db.set('dm_memory', user_id, dmHistory);
  }

  /**
   * Send welcome message with all commands
   */
  async sendWelcomeMessage(conversationId) {
    const welcomeMessage = `
👋 Welcome! I'm the Highrise Bot!

Here are all my features and commands:

🎭 **EMOTE SYSTEM (279 Emotes)**
• Type any number (1-279) or emote name
• !emotelist - See all emotes
• !stop or 0 - Stop emote
• Emotes pause when walking, resume when stopped!

👔 **OUTFIT SYSTEM**
• !copy - Copy your outfit (Mod/Owner only)
• !wear <itemId> - Wear item (Owner only)
• !save <name> - Save outfit (Owner only)
• !load <name> - Load outfit (Owner only)
• !random - Random outfit (Owner only)

💰 **ECONOMY SYSTEM**
• !mycoins - Check your balance
• !daily - Claim daily reward (100 coins)
• !transfer @user <amount> - Send coins
• !coinleaderboard - Top coin holders

📊 **TRACKING & STATS**
• !mytime - Your time and level
• !leaderboard - Top XP users
• !topusers - Most active today
• Earn XP by chatting and being active!

🛡️ **MOD COMMANDS** (Mod/Owner only)
• !kick @user - Kick user
• !ban @user [duration] - Ban user
• !mute @user [duration] - Mute user
• !summon @user - Teleport user to you
• !copy - Copy user outfit

👑 **OWNER COMMANDS**
• !mod @user - Make moderator
• !own @user - Make owner
• !vip @user - Make VIP
• !fixhome - Save bot position
• !home - Return to saved position

🔧 **UTILITY**
• !help - Show commands
• !ping - Check if bot is online
• !whereami - Your current position

✨ **SPECIAL FEATURES**
• Auto welcome on join
• Heart reaction on entry
• Click teleport (4+ tiles)
• Auto room invites every 2 hours
• Level up notifications
• And much more!

Type !help in the room for more info!
    `.trim();

    try {
      await this.bot.direct.send(conversationId, welcomeMessage);
    } catch (error) {
      this.logger.error('Error sending welcome message:', error);
    }
  }

  /**
   * Handle AI chat response
   */
  async handleAIChat(user_id, conversationId, message) {
    // Get conversation history
    const history = this.db.get('dm_memory', user_id) || [];
    
    // Generate AI response based on message
    let response = this.generateResponse(message, history);

    try {
      await this.bot.direct.send(conversationId, response);
      
      // Save bot response to history
      history.push({
        message: response,
        timestamp: Date.now(),
        from: 'bot'
      });
      
      this.db.set('dm_memory', user_id, history);
    } catch (error) {
      this.logger.error('Error sending DM response:', error);
    }
  }

  /**
   * Generate AI-like response
   */
  generateResponse(message, history) {
    const lowerMessage = message.toLowerCase();

    // Greetings
    if (['hi', 'hello', 'hey', 'hii'].some(g => lowerMessage.includes(g))) {
      return '👋 Hello! How can I help you today? Type "help" for commands!';
    }

    // Help requests
    if (lowerMessage.includes('help') || lowerMessage.includes('command')) {
      return '📋 Type !help in the room to see all commands! Or ask me about specific features like "emotes", "economy", or "stats".';
    }

    // Emote questions
    if (lowerMessage.includes('emote')) {
      return '🎭 I have 279 emotes! Just type a number (1-279) or emote name in the room. Type !emotelist to see all. Emotes loop automatically and pause when you walk!';
    }

    // Economy questions
    if (lowerMessage.includes('coin') || lowerMessage.includes('money') || lowerMessage.includes('daily')) {
      return '💰 Use !mycoins to check balance, !daily to claim daily reward (100 coins), and !transfer to send coins to others!';
    }

    // Stats questions
    if (lowerMessage.includes('level') || lowerMessage.includes('xp') || lowerMessage.includes('stat')) {
      return '📊 Use !mytime to see your stats! You earn XP by chatting and being active. Level up to unlock rewards!';
    }

    // Outfit questions
    if (lowerMessage.includes('outfit') || lowerMessage.includes('copy') || lowerMessage.includes('wear')) {
      return '👔 Mods and owners can use !copy to copy your outfit! Owners can also use !wear, !save, and !load for outfit management.';
    }

    // Thanks
    if (lowerMessage.includes('thank') || lowerMessage.includes('thx')) {
      return '😊 You\'re welcome! Happy to help!';
    }

    // Goodbye
    if (lowerMessage.includes('bye') || lowerMessage.includes('see you')) {
      return '👋 Goodbye! Come back anytime!';
    }

    // Default responses
    const defaultResponses = [
      '🤔 Interesting! Tell me more or type "help" for commands.',
      '💭 I see! Is there anything specific you\'d like to know about?',
      '✨ That\'s cool! Need help with any bot features?',
      '🎮 Nice! Want to know about emotes, economy, or stats?',
      '😊 Got it! Type "help" if you need assistance with commands.'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
}

module.exports = DMHandler;
