import type { Message } from "discord.js";
import type { playerDiscordBot } from "../player-discord-bot/player-discord-bot";
import type {
  Command,
  CommandExecuteArgs,
} from "../handler-commands/handler-commands";

import { botReplys } from "../consts/bot-replys";
import { AudioPlayerStatus } from "@discordjs/voice";

export const skipCommand: Command = {
  name: "skip",
  description: "skip",
  execute: async ({ player, message }: CommandExecuteArgs) => {
    if (!player) {
      await message.channel.send(botReplys.playerNotPlaying);
      return;
    }
    await skip(player, message);
  },
};

async function skip(player: playerDiscordBot, message: Message) {
  if (player.Audioplayer.state.status === AudioPlayerStatus.Playing) {
    await player.skip();
    return await message.channel.send(
      botReplys.skippedTrack(player.queue.queue.length)
    );
  }

  return await message.channel.send(botReplys.icantSkipTrack);
}
