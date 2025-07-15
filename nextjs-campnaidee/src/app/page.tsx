import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Image from "next/image";
import styles from "./homepage.module.css";


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


  return (
    <main className="pb-8 lg:pb-12">
      <div className="flex relative h-[320px] md:h-[570px]">
        <div className={styles["home-bg"]} />
      </div>
      <div className="container mx-auto max-w-6xl max-md:px-2">
        <h1 className="text-2xl font-bold my-6">แคมป์แนะนำ</h1>
        <ul className="flex flex-col gap-y-4 list-none!">
          {posts.map((post) => {
            const postImageUrl = post.thumbnail
              ? urlFor(post.thumbnail)?.width(550).height(310).url()
              : null;
            return (
              <li key={post._id}>
                <Link href={`/land/${post.slug.current}`}>
                  {postImageUrl && (
                    <Image
                      src={postImageUrl}
                      alt={post.title}
                      className="aspect-video rounded-xl"
                      width={450}
                      height={450}
                    />
                  )}
                  <h2 className="text-xl font-medium mt-4">{post.title}</h2>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

    </main>
  );
}