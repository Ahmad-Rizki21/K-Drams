// List Types
export interface Anime {
  id: number;
  url: string;
  judul: string;
  cover: string;
  lastch?: string;
  lastup?: string;
}

export interface AnimeSearchResult {
  id: number;
  url: string;
  judul: string;
  cover: string;
  lastch?: string;
  lastup?: string;
}

// Detail Types
export interface AnimeChapter {
  id: number;
  ch: string;
  url: string;
  date: string;
  history: string;
  lastDurasi: number | null;
  fullDurasi: number | null;
}

export interface AnimeDetail {
  id: number;
  series_id: string;
  bookmark: string | null;
  cover: string;
  judul: string;
  type: string;
  countdown: string | null;
  status: string;
  rating: string;
  published: string;
  author: string;
  genre: string[];
  genreurl: string[];
  sinopsis: string;
  history: string[];
  historyDurasi: number[];
  historyDurasiFull: number[];
  chapter: AnimeChapter[];
}

// Video Response Types
export interface AnimeStreamSource {
  reso: string;
  link: string;
  provide: number;
  id: number;
}

export interface AnimeVideoData {
  episode_id: number;
  likeCount: number;
  dislikeCount: number;
  userLikeStatus: number;
  reso: string[];
  stream: AnimeStreamSource[];
}

export interface AnimeVideoResponse {
  data: AnimeVideoData[];
}
