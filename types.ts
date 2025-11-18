export interface Episode {
  name: string;
  episodeTitle: string;
  url: string;
  link: string;
}

export interface Anime {
  name: string;
  episodes: Episode[];
}

export interface Settings {
  colorMode: 'dark' | 'light';
  theme: string;
  isTextBolder: boolean;
  isTextItalic: boolean;
  fontFamily: string;
  disablePopupPlayer: boolean;
  blockNewTabs: boolean;
  showNotes: boolean;
  headerPosition: 'top' | 'bottom' | 'left' | 'right';
  resizablePanes: boolean;
  showCalendar: boolean;
  showTodoList: boolean;
  showStopwatch: boolean;
  avatarUrl: string;
  enableHoverAnimation: boolean;
  customAnimeDataUrl: string;
  enableBackgroundMusic: boolean;
  customThemeColors?: {
    lightest: string;
    mint: string;
    lime: string;
    olive: string;
    darkest: string;
  };
}

export interface AniListTitle {
  romaji: string;
  english: string | null;
}

export interface AniListImage {
  extraLarge: string;
  color: string | null;
}

export interface RankedAnime {
  id: number;
  title: AniListTitle;
  coverImage: AniListImage;
  averageScore: number;
  genres: string[];
}

export interface JikanImageSet {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface JikanImages {
  jpg: JikanImageSet;
  webp: JikanImageSet;
}

export interface JikanBroadcast {
  day: string | null;
  time: string | null;
  timezone: string | null;
  string: string | null;
}

// FIX: Define JikanAired interface based on Jikan API response for anime seasons.
export interface JikanAired {
  from: string | null;
  to: string | null;
  prop: {
    from: { day: number | null, month: number | null, year: number | null };
    to: { day: number | null, month: number | null, year: number | null };
  };
  string: string | null;
}

export interface AiringAnime {
  mal_id: number;
  title: string;
  images: JikanImages;
  synopsis: string;
  genres: { name: string }[];
  broadcast: JikanBroadcast;
  // FIX: Add missing properties 'aired' and 'episodes' to AiringAnime type to match Jikan API.
  aired: JikanAired;
  episodes: number | null;
}
