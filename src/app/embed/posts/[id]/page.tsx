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

  const origin = process.env.NEXTAUTH_URL ?? "";

  return (
    <div className="p-3 font-sans">
      <div className="border border-border rounded-xl p-4 bg-white space-y-3 max-w-lg">
        {/* Author */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-teal-light flex items-center justify-center text-sm font-bold text-teal shrink-0 overflow-hidden">
            {post.author.image
              ? <img src={post.author.image} alt="" className="h-full w-full object-cover" />
              : post.author.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{post.author.name}</p>
            {post.author.headline && <p className="text-xs text-muted">{post.author.headline}</p>}
            <p className="text-xs text-muted">{formatRelativeTime(post.createdAt.toISOString())}</p>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap line-clamp-6">{post.content}</p>

        {/* Image */}
        {post.imageUrl && (
          <img src={post.imageUrl} alt="" className="rounded-lg w-full max-h-52 object-cover" />
        )}

        {/* Counts */}
        <div className="flex gap-4 text-xs text-muted pt-1 border-t border-border">
          <span>👍 {post._count.likes} reactions</span>
          <span>💬 {post._count.comments} comments</span>
        </div>

        {/* CTA */}
        <a
          href={`${origin}/posts/${post.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-teal rounded-full px-3 py-1.5 hover:bg-teal-dark transition-colors"
        >
          View on SkillWarehouse →
        </a>
      </div>
    </div>
  );
}
