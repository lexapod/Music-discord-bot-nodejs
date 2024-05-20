import type { Message } from "discord.js";
import type { playerDiscordBot } from "../playerDiscordBot";

import { AudioPlayerStatus } from "@discordjs/voice";

export async function pause(player: playerDiscordBot, message: Message) {
	if (player.Audioplayer.state.status === AudioPlayerStatus.Paused) {
	}
	player.pause();
	return message.channel.send("Трек на паузе");
}