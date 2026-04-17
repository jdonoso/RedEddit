// Curated similarity map: golden-era subreddits and what you might like if you engage with them
export const SIMILARITY_MAP: Record<string, string[]> = {
  programming: ['compsci', 'learnprogramming', 'softwaregore', 'talesfromtechsupport', 'cscareerquestions'],
  science: ['askscience', 'EverythingScience', 'biology', 'physics', 'chemistry'],
  technology: ['hardware', 'Futurology', 'programming', 'netsec', 'sysadmin'],
  AskReddit: ['AskScience', 'changemyview', 'NoStupidQuestions', 'explainlikeimfive', 'Showerthoughts'],
  todayilearned: ['history', 'science', 'worldbuilding', 'explainlikeimfive', 'interestingasfuck'],
  IAmA: ['AskReddit', 'casualiama', 'stories', 'TrueOffMyChest'],
  explainlikeimfive: ['AskScience', 'NoStupidQuestions', 'todayilearned', 'Showerthoughts'],
  bestof: ['AskReddit', 'bestofbooks', 'TrueReddit'],
  books: ['booksuggestions', 'literature', 'printSF', 'Fantasy', 'HardSciFi'],
  movies: ['TrueFilm', 'moviesuggestions', 'horror', 'Documentaries', 'criterion'],
  music: ['LetsTalkMusic', 'wearethemusicmakers', 'musictheory', 'indieheads'],
  gaming: ['patientgamers', 'truegaming', 'gamedesign', 'retrogaming', 'NintendoSwitch'],
  videos: ['Documentaries', 'mealtimevideos', 'DeepIntoYouTube'],
  funny: ['mildlyinteresting', 'tifu', 'nottheonion', 'Unexpected', 'Wellthatsucks'],
  changemyview: ['philosophy', 'Showerthoughts', 'TrueReddit', 'DebateReligion'],
  history: ['HistoryMemes', 'AskHistorians', 'todayilearned', 'Archaeology', 'badhistory'],
  philosophy: ['changemyview', 'PhilosophyOfScience', 'TheoreticalPhysics', 'stoicism'],
  nfl: ['CFB', 'sports', 'hockey', 'baseball', 'basketball'],
};

export function getSuggestionsForSubs(userSubs: string[]): string[] {
  const suggestions = new Set<string>();
  const userSubsLower = userSubs.map(s => s.toLowerCase());

  for (const sub of userSubs) {
    const key = Object.keys(SIMILARITY_MAP).find(k => k.toLowerCase() === sub.toLowerCase());
    if (key) {
      for (const related of SIMILARITY_MAP[key]) {
        if (!userSubsLower.includes(related.toLowerCase())) {
          suggestions.add(related);
        }
      }
    }
  }

  return Array.from(suggestions);
}
