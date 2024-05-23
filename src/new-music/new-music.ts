import type { Message } from "discord.js";
import type { mapPlayers, mapQueueSmart } from "../index";
import type Discord from "discord.js";

import { downloadResources } from "../utils/download-resources";
import { DiscordAlertChannel } from "../discord-alert/discord-alert";
import { playerDiscordBot } from "../player-discord-bot/player-discord-bot";
import { botReplys } from "../consts/bot-replys";
import { queueSmart } from "../queue-smart/queue-smart";
import { createPlayer } from "../utils/create-player";

export async function newMusic(
  message: Message,
  youtubeUrl: string,
  mapPlayers: mapPlayers,
  mapQueueSmart: mapQueueSmart
): Promise<void> {
  if (!message.member?.voice?.channel?.id || !message.guild?.id) {
    return;
  }

  // const playerInMap = mapPlayers.get(message.guild.id);
  const queueSmartInMap = mapQueueSmart.get(message.guild.id);
  if (queueSmartInMap) {
    return await queueSmartInMap.addMusic(youtubeUrl);
  }
  const discordAlert = new DiscordAlertChannel(
    message.channel as Discord.TextChannel
  );

  const queue = new queueSmart(discordAlert,mapQueueSmart);
  mapQueueSmart.set(message.guild.id, queue);

  const { connection, playerAudio } = await createPlayer(
    message.member?.voice.channel.id,
    message.guild.id,
    message.guild.voiceAdapterCreator
  );
  const player = new playerDiscordBot(
    message.guild.id,
    message.member.voice.channel.id,
    message.channel.id,
    playerAudio,
    connection,
    queue,
    discordAlert
  );

  mapPlayers.set(message.guild.id, player);

  const resource = await downloadResources(youtubeUrl);
  if (!resource) {
    await player.disconect();
    mapQueueSmart.delete(message.guild.id);
    mapPlayers.delete(message.guild.id);
    await message.reply(botReplys.errorAddInQueue);
    return;
  }
  await player.play(resource);
  await player.init();
  await discordAlert.sendAlertInchat(
    botReplys.trackAddedSuccess,
    youtubeUrl,
    0
  );
}
