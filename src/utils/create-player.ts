import type {
  AudioPlayer,
  DiscordGatewayAdapterCreator,
  VoiceConnection,
} from "@discordjs/voice";

import {
  createAudioPlayer,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from "@discordjs/voice";

export async function createPlayer(
  channelId: string,
  guildId: string,
  voiceAdapterCreator: DiscordGatewayAdapterCreator
) {
  const connection: VoiceConnection = joinVoiceChannel({
    channelId: channelId,
    guildId: guildId,
    adapterCreator: voiceAdapterCreator,
  });
  const playerAudio: AudioPlayer = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Play },
  });
  return { connection, playerAudio };
}
