import type { Message } from "discord.js";
import type { playerDiscordBot } from "../playerDiscordBot/playerDiscordBot";

import { AudioPlayerStatus } from "@discordjs/voice";
import { botReplys } from '../consts/botReplys';

export async function pause(player: playerDiscordBot, message: Message) {
	if (player.Audioplayer.state.status === AudioPlayerStatus.Paused) {
	}
	player.pause();
	return await message.channel.send(botReplys.trackOnPause);
}