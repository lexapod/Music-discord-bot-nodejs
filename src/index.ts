import type { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import type { Message, VoiceState } from "discord.js";
import { GatewayIntentBits, Client } from "discord.js";

import {
	createAudioPlayer,
	joinVoiceChannel,
	NoSubscriberBehavior,
	AudioPlayerStatus,
} from "@discordjs/voice";
import play from "play-dl";

import config from "../config.json";

const COOKIE: string = config.COOCKIEYT;
const TOKEN: string = config.discordToken;

if (!(COOKIE && TOKEN)) {
	throw new TypeError("Config.json. Please insert COOKIE Netscape or Tokens");
}

import EventEmitter from "node:events";
import { playerDiscordBot } from "./playerDiscordBot";

const mapPlayers = new Map<string, playerDiscordBot>();
const eventNewMusic = new EventEmitter();

eventNewMusic.on("newMusic", async (message: Message, youtubeUrl: string) => {
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

		if (!playerAudio) throw new Error("Player not allowed");

		const player = new playerDiscordBot(
			message.guild.id,
			message.member.voice.channel.id,
			message.channel.id,
			playerAudio,
			connection,
			[],
			client,
		);

		mapPlayers.set(message.guild.id, player);
		await player.play(youtubeUrl);
		player.VoiceConnection.subscribe(player.Audioplayer);
		await player.addListnerOnPlayer();
		await player.sendAlertInchat("Трек добавлен!", youtubeUrl);

		return;
	} catch (error) {
		console.log(error);
		return await message.reply("Ошибка при добавлении в очередь!");
	}
});

play.setToken({
	youtube: {
		cookie: COOKIE,
	},
});

const client = new Client({
	intents: [
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		// GatewayIntentBits.GuildAuditLogs,
	],
	// partials: ["CHANNEL", "MESSAGE"],
});

const commandList = [
	"?play",
	"?skip",
	"?skip",
	"?debug",
	"?pause",
	"?resume",
	"?stop",
];

async function handleCommands(
	player: playerDiscordBot | undefined,
	message: Message,
) {
	if (message.content.startsWith("?debug")) {
		console.log(mapPlayers);
		return;
	}
	if (message.content.startsWith("?play")) {
		try {
			const YoutubeURL: string = message.content.split("play ")[1];
			if (!YoutubeURL) {
				throw new Error("Url not found");
			}
			eventNewMusic.emit("newMusic", message, YoutubeURL);
		} catch (e) {
			console.log(e);
			return await message.reply("Попробуй подумать");
		}
	}
	if (!player) return;
	// Команда skip
	if (message.content.startsWith("?skip")) {
		if (player.queue.length < 0) return message.channel.send("Нехуй скипать");
		await player.skip();
		return await message.reply(
			`Скипнул хуйню\n${player.queue.length} Осталось треков`,
		);
	}
	// Команда паузы
	if (message.content.startsWith("?pause")) {
		if (player.Audioplayer.state.status === AudioPlayerStatus.Paused) {
		}
		player.pause();
		return message.channel.send("Трек на паузе");
	}
	// Команда продолжения после паузы
	if (message.content.startsWith("?resume")) {
		if (player.Audioplayer.state.status === AudioPlayerStatus.Playing) {
			return await message.channel.send("Музыка и так играет");
		}
		player.unpause();
		return await message.channel.send("Продолжаем бал");
	}
	// Команда выключения
	if (message.content.startsWith("?stop")) {
		await player.stop();
		await player.disconect();
		mapPlayers.delete(player.guildID);
		return;
	}
}
// @ts-ignore
client.on("messageCreate", async (message: Message) => {
	if (message.author.bot || !message.guild?.id) return;
	//i think it's happened never but type ts say it's optional

	const isPlay = message.content.startsWith("?play");

	if (commandList.includes(message.content) || !isPlay) {
		const voiceChannel = message.member?.voice?.channel;
		if (!voiceChannel) return await message.channel.send("В войс зайди пидр");
	}
	const player = mapPlayers.get(message.guild.id);

	if (!player && !isPlay) {
		return await message.channel.send("Бот не играет. Иди нахуй");
	}
	await handleCommands(player, message);
});
async function checkMute(
	player: playerDiscordBot,
	oldState: VoiceState,
	newState: VoiceState,
) {
	if (oldState.serverMute && !newState.serverMute) {
		console.log("Bot has been unmuted.");
		await player.unpause();
	} else if (!oldState.serverMute && newState.serverMute) {
		await player.pause();
		console.log("Bot has been muted.");
	}
}
async function checkKick(
	player: playerDiscordBot,
	oldState: VoiceState,
	newState: VoiceState,
) {
	if (oldState.channelId && !newState.channelId) {
		console.log("Bot has been kicked from voice channel.");
		await player.disconect();
		await player.sendSimpleAlert("Ок, пока.");
		mapPlayers.delete(oldState.guild.id);
		console.log("success clear");
	}
}
async function checkStatusbot(oldState: VoiceState, newState: VoiceState) {
	if (oldState?.member?.user.bot) {
		//muted or not muted
		const player = mapPlayers.get(oldState.guild.id);

		if (!player) return;

		await checkMute(player, oldState, newState);
		await checkKick(player, oldState, newState);
	}
}
client.on(
	"voiceStateUpdate",
	async (oldState: VoiceState, newState: VoiceState) => {
		await checkStatusbot(oldState, newState);
	},
);

client.on("ready", () => {
	console.log(`We have logged in as ${client?.user?.tag}!`);
});

client.login(TOKEN);
