/**
 * Highrise Bot - Complete Implementation
 * Main Entry Point
 * 
 * Features:
 * - 279 Emotes with looping
 * - Outfit copy system
 * - Click teleport
 * - AI Chat in DM
 * - Economy system
 * - Moderation tools
 * - Auto invite system
 * - And 100+ more features
 */

require('colors');
const { Highrise, Events } = require('highrise.sdk');
const config = require('./config/config');
const Database = require('./utils/database');
const Logger = require('./utils/logger');

// Import all handlers
const MessageHandler = require('./handlers/messageHandler');
const DMHandler = require('./handlers/dmHandler');
const JoinHandler = require('./handlers/joinHandler');
const LeaveHandler = require('./handlers/leaveHandler');
const MovementHandler = require('./handlers/movementHandler');

// Import all features
const EmoteSystem = require('./features/emoteSystem');
const OutfitSystem = require('./features/outfitSystem');
const ClickTeleport = require('./features/clickTeleport');
const AutoInvite = require('./features/autoInvite');
const PermissionSystem = require('./features/permissionSystem');
const EconomySystem = require('./features/economySystem');
const ModerationSystem = require('./features/moderationSystem');
const TrackingSystem = require('./features/trackingSystem');

// Initialize bot instance
const bot = new Highrise({
  Events: [
    Events.Messages,
    Events.Joins,
    Events.Leaves,
    Events.DirectMessages,
    Events.Movements
  ],
  AutoFetchMessages: true,
  Cache: true
});

// Initialize database
const db = new Database();

// Initialize logger
const logger = new Logger();

// Initialize all systems
let emoteSystem, outfitSystem, clickTeleport, autoInvite;
let permissionSystem, economySystem, moderationSystem, trackingSystem;

/**
 * Bot Ready Event
 * Triggered when bot successfully connects to the room
 */
bot.on('ready', async (session) => {
  logger.success(`Bot is now online in ${session.room_info.room_name}`);
  logger.info(`Room ID: ${session.room_info.room_id}`);
  logger.info(`Bot ID: ${bot.info.user.id}`);
  logger.info(`Owner ID: ${bot.info.owner.id}`);
  
  // Initialize all feature systems
  try {
    emoteSystem = new EmoteSystem(bot, db, logger);
    outfitSystem = new OutfitSystem(bot, db, logger);
    clickTeleport = new ClickTeleport(bot, db, logger);
    autoInvite = new AutoInvite(bot, db, logger);
    permissionSystem = new PermissionSystem(bot, db, logger);
    economySystem = new EconomySystem(bot, db, logger);
    moderationSystem = new ModerationSystem(bot, db, logger);
    trackingSystem = new TrackingSystem(bot, db, logger);
    
    logger.success('All systems initialized successfully');
    
    // Start auto features
    if (config.ENABLE_AUTO_EMOTE) {
      emoteSystem.startAutoEmote();
    }
    
    if (config.ENABLE_AUTO_PROMOTION) {
      startAutoPromotion();
    }
    
    // Start auto invite system
    autoInvite.startAutoInvite();
    
  } catch (error) {
    logger.error('Error initializing systems:', error);
  }
});

/**
 * Chat Message Event
 * Handles all public chat messages
 */
bot.on('chatCreate', async (user, message) => {
  try {
    logger.chat(`${user.username}: ${message}`);
    
    // Track user activity
    if (trackingSystem) {
      await trackingSystem.trackMessage(user);
    }
    
    // Handle the message
    const messageHandler = new MessageHandler(bot, db, logger, {
      emoteSystem,
      outfitSystem,
      clickTeleport,
      permissionSystem,
      economySystem,
      moderationSystem,
      trackingSystem
    });
    
    await messageHandler.handle(user, message);
    
  } catch (error) {
    logger.error('Error handling chat message:', error);
  }
});

/**
 * Direct Message Event
 * Handles all DM messages
 */
