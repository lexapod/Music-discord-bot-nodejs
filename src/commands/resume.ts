import type { Message } from "discord.js";
import type { playerDiscordBot } from "../player-discord-bot/player-discord-bot";
import type {
  Command,
  CommandExecuteArgs,
} from "../handler-commands/handler-commands";

import { AudioPlayerStatus } from "@discordjs/voice";

import { botReplys } from "../consts/bot-replys";

export const resumeCommand: Command = {
  name: "resume",
  description: "resume",
  execute: async ({ player, message }: CommandExecuteArgs) => {
    if (!player) {
      await message.channel.send(botReplys.playerNotPlaying);
      return;
    }
    await resume(player, message);
  },
};

async function resume(player: playerDiscordBot, message: Message) {
  if (player.Audioplayer.state.status === AudioPlayerStatus.Playing) {
    return await message.channel.send(botReplys.musicSteelPlaying);
  }
  player.unpause();
  return await message.channel.send(botReplys.musicResume);
}
