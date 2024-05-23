import type { AudioResource } from "@discordjs/voice";
import type { DiscordAlertChannel } from "../discord-alert/discord-alert";
type youtubeInfo = {
  url: string;
  resource: AudioResource | undefined;
  failed?: boolean;
};

import EventEmitter from "node:events";
import { downloadResources } from "../download-resources/download-resources";
import { botReplys } from "../consts/bot-replys";

type queueYoutube = youtubeInfo[];

export class queueSmart {
  queue: queueYoutube;
  queueTemp: string[];
  downloadEvent: EventEmitter;
  isDownloding: boolean;
  cacheSize: number;
  DiscordAlertChannel: DiscordAlertChannel;
  constructor(DiscordAlertChannel: DiscordAlertChannel, cacheSize = 4) {
    this.queue = [];
    this.queueTemp = [];
    this.downloadEvent = new EventEmitter();
    this.isDownloding = false;
    this.DiscordAlertChannel = DiscordAlertChannel;
    this.cacheSize = cacheSize;
    this.registerDownloadEvent();
  }
  getCurrentLength() {
    return this.queue.length + this.queueTemp.length;
  }
  async registerDownloadEvent() {
    this.downloadEvent.on("newMusic", async () => {
      if (this.isDownloding) return;
      this.isDownloding = true;

      const url = this.queueTemp.shift();
      if (url) {
        const resource =
          this.queue.length < this.cacheSize
            ? await downloadResources(url)
            : undefined;

        this.queue.push({ url, resource });
        await this.DiscordAlertChannel.sendAlertInchat(
          botReplys.trackAddedSuccess,
          url,
          this.queue.length
        );
      }
      this.isDownloding = false;

      if (this.queueTemp.length !== 0) {
        this.downloadEvent.emit("newMusic");
      }
    });
  }
  async addMusic(url: string) {
    this.queueTemp.push(url);
    this.downloadEvent.emit("newMusic");
  }
  async checkCache() {
    if (
      this.queue.length >= this.cacheSize &&
      this.queue[this.cacheSize - 1]?.resource === undefined &&
      this.queue[this.cacheSize - 1]?.url
    ) {
      console.log("Do cache");
      this.queue[this.cacheSize - 1].resource = await downloadResources(
        this.queue[this.cacheSize - 1].url
      );
    }
  }
  async getMusic(): Promise<youtubeInfo | undefined> {
    const music = this.queue.shift();
    //for debug
    console.log(this.queue);

    this.checkCache();
    if (music?.url && !music?.resource) {
      console.log("Didnt get cache make download now");
      const resource = await downloadResources(music.url);
      if (resource) {
        music.resource = resource;
      } else {
        //failed download audio need skip this shit
        music.failed = true;
      }
    }

    return music;
  }
  clearQueue() {
    this.queueTemp = [];
    this.queue = [];
  }
}
