import type { Message } from "discord.js";
import type { playerDiscordBot } from "../playerDiscordBot/playerDiscordBot";

import { botReplys } from "../consts/botReplys";

export async function skip(player: playerDiscordBot, message: Message) {
	if (player.queue.length < 0)
		return await message.channel.send(botReplys.nothingToSkip);
	await player.skip();
	return await message.reply(botReplys.skippedTrack(player.queue.length));
}