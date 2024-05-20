export const botReplys = {
	trackOnPause: "Трек на паузе",
	wrongUrlProvided: "Попробуй подумать",
	musicResume: "Продолжаем бал",
	musicSteelPlaying: "Музыка и так играет",
	musicSteelPaused: "Музыка и так на паузе",
	nothingToSkip: "Нехуй скипать",
	icantSkipTrack:"Я немогу скипнуть трек пока он не играет.",
	skippedTrack: (count: number) => {
		return `Скипнул хуйню\n${count} Осталось треков`;
	},
	goodbye: "Ок, пока.",
	userNotInVoice: "В войс зайди пидр",
	playerNotPlaying: "Бот не играет. Иди нахуй",
	errorAddInQueue: "Ошибка при добавлении в очередь!",
	trackAddedSuccess: "Трек добавлен в очередь!",
	startPlaying: "Начинаю проигрывать!",
	emptyQueue: "Треки кончились, пока.",
};
  