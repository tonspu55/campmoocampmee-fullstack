// Shown instantly while the dynamic /account server component resolves the
// session — masks cold-start/render latency so the click feels responsive.
export default function Loading() {
  return (
    <main className="py-12 lg:py-16 mt-15">
      <div className="container mx-auto max-w-lg px-4">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </main>
  );
}
