import EditPostForm from "@/components/EditPostForm";

type PageProps = {
  params: Promise<{ postId: string }>;
};

export default async function EditPostPage({ params }: PageProps) {
  const { postId } = await params;

  return (
    <main className="py-14 lg:py-18">
      <EditPostForm postId={postId} />
    </main>
  );
}
