import type { AudioResource } from "@discordjs/voice";
import { createAudioResource } from "@discordjs/voice";
import fs from "node:fs";
import fsp from "node:fs/promises";
import ytdl from "ytdl-core";
import os from "node:os";

function downloadMp3(youtubeUrl: string, fileName: string) {
  return new Promise<void>((resolve) => {
    const download = ytdl(youtubeUrl, {
      filter: "audioonly",
    });
    const stream = fs.createWriteStream(fileName);
    download.on("finish", resolve);
    download.on("error",(err)=>{console.warn(err)})
    download.pipe(stream);
  });
}
export async function downloadResources(
  youtubeUrl: string
): Promise<AudioResource<unknown> | undefined> {
  for (let i = 0; i < 3; i++) {
    try {
      const fileName = `${os.tmpdir()}/${crypto.randomUUID()}.mp3`;
      await downloadMp3(youtubeUrl, fileName);
      const audioRes =  createAudioResource(fileName);
      await fsp.unlink(fileName);
      return audioRes;
    } catch (error) {
      console.log(error);
    }
  }
}
