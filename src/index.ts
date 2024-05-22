import type { Message, VoiceState } from "discord.js";
import type { playerDiscordBot } from "./player-discord-bot/player-discord-bot";

import { GatewayIntentBits, Client } from "discord.js";
import play from "play-dl";

import { prefix } from "./consts/prefix";
import config from "../config.json";

const COOKIE: string = config.COOCKIEFORYOUTUBE;
const TOKEN: string = config.DISCORDBOTTOKEN;

if (!(COOKIE && TOKEN)) {
  throw new TypeError("Config.json. Please insert COOKIE Netscape or Tokens");
}

import { checkStatusbot } from "./voice-status/check-status-voice";
import { handleCommands } from "./handler-commands/handler-commands";

import { botReplys } from "./consts/bot-replys";

export type mapPlayers = Map<string, playerDiscordBot>;
const mapPlayers = new Map<string, playerDiscordBot>();

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

// @ts-ignore
client.on("messageCreate", async (message: Message) => {
  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    !message.guild?.id
  )
    return;

  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel)
    return await message.channel.send(botReplys.userNotInVoice);

  const player = mapPlayers.get(message.guild.id);

  await handleCommands(player, message, mapPlayers, client).catch((e) =>
    console.log(e)
  );
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
