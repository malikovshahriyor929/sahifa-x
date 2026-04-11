import { redirect } from "next/navigation";
import { defaultLocale } from "@/types/auth";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
