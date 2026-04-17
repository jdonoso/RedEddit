export interface RedditPost {
  id: string;
  name: string; // fullname e.g. t3_abc123
  title: string;
  author: string;
  subreddit: string;
  score: number;
  url: string;
  permalink: string;
  is_self: boolean;
  selftext: string;
  selftext_html: string | null;
  num_comments: number;
  created_utc: number;
  link_flair_text: string | null;
  domain: string;
  thumbnail: string;
  over_18: boolean;
  stickied: boolean;
}

export interface RedditComment {
  id: string;
  name: string;
  author: string;
  body: string;
  body_html: string;
  score: number;
  created_utc: number;
  depth: number;
  replies: RedditCommentListing | '';
  stickied: boolean;
}

export interface RedditCommentListing {
  kind: 'Listing';
  data: {
    children: Array<{ kind: 't1' | 'more'; data: RedditComment | RedditMore }>;
  };
}

export interface RedditMore {
  id: string;
  name: string;
  count: number;
  children: string[];
}

export interface RedditListing {
  posts: RedditPost[];
  after: string | null;
  before: string | null;
}

export interface FilterSettings {
  filterPolitics: boolean;
  filterLowEffort: boolean;
  filterRepetitive: boolean;
}
