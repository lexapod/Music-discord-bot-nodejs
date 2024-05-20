import type { VoiceState } from "discord.js";
import type {mapPlayers} from '../index'

import { checkKick } from "./checkKick";
import { checkMute } from "./checkMute";

export async function checkStatusbot(
	oldState: VoiceState,
	newState: VoiceState,
	mapPlayers: mapPlayers,
) {
	if (oldState?.member?.user.bot) {
		
		const player = mapPlayers.get(oldState.guild.id);

		if (!player) return;

		await checkMute(player, oldState, newState);
		await checkKick(player, oldState, newState, mapPlayers);
	}
}