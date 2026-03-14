import { getSession } from "@/lib/session";
import CertificateClient from "./CertificateClient";

export const metadata = {
  title: "Course Completion Certificate - Build Your Own AI Agent",
  description: "Your certificate of completion for the Build Your Own AI Agent course.",
};

export default async function CertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; date?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  const userName =
    params.name ||
    session?.user?.name ||
    "Course Graduate";

  const completedAt =
    params.date ||
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <CertificateClient
      userName={userName}
      completedAt={completedAt}
    />
  );
}
