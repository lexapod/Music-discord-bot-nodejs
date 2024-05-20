import type { Message } from "discord.js";
import type { playerDiscordBot } from "../player-discord-bot/plater-discord-bot";

import { AudioPlayerStatus } from "@discordjs/voice";

import { botReplys } from "../consts/botReplys";

export async function resume(player: playerDiscordBot, message: Message) {
  if (player.Audioplayer.state.status === AudioPlayerStatus.Playing) {
    return await message.channel.send(botReplys.musicSteelPlaying);
  }
  player.unpause();
  return await message.channel.send(botReplys.musicResume);
}
