import type {
  AudioPlayer,
  AudioResource,
  VoiceConnection,
  VoiceConnectionState,
} from "@discordjs/voice";
import type { Client } from "discord.js";
import type Discord from "discord.js";

import { createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import play from "play-dl";

import { createYoutubeEmbed } from "../create-youtube-embed/create-youtube-embed";
import { botReplys } from "../consts/bot-replys";

type youtubeInfo = {
  url: string;
};

type queueYoutube = youtubeInfo[];

export class playerDiscordBot {
  guildID: string;
  voiceID: string;
  chatID: string;
  Audioplayer: AudioPlayer;
  VoiceConnection: VoiceConnection;
  queue: queueYoutube;
  client: Client;
  constructor(
    guildID: string,
    voiceID: string,
    chatID: string,
    Audioplayer: AudioPlayer,
    VoiceConnection: VoiceConnection,
    queue: queueYoutube,
    client: Client
  ) {
    this.guildID = guildID;
    this.voiceID = voiceID;
    this.chatID = chatID;
    this.Audioplayer = Audioplayer;
    this.VoiceConnection = VoiceConnection;
    this.queue = queue;
    this.client = client;
  }
  async addMusicInQueue(url: string) {
    this.queue.push({ url });
    await this.sendAlertInchat(botReplys.trackAddedSuccess, url);
  }
  async downloadResoreses(youtubeUrl: string): Promise<AudioResource<unknown>> {
    const stream = await play.stream(youtubeUrl);
    return createAudioResource(stream.stream, {
      inputType: stream.type,
    });
  }
  async play(youtubeUrl: string) {
    let resource: AudioResource | undefined;
    for (let i = 0; i < 3; i++) {
      try {
        resource = await this.downloadResoreses(youtubeUrl);
        break;
      } catch (error) {
        console.log(error);
      }
    }
    if (resource) {
      this.Audioplayer.play(resource);
    } else {
      throw new Error("Player can't play ");
    }
  }
  async stop() {
    this.queue = [];
    this.Audioplayer.stop();
  }
  async skip() {
    this.Audioplayer.stop();
  }
  async pause() {
    this.Audioplayer.pause();
  }
  async unpause() {
    this.Audioplayer.unpause();
  }
  async disconect() {
    try {
      this.queue = [];
      this.Audioplayer.off;
      this.Audioplayer.stop();
    } catch (error) {}

    try {
      this.VoiceConnection.destroy();
    } catch (error) {}
  }
  private async sendInChat(message: string | object) {
    try {
      const channel = this.client.channels.cache.get(
        this.chatID
      ) as Discord.TextChannel;

      await channel.send(message);
    } catch (error) {
      await this.sendSimpleAlert(botReplys.errorAddInQueue);
      console.log(error);
    }
  }
  async sendAlertInchat(text: string, youtubeUrl: string) {
    try {
      const embedYoutube = await createYoutubeEmbed(
        youtubeUrl,
        text,
        this.queue.length
      );
      await this.sendInChat({ embeds: [embedYoutube] });

    } catch (error) {
      await this.sendSimpleAlert(botReplys.errorAddInQueue);
      console.log(error);
    }
  }
  async sendSimpleAlert(text: string) {
    await this.sendInChat(text);
  }
  playerSwitchStatus() {
    try {
      this.Audioplayer.stop(true);
      this.Audioplayer.emit("playing");
      this.Audioplayer.emit("idle");
    } catch (error) {
      console.log(error);
    }
  }
  async addListnerOnPlayer() {
    this.Audioplayer.on(
      //@ts-ignore
      "stateChange",
      async (
        oldState: VoiceConnectionState,

        newState: VoiceConnectionState
      ) => {
        if (newState.status !== oldState.status) {
          console.log(`Status changed to ${newState.status}`);
          if (
            newState.status.toLowerCase() ===
            String(AudioPlayerStatus.Idle).toLowerCase()
          ) {
            //ojjdanie
            console.log("Get History");
            while (true) {
              if (this.queue.length !== 0) {
                console.log(`History have ${this.queue.length} tracks`);
                const music = this.queue.shift();
                if (!music) {
                  break;
                }
                try {
                  await this.sendAlertInchat(botReplys.startPlaying, music.url);
                  await this.play(music.url);
                  return;
                } catch (error) {
                  // continue;
                  // this.playerSwitchStatus();
                  // console.log(error);
                }
              } else {
                await this.sendSimpleAlert(botReplys.emptyQueue);
                await this.disconect();
                return;
              }
            }
            await this.sendSimpleAlert(botReplys.emptyQueue);
            await this.disconect();
          }
        }
      }
    );
  }
}
