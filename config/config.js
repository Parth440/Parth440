/**
 * Bot Configuration
 * Central configuration file for all bot settings
 */

module.exports = {
  // Bot Credentials
  BOT_TOKEN: process.env.BOT_TOKEN || '6e91b26b83500065fd2639450eefda292e84e6edf5e74a4c49b1c9162ef18411',
  ROOM_ID: process.env.ROOM_ID || '68ff9d9ebce6b518cf614a6c',
  
  // Bot Settings
  BOT_NAME: process.env.BOT_NAME || 'HighriseBot',
  AUTO_RECONNECT: process.env.AUTO_RECONNECT !== 'false',
  DEBUG_MODE: process.env.DEBUG_MODE === 'true',
  
  // Feature Toggles
  ENABLE_AUTO_EMOTE: process.env.ENABLE_AUTO_EMOTE !== 'false',
  ENABLE_AUTO_WELCOME: process.env.ENABLE_AUTO_WELCOME !== 'false',
  ENABLE_AUTO_PROMOTION: process.env.ENABLE_AUTO_PROMOTION !== 'false',
  ENABLE_AI_CHAT: process.env.ENABLE_AI_CHAT !== 'false',
  ENABLE_CLICK_TELEPORT: process.env.ENABLE_CLICK_TELEPORT !== 'false',
  
  // Timing Settings (in milliseconds)
  AUTO_EMOTE_INTERVAL: parseInt(process.env.AUTO_EMOTE_INTERVAL) || 15000, // 15 seconds
  AUTO_INVITE_INTERVAL: parseInt(process.env.AUTO_INVITE_INTERVAL) || 7200000, // 2 hours
  AUTO_PROMOTION_INTERVAL: parseInt(process.env.AUTO_PROMOTION_INTERVAL) || 1800000, // 30 minutes
  
  // Economy Settings
  DAILY_REWARD_AMOUNT: parseInt(process.env.DAILY_REWARD_AMOUNT) || 100,
  XP_PER_MESSAGE: parseInt(process.env.XP_PER_MESSAGE) || 5,
  XP_PER_MINUTE: parseInt(process.env.XP_PER_MINUTE) || 2,
  
  // Click Teleport Settings
  MIN_TELEPORT_DISTANCE: 4, // Minimum 4 tiles distance
  
  // Command Prefixes
  COMMAND_PREFIXES: ['!', '/', '-'],
  
  // Permission Levels
  PERMISSION_LEVELS: {
    USER: 0,
    VIP: 1,
    MOD: 2,
    OWNER: 3
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    MESSAGES_PER_MINUTE: 10,
    COMMANDS_PER_MINUTE: 5
  },
  
  // Moderation Settings
  AUTO_KICK_ON_SPAM: true,
  SPAM_THRESHOLD: 5, // messages in 10 seconds
  
  // Emote Settings
  EMOTE_LOOP_ENABLED: true,
  EMOTE_PAUSE_ON_WALK: true,
  
  // Database Settings
  DATABASE_PATH: './database',
  AUTO_SAVE_INTERVAL: 60000, // 1 minute
  
  // Logging Settings
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_TO_FILE: true,
  LOG_FILE_PATH: './logs',
  
  // AI Chat Settings
  AI_RESPONSE_DELAY: 1000, // 1 second delay before responding
  AI_MAX_CONTEXT_LENGTH: 10, // Remember last 10 messages
  
  // Giveaway Settings
  GIVEAWAY_MIN_DURATION: 60000, // 1 minute
  GIVEAWAY_MAX_DURATION: 3600000, // 1 hour
  
  // Colors for console output
  COLORS: {
    SUCCESS: 'green',
    ERROR: 'red',
    WARNING: 'yellow',
    INFO: 'cyan',
    CHAT: 'white',
    DM: 'magenta',
    JOIN: 'green',
    LEAVE: 'red'
  }
};
