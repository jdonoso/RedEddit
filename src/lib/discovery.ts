export interface RatedSubInfo {
  subreddit: string;
  likes: number;
  dislikes: number;
  ratio: number;
}

// Expanded curated similarity map — golden-era subreddits and close relatives
export const SIMILARITY_MAP: Record<string, string[]> = {
  // Programming & CS
  programming: ['compsci', 'learnprogramming', 'softwaregore', 'talesfromtechsupport', 'cscareerquestions', 'webdev', 'javascript', 'Python', 'rust', 'golang', 'cpp', 'haskell', 'osdev', 'coolgithubprojects'],
  learnprogramming: ['programming', 'compsci', 'learnpython', 'learnjavascript', 'cscareerquestions', 'AskComputerScience'],
  compsci: ['programming', 'algorithms', 'math', 'MachineLearning', 'artificial', 'netsec'],
  webdev: ['programming', 'javascript', 'css', 'web_design', 'Frontend', 'node'],
  gamedev: ['gaming', 'indiegaming', 'gamedesign', 'Unity3D', 'unrealengine', 'programming'],

  // Technology
  technology: ['hardware', 'Futurology', 'programming', 'netsec', 'sysadmin', 'linux', 'privacy', 'selfhosted', 'homelab'],
  linux: ['sysadmin', 'commandline', 'archlinux', 'Ubuntu', 'programming', 'selfhosted', 'homelab'],
  sysadmin: ['linux', 'networking', 'netsec', 'devops', 'homelab', 'selfhosted'],
  homelab: ['selfhosted', 'sysadmin', 'linux', 'hardware', 'networking'],
  hardware: ['buildapc', 'techsupport', 'electronics', 'raspberry_pi', 'homelab'],
  privacy: ['netsec', 'linux', 'selfhosted', 'degoogle', 'progrssivetools'],
  netsec: ['hacking', 'ReverseEngineering', 'AskNetsec', 'security', 'programming'],

  // Science
  science: ['askscience', 'biology', 'physics', 'chemistry', 'space', 'environment', 'neuroscience', 'geology', 'EverythingScience'],
  askscience: ['science', 'biology', 'physics', 'chemistry', 'AskScienceDiscussion', 'explainlikeimfive'],
  space: ['astronomy', 'astrophysics', 'SpaceX', 'nasa', 'science', 'Futurology'],
  biology: ['microbiology', 'evolution', 'ecology', 'botany', 'neuroscience', 'science'],
  physics: ['math', 'quantum', 'space', 'PhilosophyOfScience', 'science'],
  neuroscience: ['psychology', 'biology', 'science', 'cogsci', 'consciousness'],

  // Math
  math: ['learnmath', 'statistics', 'physics', 'compsci', 'algorithms', 'mathpics'],

  // History & Humanities
  history: ['AskHistorians', 'todayilearned', 'Archaeology', 'badhistory', 'HistoryMemes', 'ancientrome', 'MapPorn', 'Colonialism', 'AskHistory'],
  AskHistorians: ['history', 'AskHistory', 'AncientHistory', 'badhistory', 'todayilearned'],
  philosophy: ['changemyview', 'PhilosophyOfScience', 'stoicism', 'ethics', 'logic', 'TrueReddit', 'DebateReligion', 'consciousness'],
  linguistics: ['etymology', 'languagelearning', 'japan', 'france', 'Spanish', 'grammar'],

  // Ask-style subs
  AskReddit: ['AskScience', 'changemyview', 'NoStupidQuestions', 'explainlikeimfive', 'Showerthoughts', 'AskHistorians', 'AskPhilosophy', 'TooAfraidToAsk'],
  explainlikeimfive: ['AskScience', 'NoStupidQuestions', 'todayilearned', 'Showerthoughts', 'askscience'],
  changemyview: ['philosophy', 'Showerthoughts', 'TrueReddit', 'DebateReligion', 'AskReddit', 'ethics'],
  todayilearned: ['history', 'science', 'explainlikeimfive', 'interestingasfuck', 'DidYouKnow', 'AskHistorians'],
  IAmA: ['AskReddit', 'casualiama', 'science', 'history', 'technology'],
  NoStupidQuestions: ['explainlikeimfive', 'AskReddit', 'TooAfraidToAsk', 'Showerthoughts'],
  Showerthoughts: ['philosophy', 'AskReddit', 'mildlyinteresting', 'CrazyIdeas', 'theydidthemath'],

  // Books & Writing
  books: ['booksuggestions', 'literature', 'printSF', 'Fantasy', 'HardSciFi', 'scifi', 'horrorlit', '52book', 'bookclub', 'writing'],
  literature: ['books', 'poetry', 'writing', 'worldbuilding', 'ClassicBooks'],
  writing: ['worldbuilding', 'scifiwriting', 'FantasyWorldbuilding', 'screenwriting', 'literature', 'books'],
  scifi: ['printSF', 'HardSciFi', 'fantasy', 'worldbuilding', 'books', 'space'],
  Fantasy: ['books', 'scifi', 'worldbuilding', 'DnD', 'tolkienfans', 'literature'],

  // Movies & TV
  movies: ['TrueFilm', 'moviesuggestions', 'horror', 'Documentaries', 'criterion', 'flicks', 'truefilm', 'dvdcollection'],
  TrueFilm: ['movies', 'Documentaries', 'criterion', 'flicks', 'horror'],
  Documentaries: ['movies', 'TrueFilm', 'history', 'science', 'mealtimevideos'],
  television: ['movies', 'TrueFilm', 'cordcutters', 'anime', 'scifi'],
  anime: ['manga', 'OnePiece', 'Naruto', 'anime_irl', 'Animesuggest'],

  // Music
  music: ['LetsTalkMusic', 'wearethemusicmakers', 'musictheory', 'indieheads', 'hiphopheads', 'Metal', 'classicalmusic', 'electronicmusic', 'Jazz'],
  LetsTalkMusic: ['music', 'musictheory', 'indieheads', 'vinyl', 'listentothis'],
  wearethemusicmakers: ['music', 'musictheory', 'edmproduction', 'audioengineering'],
  indieheads: ['music', 'LetsTalkMusic', 'listentothis', 'vinyl', 'shoegaze'],
  musictheory: ['wearethemusicmakers', 'music', 'classicalmusic', 'Jazz'],
  classicalmusic: ['musictheory', 'music', 'Jazz', 'opera'],

  // Gaming
  gaming: ['patientgamers', 'truegaming', 'gamedesign', 'retrogaming', 'NintendoSwitch', 'pcgaming', 'Steam', 'indiegaming'],
  patientgamers: ['gaming', 'retrogaming', 'truegaming', 'JRPG', 'Steam'],
  truegaming: ['gaming', 'patientgamers', 'gamedesign', 'Games'],
  retrogaming: ['patientgamers', 'gaming', 'nostalgia', 'SNES', 'nes'],
  gamedesign: ['gamedev', 'truegaming', 'programming', 'indiegaming'],
  pcgaming: ['gaming', 'buildapc', 'Steam', 'hardware', 'patientgamers'],

  // Sports
  nfl: ['CFB', 'sports', 'hockey', 'baseball', 'basketball', 'soccer'],
  soccer: ['football', 'sports', 'MLS', 'PremierLeague', 'nfl'],
  baseball: ['nfl', 'sports', 'hockey', 'basketball', 'CFB'],
  hockey: ['nfl', 'baseball', 'sports', 'basketball', 'CHL'],
  basketball: ['nfl', 'sports', 'baseball', 'hockey', 'CollegeBasketball'],

  // Humor & light
  funny: ['mildlyinteresting', 'tifu', 'nottheonion', 'Unexpected', 'Wellthatsucks', 'hmmm', 'BrandNewSentence', 'therewasanattempt'],
  mildlyinteresting: ['funny', 'Damnthatsinteresting', 'interestingasfuck', 'Wellthatsucks', 'hmmm', 'oddlyspecific'],
  tifu: ['AskReddit', 'funny', 'talesfromretail', 'talesfromtechsupport', 'Wellthatsucks'],
  nottheonion: ['funny', 'TheOnion', 'news', 'mildlyinteresting', 'Wellthatsucks'],
  dadjokes: ['puns', 'funny', 'Jokes', 'cleanjokes'],
  Unexpected: ['funny', 'mildlyinteresting', 'Wellthatsucks', 'WTF'],
  aww: ['EarthPorn', 'animalsbeingbros', 'AnimalsBeingDerps', 'rarepuppers', 'cats', 'dogs'],

  // Interest / niche
  bestof: ['AskReddit', 'TrueReddit', 'bestofbooks'],
  videos: ['Documentaries', 'mealtimevideos', 'DeepIntoYouTube', 'youtubehaiku'],
  DIY: ['homeimprovement', 'woodworking', 'electronics', 'crafts', '3Dprinting'],
  woodworking: ['DIY', 'finishing', 'handtools', 'turning', 'furniturerestoration'],
  food: ['Cooking', 'AskCulinary', 'recipes', 'MealPrepSunday', 'vegetarian'],
  Cooking: ['food', 'AskCulinary', 'recipes', 'baking', 'MealPrepSunday'],
  travel: ['solotravel', 'backpacking', 'shoestring', 'travel_advice', 'MapPorn'],
  photography: ['analog', 'photocritique', 'itookapicture', 'astrophotography', 'landscape'],
  art: ['design', 'illustration', 'conceptart', 'PixelArt', 'learnart'],
  design: ['web_design', 'graphic_design', 'UI_Design', 'typography', 'art'],
  Futurology: ['technology', 'space', 'science', 'MachineLearning', 'singularity'],
  MachineLearning: ['deeplearning', 'datascience', 'artificial', 'compsci', 'programming', 'statistics'],
  datascience: ['MachineLearning', 'statistics', 'Python', 'learnmachinelearning', 'analytics'],
};

