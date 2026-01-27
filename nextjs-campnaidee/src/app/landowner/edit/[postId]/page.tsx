import EditPostForm from "@/components/EditPostForm";

type PageProps = {
  params: Promise<{ postId: string }>;
};

export default async function EditPostPage({ params }: PageProps) {
  const { postId } = await params;

  return (
    <main className="py-8 lg:py-10 mt-10 lg:mt-12">
      <EditPostForm postId={postId} />
    </main>
  );
}
