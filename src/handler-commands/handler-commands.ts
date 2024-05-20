import type { Client, Message } from "discord.js";
import type { playerDiscordBot } from "../player-discord-bot/plater-discord-bot";
import type { mapPlayers } from "../index";

import { prefix } from "../consts/prefix";
import { playCommand } from "../commands/play";
import { skipCommand } from "../commands/skip";
import { pauseCommand } from "../commands/pause";
import { resumeCommand } from "../commands/resume";
import { stopCommand } from "../commands/stop";


export interface CommandExecuteArgs {
  player?: playerDiscordBot;
  message: Message;
  mapPlayers: mapPlayers;
  client: Client;
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
  client: Client
) {
 
  if (!message.content.startsWith(prefix)) return;

  const commandName = message.content.startsWith("?play")
    ? "play"
    : message.content.slice(prefix.length).trim();

  const command = commandRegistry[commandName];

  const commandArgs: CommandExecuteArgs = {
    player,
    message,
    mapPlayers,
    client,
  };

  try {
    await command.execute(commandArgs);
  } catch (error) {
    console.log(`${commandName}:, ${error}`);
  }


}
