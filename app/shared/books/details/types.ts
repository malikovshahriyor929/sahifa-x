type BooleanLike = boolean | 0 | 1 | "0" | "1" | "true" | "false";
type NumberLike = number | string;

export type DetailsApiRecord = {
  id?: string | number;
  _id?: string | number;
  authorId?: string | number;
  title?: string;
  name?: string;
  fullName?: string;
  author?: string;
  authorName?: string;
  description?: string;
  bio?: string;
  coverUrl?: string;
  cover?: string;
  image?: string;
  avatarUrl?: string;
  avatar?: string;
  category?: string;
  genre?: string;
  language?: string;
  status?: string;
  currency?: string;
  rating?: NumberLike;
  voteCount?: NumberLike;
  votesCount?: NumberLike;
  reviewsCount?: NumberLike;
  ratingsCount?: NumberLike;
  rentPriceCents?: NumberLike | null;
  rentDurationDays?: NumberLike | null;
  saves?: NumberLike | unknown[];
  savesCount?: NumberLike;
  savedCount?: NumberLike;
  bookCount?: NumberLike;
  booksCount?: NumberLike;
  is_Author?: BooleanLike;
  isAuthor?: BooleanLike;
  is_saved?: BooleanLike;
  isSaved?: BooleanLike;
  saved?: BooleanLike;
  data?: Record<string, unknown>;
  book?: Record<string, unknown>;
  item?: Record<string, unknown>;
  result?: Record<string, unknown>;
};

export type Book = {
  id: string;
  title: string;
  coverImage: string;
  genres: string[];
  description: string;
  rating: number;
  voteCount: number;
  status: string;
  price: string;
  rentalPeriod: string;
  isAuthor: boolean;
};

export type Author = {
  name: string;
  authorId: string | null;
  role: string;
  bookCount: number;
  avatar: string;
  bio: string;
  isSaved: boolean;
};

export type Chapter = {
  id: string;
  order: number;
  number: string;
  title: string;
  readTime: string;
  date: string;
  isLocked: boolean;
  isFree: boolean;
};

export type SimilarBook = {
  id: string;
  title: string;
  coverImage: string;
  href: string;
};
