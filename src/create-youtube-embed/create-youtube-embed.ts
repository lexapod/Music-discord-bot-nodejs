import type { Embed } from "discord.js";

import ytdl from "ytdl-core-discord";

import config from "../../config.json";

const COOKIE: string = config.COOCKIEFORYOUTUBE;

if (!COOKIE) {
  throw new TypeError("Config.json please insert COOKIE ");
}
export async function createYoutubeEmbed(
  videoUrl: string,
  text: string,
  length: number
): Promise<Embed> {
  const videoInfo = await ytdl.getBasicInfo(videoUrl, {
    requestOptions: {
      headers: {
        cookie: COOKIE,
        // Optional. If not given, ytdl-core will try to find it.
        // You can find this by going to a video's watch page, viewing the source,
        // and searching for "ID_TOKEN".
        // 'x-youtube-identity-token': 1324,
      },
    },
  });

  const videoThumbnail: string = // @ts-ignore
    videoInfo.player_response.videoDetails.thumbnail.thumbnails[3].url;
  // @ts-ignore
  const seconds: string = new Date(videoInfo?.videoDetails.lengthSeconds * 1000)
    .toUTCString()
    .split(/ /)[4];

  let description: string = videoInfo?.videoDetails.description || "хуета";

  if (description.length > 4080) {
    description = description.substr(0, 4080);
  }

  // @ts-ignore
  const embed: Embed = new Discord.EmbedBuilder()
    .setTitle(text)
    .addFields(
      {
        name: "Название трека:",
        value: videoInfo?.videoDetails.title || "Хуета",
      },
      { name: "\u200B", value: "\u200B" },
      { name: "Длина", value: `${seconds}` || "Хуета", inline: true },
      { name: "Треков в очереди", value: String(length), inline: true }
    )
    .setURL(videoUrl)
    .setImage(videoThumbnail)
    .setDescription(description);

  return embed;
}
