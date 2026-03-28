import LandOwnerSidebarLayout from "@/components/LandOwnerSidebar";

export default function LandOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandOwnerSidebarLayout>{children}</LandOwnerSidebarLayout>;
}
