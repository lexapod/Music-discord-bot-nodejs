
import type { playerDiscordBot } from "../playerDiscordBot";

import type { mapPlayers } from "../index";

export async function stop(player: playerDiscordBot, mapPlayers: mapPlayers) {
	await player.stop();
	await player.disconect();
	mapPlayers.delete(player.guildID);
}