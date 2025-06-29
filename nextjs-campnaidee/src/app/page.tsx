import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Image from "next/image";


const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, thumbnail, slug}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export default async function IndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);
  console.log("Posts:", posts);

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-4xl font-bold mb-8">รายชื่อแคมป์</h1>
      <ul className="flex flex-col gap-y-4">
        {posts.map((post) => {
          const postImageUrl = post.thumbnail
            ? urlFor(post.thumbnail)?.width(550).height(310).url()
            : null;
          return (
            <li className="hover:underline" key={post._id}>
              <Link href={`/land/${post.slug.current}`}>
                {postImageUrl && (
                  <Image
                    src={postImageUrl}
                    alt={post.title}
                    className="aspect-video rounded-xl"
                    width={550}
                    height={310}
                  />
                )}
                <h2 className="text-xl font-semibold">{post.title}</h2>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}