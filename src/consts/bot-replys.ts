export const botReplys = {
  trackOnPause: "⚠️Track is paused.",
  wrongUrlProvided: "⚠️Wrong URL provided. Please check the URL and try again.",
  musicResume: "✅Resuming...",
  musicisPlaying: "⚠️Music is already playing!",
  musicisPaused: "⚠️Music is already on pause!",
  nothingToSkip: "⚠️There are no songs to skip.",
  icantSkipTrack: "⚠️I can't skip the song because it is still playing.",
  skippedTrack: (count: number) => {
    return `⚠️Скипнул хуйню\n${count} Осталось треков`;
  },
  goodbye: "✅Goodbye.",
  userNotInVoice: "❌Join to the voice channel.",
  playerNotPlaying: "❌Bot is not playing.",
  errorAddInQueue: "❌Error when trying to add to queue.",
  trackAddedSuccess: "✅Song is added to queue!",
  startPlaying: "✅Starting playing song!",
  emptyQueue: "✅There are no songs to play.",
  unknownCommand: "⚠️Unknown command. Please check command and try again.",
};
