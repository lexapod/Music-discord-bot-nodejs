import type { Message } from "discord.js";
import type { playerDiscordBot } from "../player-discord-bot/player-discord-bot";
import type {
  Command,
  CommandExecuteArgs,
} from "../handler-commands/handler-commands";

import { AudioPlayerStatus } from "@discordjs/voice";
import { botReplys } from "../consts/bot-replys";

export const pauseCommand: Command = {
  name: "pause",
  description: "pause",
  execute: async ({ player, message }: CommandExecuteArgs) => {
    if (!player) {
      await message.channel.send(botReplys.playerNotPlaying);
      return;
    }
    await pause(player, message);
  },
};

async function pause(player: playerDiscordBot, message: Message) {
  if (player.Audioplayer.state.status === AudioPlayerStatus.Paused) {
    return await message.channel.send(botReplys.musicSteelPaused);
  }

  if (player.Audioplayer.state.status === AudioPlayerStatus.Playing) {
    await player.pause();
    return await message.channel.send(botReplys.trackOnPause);
  }
}
