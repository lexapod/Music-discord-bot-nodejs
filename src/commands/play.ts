import type { Message } from "discord.js";

import type { EventEmitter } from "node:events";
import { botReplys } from '../consts/botReplys';

export async function play(
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
		return await message.reply(botReplys.wrongUrlProvided);
	}
}