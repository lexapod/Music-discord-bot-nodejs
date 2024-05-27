import type { Message } from "discord.js";
import type { mapPlayers, mapQueueSmart } from "../index";
import type {
  Command,
  CommandExecuteArgs,
} from "../handler-commands/handler-commands";

import { EmbedBuilder } from "discord.js";
import play from "play-dl";
import { botReplys } from "../consts/bot-replys";
import { Pagination } from "../pagination/pagination-ds";

export const searchCommand: Command = {
  name: "search",
  description: "search video in Youtube",
  execute: async ({
    message,
    mapPlayers,
    mapQueueSmart,
  }: CommandExecuteArgs) => {
    await search(message, mapPlayers, mapQueueSmart);
  },
};

async function search(
  message: Message,
  mapPlayers: mapPlayers,
  mapQueueSmart: mapQueueSmart
) {
  const query: string = message.content.split("search ")[1];
  if (!query) {
    return await message.reply(botReplys.wrongUrlProvided);
  }

  const arrayYoutubeVideos = await play.search(query);
  const embeds = arrayYoutubeVideos.map((x) => {
    return new EmbedBuilder()
      .setColor("Random")
      .addFields([
        {
          name: "Name",
          value: `${x?.title} ${x?.channel} ${x?.likes}`,
        },
        {
          name: "Description",
          value: `${x?.description} ${x?.channel}`,
        },
        {
          name: "Url",
          value: x.url,
        },
        {
          name: "Time",
          value: x.durationRaw,
        },
      ])

      .setThumbnail(x?.thumbnails[0].url);
  });

  const x = new Pagination(message, embeds);
  await x.createEmbeds(mapQueueSmart);
}
