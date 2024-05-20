import type { Client, Message } from "discord.js";
import type { mapPlayers } from "../index";
import type { AudioPlayer, VoiceConnection } from "@discordjs/voice";

import {
  createAudioPlayer,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from "@discordjs/voice";

import { playerDiscordBot } from "../player-discord-bot/plater-discord-bot";
import { botReplys } from "../consts/botReplys";

export async function newMusic(
  message: Message,
  youtubeUrl: string,
  mapPlayers: mapPlayers,
  client: Client
): Promise<void> {
  if (!message.member?.voice?.channel?.id || !message.guild?.id) {
    return;
  }

  try {
    const playerInMap = mapPlayers.get(message.guild.id);

    if (playerInMap) {
      return await playerInMap.addMusicInQueue(youtubeUrl);
    }
    const connection: VoiceConnection = joinVoiceChannel({
      channelId: message.member?.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    const playerAudio: AudioPlayer = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Play },
    });

    const player = new playerDiscordBot(
      message.guild.id,
      message.member.voice.channel.id,
      message.channel.id,
      playerAudio,
      connection,
      [],
      client
    );

    mapPlayers.set(message.guild.id, player);
    await player.play(youtubeUrl);
    player.VoiceConnection.subscribe(player.Audioplayer);
    await player.addListnerOnPlayer();
    await player.sendAlertInchat(botReplys.trackAddedSuccess, youtubeUrl);
  } catch (error) {
    console.log(error);
    await message.reply(botReplys.errorAddInQueue);
  }
}
