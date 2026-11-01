import { redirect } from "next/navigation";

/** Desktop is the default shell; mobile/desktop UI is handled via Tailwind in-layout. */
export default function RootPage() {
  redirect("/d");
}
