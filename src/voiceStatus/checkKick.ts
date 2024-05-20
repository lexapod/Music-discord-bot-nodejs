import type { VoiceState } from "discord.js";
import type{ playerDiscordBot } from "../playerDiscordBot";

import { botReplys } from "../consts/botReplys";

type mapPlayers = Map<string, playerDiscordBot>;

export async function checkKick(
	player: playerDiscordBot,
	oldState: VoiceState,
	newState: VoiceState,
    mapPlayers:mapPlayers
) {
	if (oldState.channelId && !newState.channelId) {
		console.log("Bot has been kicked from voice channel.");
		await player.disconect();
		await player.sendSimpleAlert(botReplys.goodbye);
		mapPlayers.delete(oldState.guild.id);
		console.log("success clear");
	}
}
