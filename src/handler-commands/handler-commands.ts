import type { Client, Message } from "discord.js";
import type { playerDiscordBot } from "../player-discord-bot/player-discord-bot";
import type { mapPlayers } from "../index";
import type { mapQueueSmart } from "../index";

import { prefix } from "../consts/prefix";
import { playCommand } from "../commands/play";
import { skipCommand } from "../commands/skip";
import { pauseCommand } from "../commands/pause";
import { resumeCommand } from "../commands/resume";
import { stopCommand } from "../commands/stop";
import { botReplys } from "../consts/bot-replys";

export interface CommandExecuteArgs {
  player?: playerDiscordBot;
  message: Message;
  mapPlayers: mapPlayers;
  client: Client;
  mapQueueSmart: mapQueueSmart;
}

export interface Command {
  name: string;
  description: string;
  execute: (args: CommandExecuteArgs) => Promise<void> | void;
}

const commandRegistry: { [key: string]: Command } = {
  play: playCommand,
  skip: skipCommand,
  pause: pauseCommand,
  resume: resumeCommand,
  stop: stopCommand,
};

export async function handleCommands(
  player: playerDiscordBot | undefined,
  message: Message,
  mapPlayers: mapPlayers,
  client: Client,
  mapQueueSmart: mapQueueSmart
) {
  let commandName = message.content.slice(prefix.length).trim();
  if (message.content.startsWith("?play")) {
    commandName = "play";
  }

  const command = commandRegistry[commandName];

  if (!command?.execute) {
    return await message.channel.send(botReplys.unknownCommand);
  }

  const commandArgs: CommandExecuteArgs = {
    player,
    message,
    mapPlayers,
    client,
    mapQueueSmart,
  };

  await command.execute(commandArgs);
}
