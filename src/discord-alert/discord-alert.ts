import type { TextChannel } from "discord.js";
import type Discord from "discord.js";

import { botReplys } from "../consts/bot-replys";
import { createYoutubeEmbed } from "../utils/create-youtube-embed";

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
      console.log(error);
    }
  }
}
