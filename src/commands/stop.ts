import type { playerDiscordBot } from "../player-discord-bot/player-discord-bot";
import type { mapPlayers } from "../index";
import type {
  Command,
  CommandExecuteArgs,
} from "../handler-commands/handler-commands";

export const stopCommand: Command = {
  name: "?stop",
  description: "stop",
  execute: async ({ player, mapPlayers }: CommandExecuteArgs) => {
    if (!player) return;
    await stop(player, mapPlayers);
  },
};
 async function stop(player: playerDiscordBot, mapPlayers: mapPlayers) {
  await player.stop();
  await player.disconect();
  mapPlayers.delete(player.guildID);
}
