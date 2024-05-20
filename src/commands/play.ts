import type { Client, Message } from "discord.js";
import type { mapPlayers } from "../index";
import type {
  Command,
  CommandExecuteArgs,
} from "../handler-commands/handler-commands";

import { botReplys } from "../consts/bot-replys";
import { newMusic } from "../new-music/new-music";

export const playCommand: Command = {
  name: "play",
  description: "play",
  execute: async ({ message, mapPlayers, client }: CommandExecuteArgs) => {
    await play(message, mapPlayers, client);
  },
};

async function play(message: Message, mapPlayers: mapPlayers, client: Client) {
  try {
    const YoutubeURL: string = message.content.split("play ")[1];
    if (!YoutubeURL) {
      throw new Error("Url not found");
    }
    await newMusic(message, YoutubeURL, mapPlayers, client);
  } catch (e) {
    console.log(e);
    return await message.reply(botReplys.wrongUrlProvided);
  }
}
