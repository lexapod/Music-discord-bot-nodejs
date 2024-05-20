import type { playerDiscordBot } from "../player-discord-bot/plater-discord-bot";
import type { mapPlayers } from "../index";

export async function stop(player: playerDiscordBot, mapPlayers: mapPlayers) {
  await player.stop();
  await player.disconect();
  mapPlayers.delete(player.guildID);
}
