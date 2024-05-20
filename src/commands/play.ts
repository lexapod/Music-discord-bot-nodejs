import type { Client, Message } from "discord.js";
import type { mapPlayers } from "../index";

import { botReplys } from "../consts/botReplys";
import { newMusic } from "../newMusic/newMusic";

export async function play(
	message: Message,
	mapPlayers: mapPlayers,
	client: Client,
) {
	try {
		const YoutubeURL: string = message.content.split("play ")[1];
		if (!YoutubeURL) {
			throw new Error("Url not found");
		}
		// message, YoutubeURL
		await newMusic(message, YoutubeURL, mapPlayers, client);
	} catch (e) {
		console.log(e);
		return await message.reply(botReplys.wrongUrlProvided);
	}
}