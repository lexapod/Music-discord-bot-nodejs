import type { Message, VoiceState } from "discord.js";
import type { playerDiscordBot } from "./player-discord-bot/plater-discord-bot";

import { GatewayIntentBits, Client } from "discord.js";
import play from "play-dl";

import config from "../config.json";

const COOKIE: string = config.COOCKIEFORYOUTUBE;
const TOKEN: string = config.DISCORDBOTTOKEN;

if (!(COOKIE && TOKEN)) {
  throw new TypeError("Config.json. Please insert COOKIE Netscape or Tokens");
}

import { checkStatusbot } from "./voice-status/check-status-voice";
import { handleCommands } from "./handler-commands/handler-commands";

import { botReplys } from "./consts/bot-replys";
import { commandList } from "./consts/command-list";

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
  if (message.author.bot || !message.guild?.id) return;
  //i think it's happened never but type ts say it's optional

  const isPlay = message.content.startsWith("?play");

  if (commandList.includes(message.content) || !isPlay) {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel)
      return await message.channel.send(botReplys.userNotInVoice);
  }

  const player = mapPlayers.get(message.guild.id);

  if (!player && !isPlay) {
    return await message.channel.send(botReplys.playerNotPlaying);
  }

  await handleCommands(player, message, mapPlayers, client);
});

client.on(
  "voiceStateUpdate",
  async (oldState: VoiceState, newState: VoiceState) => {
    await checkStatusbot(oldState, newState, mapPlayers);
  }
);

client.on("ready", () => {
  console.log(`We have logged in as ${client?.user?.tag}!`);
});

client.login(TOKEN);
