import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type TextChannel,
  type Message,
  Embed,
} from "discord.js";
import type { mapPlayers, mapQueueSmart } from "../index";
import type {
  Command,
  CommandExecuteArgs,
} from "../handler-commands/handler-commands";

import { botReplys } from "../consts/bot-replys";
import { newMusic } from "../new-music/new-music";
import playY from "play-dl";
import { createYoutubeEmbed } from "../utils/create-youtube-embed";
import { Pagination } from "../pagination/pagination-ds";

export const searchCommand: Command = {
  name: "search",
  description: "search",
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

  const arrayYoutubeVideos = await playY.search(query);
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
          name: "url",
          value: `${x.url}`,
        },
        {
          name: "Time",
          value: `${x.durationRaw}`,
        },
      ])

      .setThumbnail(x?.thumbnails[0].url);
  });

  const x = new Pagination(message, embeds);
  await x.createEmbeds(mapQueueSmart);
}
