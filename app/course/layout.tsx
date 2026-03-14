import CourseProgressStrip from "@/components/CourseProgressStrip";

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CourseProgressStrip />
      {children}
    </>
  );
}
