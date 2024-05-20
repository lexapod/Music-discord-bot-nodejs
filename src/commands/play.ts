import type { Message } from "discord.js";

import type { EventEmitter } from "node:events";

export async function playCommand(
	eventNewMusic: EventEmitter,
	message: Message,
) {
	try {
		const YoutubeURL: string = message.content.split("play ")[1];
		if (!YoutubeURL) {
			throw new Error("Url not found");
		}
		eventNewMusic.emit("newMusic", message, YoutubeURL);
	} catch (e) {
		console.log(e);
		return await message.reply("Попробуй подумать");
	}
}