export function getSuggestionsForSubs(
  userSubs: string[],
  ratedSubs?: RatedSubInfo[]
): string[] {
  const userSubsLower = new Set(userSubs.map(s => s.toLowerCase()));

  // Weight each candidate: +2 for liked sub neighbor, +1 for plain sub neighbor, -3 for disliked sub neighbor
  const scores: Map<string, number> = new Map();

  const likedSubs = new Set((ratedSubs ?? []).filter(r => r.ratio >= 0.6 && r.likes >= 2).map(r => r.subreddit.toLowerCase()));
  const dislikedSubs = new Set((ratedSubs ?? []).filter(r => r.ratio <= 0.3 && r.dislikes >= 2).map(r => r.subreddit.toLowerCase()));

  for (const sub of userSubs) {
    const key = Object.keys(SIMILARITY_MAP).find(k => k.toLowerCase() === sub.toLowerCase());
    if (!key) continue;

    const subLower = sub.toLowerCase();
    const isLiked = likedSubs.has(subLower);
    const isDisliked = dislikedSubs.has(subLower);
    const baseWeight = isLiked ? 3 : isDisliked ? 0 : 1;
    if (baseWeight === 0) continue;

    for (const related of SIMILARITY_MAP[key]) {
      const relLower = related.toLowerCase();
      if (userSubsLower.has(relLower)) continue;
      scores.set(related, (scores.get(related) ?? 0) + baseWeight);
    }
  }

  // Also check reverse: if suggested sub is in map, and user already likes its neighbors
  for (const [candidate, neighborList] of Object.entries(SIMILARITY_MAP)) {
    if (userSubsLower.has(candidate.toLowerCase())) continue;
    for (const neighbor of neighborList) {
      if (likedSubs.has(neighbor.toLowerCase())) {
        scores.set(candidate, (scores.get(candidate) ?? 0) + 1);
      }
    }
  }

  // Downvote candidates that are neighbors of disliked subs
  for (const sub of userSubs) {
    const subLower = sub.toLowerCase();
    if (!dislikedSubs.has(subLower)) continue;
    const key = Object.keys(SIMILARITY_MAP).find(k => k.toLowerCase() === subLower);
    if (!key) continue;
    for (const related of SIMILARITY_MAP[key]) {
      scores.set(related, (scores.get(related) ?? 0) - 2);
    }
  }

  return Array.from(scores.entries())
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([sub]) => sub);
}
