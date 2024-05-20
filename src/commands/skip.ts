import type { Message } from "discord.js";
import type { playerDiscordBot } from "../playerDiscordBot";

export async function skip(player: playerDiscordBot, message: Message) {
	if (player.queue.length < 0)
		return await message.channel.send("Нехуй скипать");
	await player.skip();
	return await message.reply(
		`Скипнул хуйню\n${player.queue.length} Осталось треков`,
	);
}