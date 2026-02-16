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
};

export type Author = {
  name: string;
  authorId: string | null;
  role: string;
  bookCount: number;
  avatar: string;
  bio: string;
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
