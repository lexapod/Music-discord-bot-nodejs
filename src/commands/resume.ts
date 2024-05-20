import type { Message } from "discord.js";
import type { playerDiscordBot } from "../playerDiscordBot";
import { AudioPlayerStatus } from "@discordjs/voice";

export async function resume(player: playerDiscordBot, message: Message) {
	if (player.Audioplayer.state.status === AudioPlayerStatus.Playing) {
		return await message.channel.send("Музыка и так играет");
	}
	player.unpause();
	return await message.channel.send("Продолжаем бал");
}