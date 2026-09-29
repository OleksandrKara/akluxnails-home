import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { SERVICE_PAGES } from "@/lib/servicePages";

const config = SERVICE_PAGES["gel-nail-extensions"];

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
  alternates: { canonical: `/${config.slug}` },
};

export default function Page() {
  return <ServicePage config={config} />;
}
