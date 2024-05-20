import type { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import type { Message, VoiceState } from "discord.js";

import { GatewayIntentBits, Client } from "discord.js";
import {
	createAudioPlayer,
	joinVoiceChannel,
	NoSubscriberBehavior,
} from "@discordjs/voice";
import play from "play-dl";

import config from "../config.json";

const COOKIE: string = config.COOCKIEFORYOUTUBE;
const TOKEN: string = config.DISCORDBOTTOKEN;

if (!(COOKIE && TOKEN)) {
	throw new TypeError("Config.json. Please insert COOKIE Netscape or Tokens");
}

import EventEmitter from "node:events";
import { playerDiscordBot } from "./playerDiscordBot";

import { checkStatusbot } from "./voiceStatus/checkStatusVoice";
import { handleCommands } from "./handlerCommands/handlerCommands";

const commandList = [
	"?play",
	"?skip",
	"?skip",
	"?debug",
	"?pause",
	"?resume",
	"?stop",
];

type mapPlayers = Map<string, playerDiscordBot>;
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

	await handleCommands(player, message, mapPlayers, eventNewMusic);
});

client.on(
	"voiceStateUpdate",
	async (oldState: VoiceState, newState: VoiceState) => {
		await checkStatusbot(oldState, newState, mapPlayers);
	},
);

client.on("ready", () => {
	console.log(`We have logged in as ${client?.user?.tag}!`);
});

client.login(TOKEN);
