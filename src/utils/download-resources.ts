import type { AudioResource } from "@discordjs/voice";

import { createAudioResource } from "@discordjs/voice";

import play from "play-dl";

export async function downloadResources(
  youtubeUrl: string
): Promise<AudioResource<unknown> | undefined> {
  for (let i = 0; i < 3; i++) {
    try {
      const stream = await play.stream(youtubeUrl);
      return createAudioResource(stream.stream, {
        inputType: stream.type
      });
    } catch (error) {
      console.log(error);
    }
  }
}
