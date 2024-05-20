import type { VoiceState } from "discord.js";
import type { playerDiscordBot } from "../playerDiscordBot";
import { checkKick } from "./checkKick";
import { checkMute } from "./checkMute";
type mapPlayers = Map<string, playerDiscordBot>;

export async function checkStatusbot(
	oldState: VoiceState,
	newState: VoiceState,
	mapPlayers: mapPlayers,
) {
	if (oldState?.member?.user.bot) {
		//muted or not muted
		const player = mapPlayers.get(oldState.guild.id);

		if (!player) return;

		await checkMute(player, oldState, newState);
		await checkKick(player, oldState, newState, mapPlayers);
	}
}