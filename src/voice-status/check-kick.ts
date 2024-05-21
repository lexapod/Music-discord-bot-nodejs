import type { VoiceState } from "discord.js";
import type { playerDiscordBot } from "../player-discord-bot/player-discord-bot";
import type { mapPlayers } from "../index";

import { botReplys } from "../consts/bot-replys";

export async function checkKick(
  player: playerDiscordBot,
  oldState: VoiceState,
  newState: VoiceState,
  mapPlayers: mapPlayers
) {
  if (oldState.channelId && !newState.channelId) {
    console.log("Bot has been kicked from voice channel.");
    await player.disconect();
    await player.sendSimpleAlert(botReplys.goodbye);
    mapPlayers.delete(oldState.guild.id);
    console.log("success clear");
  }
}
