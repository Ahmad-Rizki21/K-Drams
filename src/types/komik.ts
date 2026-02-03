// List Types
export interface Komik {
  id: string;
  url: string;
  judul: string;
  cover: string;
  lastch?: string;
  lastup?: string;
  type?: string;
  status?: string;
}

// Chapter Types
export interface KomikChapter {
  chapter_id: string;
  chapter_number: number;
  created_at: string;
}

// Detail Types
export interface KomikDetail {
  id: number;
  manga_id: string;
  title: string;
  alternative_title: string;
  description: string;
  release_year: string;
  status: number;
  cover_image_url: string;
  cover_portrait_url: string;
  view_count: number;
  user_rate: number;
  latest_chapter_id: string;
  latest_chapter_number: number;
  latest_chapter_time: string;
  country_id: string;
  bookmark_count: number;
  rank: number;
  is_recommended: boolean;
  taxonomy: {
    Artist: Array<{ taxonomy_id: number; slug: string; name: string }>;
    Author: Array<{ taxonomy_id: number; slug: string; name: string }>;
    Format: Array<{ taxonomy_id: number; slug: string; name: string }>;
    Genre: Array<{ taxonomy_id: number; slug: string; name: string }>;
    Type: Array<{ taxonomy_id: number; slug: string; name: string }>;
  };
  chapters?: KomikChapter[];
  created_at: string;
  updated_at: string;
}

// Image Types
export interface KomikImage {
  url: string;
  index: number;
}

export interface KomikImageResponse {
  chapterId: string;
  images: KomikImage[];
}
