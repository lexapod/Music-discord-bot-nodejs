import type {
  AudioPlayer,
  AudioResource,
  VoiceConnection,
  VoiceConnectionState,
} from "@discordjs/voice";
import type { Client } from "discord.js";
import type { queueSmart } from "../queue-smart/queue-smart";
import type { DiscordAlertChannel } from "../discord-alert/discord-alert";

import { AudioPlayerStatus } from "@discordjs/voice";
import { botReplys } from "../consts/bot-replys";

export class playerDiscordBot {
  guildID: string;
  voiceID: string;
  chatID: string;
  Audioplayer: AudioPlayer;
  VoiceConnection: VoiceConnection;
  queue: queueSmart;
  client: Client;
  DiscordAlertChannel: DiscordAlertChannel;
  constructor(
    guildID: string,
    voiceID: string,
    chatID: string,
    Audioplayer: AudioPlayer,
    VoiceConnection: VoiceConnection,
    queue: queueSmart,
    client: Client,
    DiscordAlertChannel: DiscordAlertChannel
  ) {
    this.guildID = guildID;
    this.voiceID = voiceID;
    this.chatID = chatID;
    this.Audioplayer = Audioplayer;
    this.VoiceConnection = VoiceConnection;
    this.queue = queue;
    this.client = client;
    this.DiscordAlertChannel = DiscordAlertChannel;
  }
  async init() {
    this.VoiceConnection.subscribe(this.Audioplayer);
    await this.addListnerOnPlayer();
  }
  async addMusicInQueue(url: string) {
    await this.queue.addMusic(url);
  }
  async play(resource: AudioResource) {
    this.Audioplayer.play(resource);
  }
  async stop() {
    this.queue.clearQueue();
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
    this.queue.clearQueue();
    try {
      this.Audioplayer.off;
      this.Audioplayer.stop();
    } catch (error) {}

    try {
      this.VoiceConnection.destroy();
    } catch (error) {}
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
            console.log("Try found new music");
            while (true) {
              const music = await this.queue.getMusic();
              if (music?.failed) {
                await this.DiscordAlertChannel.sendSimpleAlert(
                  `Failed playing this shit\n${music.url}`
                );
                continue;
              }
              if (music?.resource) {
                await this.DiscordAlertChannel.sendAlertInchat(
                  botReplys.startPlaying,
                  music.url,
                  this.queue.getCurrentLength()
                );
                await this.play(music.resource);
                break;
              }
              await this.DiscordAlertChannel.sendSimpleAlert(
                botReplys.emptyQueue
              );
              await this.disconect();
              break;
            }
          }
        }
      }
    );
  }
}
