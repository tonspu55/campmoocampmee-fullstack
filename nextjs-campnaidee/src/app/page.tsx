import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Image from "next/image";
import styles from "./homepage.module.css";
import { Button } from "@/components/ui/button";


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
      <div className="flex relative h-[320px] md:h-[500px] flex-col">
        <div className={`${styles.homeBg}`}>
          <div className="container mx-auto max-w-6xl px-2 h-full ">
            <div className="flex flex-col items-center justify-center text-center h-full mt-[-20px] lg:justify-center lg:items-center lg:text-left lg:flex-row lg:pl-[100px] lg:mt-[-20px]">
              <div className="w-[50%] flex-none"></div>
              <div className=" w-full lg:w-[50%] gap-4">
                <h1 className="text-xl lg:text-4xl font-bold text-white">ค้นหาที่พักแคมป์ปิ้งและธรรมชาติ<br />สำหรับการพักผ่อนที่ดีที่สุด
                </h1>
                <Button asChild className="cursor-pointer mt-2 lg:mt-4" variant="default">
                  <Link href="https://www.facebook.com/profile.php?id=100080127966873" target="_blank" >
                    ติดต่อลงข้อมูลแคมป์
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>


      </div>
      <div className="container mx-auto max-w-6xl pt-6 lg:pt-10 px-2">
        <h1 className="text-2xl font-bold mb-4">แคมป์แนะนำ</h1>
        <ul className="flex flex-col  list-none!">
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
                      className="aspect-video rounded-sm"
                      width={300}
                      height={250}
                    />
                  )}
                  <p className="text-md  mt-4">{post.title}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

    </main>
  );
}