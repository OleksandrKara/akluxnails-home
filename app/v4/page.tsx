import { redirect } from "next/navigation";

// Homepage V4 now lives at "/" as a real, weighted variant (key "homepage-v4") rather than its
// own route — this keeps the direct link that was already shared working.
export default function HomePageV4Redirect() {
  redirect("/?v=homepage-v4");
}
