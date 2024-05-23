import type { TextChannel } from "discord.js";
import type Discord from "discord.js";
import EventEmitter from "node:events";

import { botReplys } from "../consts/bot-replys";
import { createYoutubeEmbed } from "../create-youtube-embed/create-youtube-embed";

export class DiscordAlertChannel {
  channel: TextChannel;

  constructor(channel: TextChannel) {
    this.channel = channel;
  }
  private async sendInChat(message: string | { embeds: Discord.Embed[] }) {
    await this.channel.send(message);
  }
  async sendAlertInchat(text: string, youtubeUrl: string, length: number) {
    try {
      const embedYoutube = await createYoutubeEmbed(youtubeUrl, text, length);
      await this.sendInChat({ embeds: [embedYoutube] });
    } catch (error) {
      await this.sendSimpleAlert(botReplys.errorAddInQueue);
      console.log(error);
    }
  }
  async sendSimpleAlert(text: string) {
    try {
      await this.sendInChat(text);
    } catch (error) {
      //not sure
      await this.sendSimpleAlert(botReplys.errorAddInQueue);
      console.log(error);
    }
  }
}

// export function registerAlertEmitter(channel: TextChannel) {
//     const eventEmitter = new EventEmitter();
//     eventEmitter.on("alert", async (url: string, length: number) => {
//       try {
//         const embedYoutube = await createYoutubeEmbed(
//           url,
//           botReplys.trackAddedSuccess,
//           length
//         );
//         await channel.send({ embeds: [embedYoutube] });
//       } catch (error) {
//         await channel.send(botReplys.errorAddInQueue);
//       }
//     });
//     return eventEmitter;
//   }
