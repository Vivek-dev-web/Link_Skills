import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils";

export default async function EmbedPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { name: true, image: true, headline: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!post) notFound();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{post.author.name} on Atlas</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Inter, system-ui, sans-serif; background: #fff; color: #1B1F3B; }
          .card { border: 1px solid #E4E7EC; border-radius: 12px; padding: 16px; margin: 12px; }
          .avatar { width: 40px; height: 40px; border-radius: 50%; background: #D0F7F2; color: #00C4A7; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
          .avatar img { width: 100%; height: 100%; object-fit: cover; }
          .header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
          .name { font-weight: 600; font-size: 14px; }
          .headline { font-size: 11px; color: #64748B; margin-top: 1px; }
          .time { font-size: 11px; color: #64748B; }
          .content { font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
          .image { margin-top: 10px; border-radius: 8px; width: 100%; max-height: 220px; object-fit: cover; display: block; }
          .footer { display: flex; gap: 16px; margin-top: 12px; padding-top: 10px; border-top: 1px solid #E4E7EC; font-size: 12px; color: #64748B; }
          .badge { display: inline-block; background: #00C4A7; color: #fff; border-radius: 99px; padding: 2px 8px; font-size: 10px; font-weight: 600; text-decoration: none; margin-top: 12px; }
          a { color: #00C4A7; text-decoration: none; }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="header">
            <div className="avatar">
              {post.author.image
                ? <img src={post.author.image} alt="" />
                : post.author.name.charAt(0)}
            </div>
            <div>
              <p className="name">{post.author.name}</p>
              {post.author.headline && <p className="headline">{post.author.headline}</p>}
              <p className="time">{formatRelativeTime(post.createdAt.toISOString())}</p>
            </div>
          </div>
          <p className="content">{post.content}</p>
          {post.imageUrl && <img src={post.imageUrl} alt="" className="image" />}
          <div className="footer">
            <span>👍 {post._count.likes} reactions</span>
            <span>💬 {post._count.comments} comments</span>
          </div>
          <a href={`${process.env.NEXTAUTH_URL ?? ""}/posts/${post.id}`} className="badge" target="_blank" rel="noopener">
            View on Atlas
          </a>
        </div>
      </body>
    </html>
  );
}