bot.on('messageCreate', async (user_id, data, message) => {
  try {
    logger.dm(`DM from ${user_id}: ${message}`);
    
    // Handle DM
    const dmHandler = new DMHandler(bot, db, logger, {
      permissionSystem,
      economySystem
    });
    
    await dmHandler.handle(user_id, data, message);
    
  } catch (error) {
    logger.error('Error handling DM:', error);
  }
});

/**
 * Player Join Event
 * Triggered when a player joins the room
 */
bot.on('playerJoin', async (user) => {
  try {
    logger.join(`${user.username} joined the room`);
    
    // Handle join
    const joinHandler = new JoinHandler(bot, db, logger, {
      trackingSystem,
      autoInvite
    });
    
    await joinHandler.handle(user);
    
    // Send heart reaction
    setTimeout(() => {
      bot.player.reaction(user.id, 'heart').catch(e => {
        logger.error('Error sending reaction:', e);
      });
    }, 1000);
    
    // Send welcome message if enabled
    if (config.ENABLE_AUTO_WELCOME) {
      const greeting = db.get('settings', 'greeting') || 
        `Welcome @${user.username}! 🎉 Type !help for commands`;
      
      setTimeout(() => {
        bot.message.send(greeting).catch(e => {
          logger.error('Error sending welcome:', e);
        });
      }, 2000);
    }
    
  } catch (error) {
    logger.error('Error handling player join:', error);
  }
});

/**
 * Player Leave Event
 * Triggered when a player leaves the room
 */
bot.on('playerLeave', async (user) => {
  try {
    logger.leave(`${user.username} left the room`);
    
    // Handle leave
    const leaveHandler = new LeaveHandler(bot, db, logger, {
      trackingSystem
    });
    
    await leaveHandler.handle(user);
    
    // Send goodbye message
    const goodbye = `Thank you for visiting, @${user.username}! 👋`;
    bot.message.send(goodbye).catch(e => {
      logger.error('Error sending goodbye:', e);
    });
    
  } catch (error) {
    logger.error('Error handling player leave:', error);
  }
});

/**
 * Player Movement Event
 * Tracks player movements for click teleport feature
 */
bot.on('playerMovement', async (user, position) => {
  try {
    // Handle movement for click teleport
    if (clickTeleport && config.ENABLE_CLICK_TELEPORT) {
      await clickTeleport.handleMovement(user, position);
    }
    
    // Handle emote pause/resume on walk
    if (emoteSystem) {
      await emoteSystem.handleWalkDetection(user, position);
    }
    
  } catch (error) {
    logger.error('Error handling player movement:', error);
  }
});

/**
 * Auto Promotion System
 * Sends room promotion messages every 30 minutes
 */
function startAutoPromotion() {
  setInterval(() => {
    const promotions = [
      '🎮 Join our amazing community! Type !help to see all commands!',
      '✨ Enjoying the room? Invite your friends with !invite!',
      '🎁 Daily rewards available! Type !daily to claim yours!',
      '🎪 Check out our 279 emotes! Type !emotelist to see all!',
      '💎 Earn coins by being active! Type !mycoins to check balance!'
    ];
    
    const randomPromo = promotions[Math.floor(Math.random() * promotions.length)];
    bot.message.send(randomPromo).catch(e => {
      logger.error('Error sending promotion:', e);
    });
  }, config.AUTO_PROMOTION_INTERVAL);
  
  logger.info('Auto promotion system started');
}

/**
 * Error Handling
 * Catches unhandled errors to prevent crashes
 */
process.on('unhandledRejection', async (err, promise) => {
  logger.error(`Unhandled Rejection: ${err}`);
  console.error(promise);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err}`);
  console.error(err.stack);
});

/**
 * Graceful Shutdown
 * Saves data before exit
 */
process.on('SIGINT', () => {
  logger.warn('Shutting down gracefully...');
  db.saveAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.warn('Shutting down gracefully...');
  db.saveAll();
  process.exit(0);
});

// Login to the room
logger.info('Starting bot...');
bot.login(config.BOT_TOKEN, config.ROOM_ID);
