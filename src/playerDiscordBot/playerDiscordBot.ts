import type {
	AudioPlayer,
	AudioResource,
	VoiceConnection,
	VoiceConnectionState,
} from "@discordjs/voice";
import type { Embed, Client } from "discord.js";

import Discord from "discord.js";
import { createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import play from "play-dl";
import ytdl from "ytdl-core-discord";

import config from "../../config.json";
import { botReplys } from "../consts/botReplys";

const COOKIE: string = config.COOCKIEFORYOUTUBE;

if (!COOKIE) {
	throw new TypeError("Config.json please insert COOKIE ");
}

type youtubeInfo = {
	url: string;
};

type queueYoutube = youtubeInfo[];

async function createYoutubeEmbed(
	videoUrl: string,
	text: string,
	length: number,
): Promise<Embed> {
	const videoInfo = await ytdl.getBasicInfo(videoUrl, {
		requestOptions: {
			headers: {
				cookie: COOKIE,
				// Optional. If not given, ytdl-core will try to find it.
				// You can find this by going to a video's watch page, viewing the source,
				// and searching for "ID_TOKEN".
				// 'x-youtube-identity-token': 1324,
			},
		},
	});

	const videoThumbnail: string = // @ts-ignore
		videoInfo.player_response.videoDetails.thumbnail.thumbnails[3].url;
	// @ts-ignore
	const seconds: string = new Date(videoInfo?.videoDetails.lengthSeconds * 1000)
		.toUTCString()
		.split(/ /)[4];

	let description: string = videoInfo?.videoDetails.description || "хуета";

	if (description.length > 4080) {
		description = description.substr(0, 4080);
	}

	// @ts-ignore
	const embed: Embed = new Discord.EmbedBuilder()
		.setTitle(text)
		.addFields(
			{
				name: "Название трека:",
				value: videoInfo?.videoDetails.title || "Хуета",
			},
			{ name: "\u200B", value: "\u200B" },
			{ name: "Длина", value: `${seconds}` || "Хуета", inline: true },
			{ name: "Треков в очереди", value: String(length), inline: true },
		)
		.setURL(videoUrl)
		.setImage(videoThumbnail)
		.setDescription(description);

	return embed;
}

export class playerDiscordBot {
	guildID: string;
	voiceID: string;
	chatID: string;
	Audioplayer: AudioPlayer;
	VoiceConnection: VoiceConnection;
	queue: queueYoutube;
	client: Client;
	constructor(
		guildID: string,
		voiceID: string,
		chatID: string,
		Audioplayer: AudioPlayer,
		VoiceConnection: VoiceConnection,
		queue: queueYoutube,
		client: Client,
	) {
		this.guildID = guildID;
		this.voiceID = voiceID;
		this.chatID = chatID;
		this.Audioplayer = Audioplayer;
		this.VoiceConnection = VoiceConnection;
		this.queue = queue;
		this.client = client;
	}
	async addMusicInQueue(url: string) {
		this.queue.push({ url });
		await this.sendAlertInchat(botReplys.trackAddedSuccess, url);
	}
	async downloadResoreses(youtubeUrl: string): Promise<AudioResource<unknown>> {
		const stream = await play.stream(youtubeUrl);
		const resource: AudioResource = createAudioResource(stream.stream, {
			inputType: stream.type,
		});
		return resource;
	}
	async play(youtubeUrl: string) {
		let resource: AudioResource | undefined;
		for (let i = 0; i < 3; i++) {
			try {
				resource = await this.downloadResoreses(youtubeUrl);
				break;
			} catch (error) {
				console.log(error);
			}
		}
		if (resource) {
			this.Audioplayer.play(resource);
		} else {
			throw new Error("Player can't play ");
		}
	}
	async stop() {
		try {
			this.queue = [];
			this.Audioplayer.stop();
		} catch (error) {
			console.log(error);
		}
	}
	async skip() {
		this.Audioplayer.stop();
	}
	async pause() {
		this.Audioplayer.pause();
	}
	async unpause() {
		this.Audioplayer.unpause();
	}
	async disconect() {
		try {
			this.queue = [];
			this.Audioplayer.removeAllListeners();
			this.Audioplayer?.stop();
		} catch (error) {}
		try {
			this.VoiceConnection?.destroy();
		} catch (error) {}

		try {
			this.VoiceConnection?.destroy();
		} catch (error) {}
	}
	async sendAlertInchat(text: string, youtubeUrl: string) {
		try {
			const channel = this.client.channels.cache.get(
				this.chatID,
			) as Discord.TextChannel;

			const embedYoutube = await createYoutubeEmbed(
				youtubeUrl,
				text,
				this.queue.length,
			);
			await channel.send({ embeds: [embedYoutube] });
		} catch (error) {
			console.log(error);
		}
	}
	async sendSimpleAlert(text: string) {
		try {
			const channel = this.client.channels.cache.get(
				this.chatID,
			) as Discord.TextChannel;

			await channel.send(text);
		} catch (error) {
			console.log(error);
		}
	}
	playerSwitchStatus() {
		try {
			this.Audioplayer.stop(true);
			this.Audioplayer.emit("playing");
			this.Audioplayer.emit("idle");
		} catch (error) {
			console.log(error);
		}
	}
	async addListnerOnPlayer() {
		this.Audioplayer.on(
			//@ts-ignore
			"stateChange",
			async (
				oldState: VoiceConnectionState,

				newState: VoiceConnectionState,
			) => {
				if (newState.status !== oldState.status) {
					console.log(`Status changed to ${newState.status}`);
					if (
						newState.status.toLowerCase() ===
						String(AudioPlayerStatus.Idle).toLowerCase()
					) {
						//ojjdanie
						console.log("Get History");
						while (true) {
							if (this.queue.length !== 0) {
								console.log(`History have ${this.queue.length} tracks`);
								const music = this.queue.shift();
								if (!music) {
									break;
								}
								try {
									await this.sendAlertInchat(botReplys.startPlaying, music.url);
									await this.play(music.url);
									return;
								} catch (error) {
									// continue;
									// this.playerSwitchStatus();
									// console.log(error);
								}
							} else {
								await this.sendSimpleAlert(botReplys.emptyQueue);
								await this.disconect();
								return;
							}
						}
						await this.sendSimpleAlert(botReplys.emptyQueue);
						await this.disconect();
					}
				}
			},
		);
	}
}
