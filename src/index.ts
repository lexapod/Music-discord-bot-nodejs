import type { Message, VoiceState } from "discord.js";
import type { playerDiscordBot } from "./player-discord-bot/player-discord-bot";
import type { queueSmart } from "./queue-smart/queue-smart";

import { GatewayIntentBits, Client } from "discord.js";
import play from "play-dl";
import { prefix } from "./consts/prefix";
import { checkStatusbot } from "./voice-status/check-status-voice";
import { handleCommands } from "./handler-commands/handler-commands";
import { botReplys } from "./consts/bot-replys";

import config from "../config.json";

const COOKIE: string = config.COOCKIEFORYOUTUBE;
const TOKEN: string = config.DISCORDBOTTOKEN;

if (!(COOKIE && TOKEN)) {
  throw new TypeError("Config.json. Please insert COOKIE Netscape or Tokens");
}

export type mapPlayers = Map<string, playerDiscordBot>;
const mapPlayers = new Map<string, playerDiscordBot>();

export type mapQueueSmart = Map<string, queueSmart>;
const mapQueueSmart = new Map<string, queueSmart>();

play.setToken({
  youtube: {
    cookie: COOKIE,
  },
});

const client = new Client({
  intents: [
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    // GatewayIntentBits.GuildAuditLogs,
  ],
  // partials: ["CHANNEL", "MESSAGE"],
});

client.on("messageCreate", async (message: Message) => {
  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    !message.guild?.id
  )
    return;

  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) {
    await message.channel.send(botReplys.userNotInVoice);
    return;
  }

  const player = mapPlayers.get(message.guild.id);

  await handleCommands(
    player,
    message,
    mapPlayers,
    client,
    mapQueueSmart
  ).catch((e) => console.log(e));
});

client.on(
  "voiceStateUpdate",
  async (oldState: VoiceState, newState: VoiceState) => {
    await checkStatusbot(oldState, newState, mapPlayers).catch((e) =>
      console.log(e)
    );
  }
);

client.on("ready", () => {
  console.log(`We have logged in as ${client?.user?.tag}!`);
});

client.login(TOKEN);
