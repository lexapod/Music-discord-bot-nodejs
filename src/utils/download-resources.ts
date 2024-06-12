import type { AudioResource } from "@discordjs/voice";

import { createAudioResource, StreamType } from "@discordjs/voice";

import ytdlDiscord from "ytdl-core-discord";

export async function downloadResources(
  youtubeUrl: string
): Promise<AudioResource<unknown> | undefined> {
  for (let i = 0; i < 3; i++) {
    try {
      const stream = await ytdlDiscord(youtubeUrl);
      return createAudioResource(stream, { inputType: StreamType.Opus });
    } catch (error) {
      console.log(error);
    }
  }
}
