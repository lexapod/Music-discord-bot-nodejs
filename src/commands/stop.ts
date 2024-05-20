
import type { playerDiscordBot } from "../playerDiscordBot";

type mapPlayers = Map<string, playerDiscordBot>;

export async function stop(player: playerDiscordBot, mapPlayers: mapPlayers) {
	await player.stop();
	await player.disconect();
	mapPlayers.delete(player.guildID);
}