import { getAdjacentPosts, getRelatedPosts } from "@/lib/blog";

interface BlogNavigationProps {
  slug: string;
  title: string;
  displayDate: string;
  readTime: number;
}

export function BlogNavigation({ slug, title, displayDate, readTime }: BlogNavigationProps) {
  const { prev, next } = getAdjacentPosts(slug);
  const related = getRelatedPosts(slug, 2);

  return (
    <>
      {/* Prev / Next */}
      <div className="mt-12 pt-8 border-t border-neutral-800">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            {prev && (
              <a href={`/blog/${prev.slug}`} className="group block">
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">← Older post</div>
                <div className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
                  {prev.title}
                </div>
              </a>
            )}
          </div>
          <div className="flex-1 text-right">
            {next && (
              <a href={`/blog/${next.slug}`} className="group block">
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Newer post →</div>
                <div className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
                  {next.title}
                </div>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="mt-10 pt-8 border-t border-neutral-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">
            More posts
          </h3>
          <div className="space-y-4">
            {related.map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="text-sm font-medium text-neutral-200 mb-1">{post.title}</div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span>{post.displayDate}</span>
                  <span>·</span>
                  <span>{post.readTime} min read</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Back to blog */}
      <div className="mt-8 pt-6 border-t border-neutral-800">
        <a href="/blog" className="text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm">
          ← All posts
        </a>
      </div>
    </>
  );
}

interface BlogBreadcrumbProps {
  title: string;
}

export function BlogBreadcrumb({ title }: BlogBreadcrumbProps) {
  return (
    <nav className="text-sm text-neutral-500 mb-8">
      <a href="/" className="hover:text-neutral-300 transition-colors">Home</a>
      <span className="mx-2">›</span>
      <a href="/blog" className="hover:text-neutral-300 transition-colors">Blog</a>
      <span className="mx-2">›</span>
      <span className="text-neutral-300 line-clamp-1">{title}</span>
    </nav>
  );
}
