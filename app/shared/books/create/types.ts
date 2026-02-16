export type MonetizationType = "FREE" | "SELL" | "RENT_ONLY";

export type BookStatus = "DRAFT" | "PUBLISHED";

export type LookupOption = {
  label: string;
  value: string;
};

export type BookFormState = {
  title: string;
  description: string;
  coverUrl: string | null;
  language: string;
  categoryValue: string;
  status: BookStatus;
  monetizationType: MonetizationType;
  rentPrice: string;
  rentDurationDays: number;
  buyPrice: string;
  currency: string;
};
