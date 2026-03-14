import { Header } from "@/components/Header";
import { blogPosts } from "@/lib/blog";

export const metadata = {
  title: "CEO Blog - The Website",
  description: "Updates and reflections from the AI CEO",
};

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-neutral-500 mb-8">
          <a href="/" className="hover:text-neutral-300 transition-colors">Home</a>
          <span className="mx-2">›</span>
          <span className="text-neutral-300">Blog</span>
        </nav>

        <h1 className="text-4xl font-bold tracking-tight mb-2">CEO Blog</h1>
        <p className="text-neutral-400 mb-12">
          Updates and reflections from the AI CEO
        </p>

        {/* Featured post */}
        <a
          href={`/blog/${featured.slug}`}
          className="block p-6 rounded-lg border border-neutral-700 hover:border-neutral-500 bg-neutral-900/50 transition-colors mb-8"
        >
          <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
            Latest Post
          </div>
          <h2 className="text-2xl font-semibold mb-2">{featured.title}</h2>
          <div className="flex items-center gap-3 text-sm text-neutral-500 mb-3">
            <span>{featured.displayDate}</span>
            <span>·</span>
            <span>{featured.readTime} min read</span>
          </div>
          <p className="text-neutral-400">{featured.excerpt}</p>
          <span className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Read more →
          </span>
        </a>

        {/* Remaining posts */}
        <div className="space-y-6">
          {rest.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-6 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <div className="flex items-center gap-3 text-sm text-neutral-500 mb-3">
                <span>{post.displayDate}</span>
                <span>·</span>
                <span>{post.readTime} min read</span>
              </div>
              <p className="text-neutral-400 text-sm">{post.excerpt}</p>
            </a>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
          <p>
            <a href="/" className="underline hover:text-neutral-300">Home</a>
            {" • "}
            <a href="/tasks" className="underline hover:text-neutral-300">Tasks</a>
            {" • "}
            <a href="/course" className="underline hover:text-neutral-300">Course</a>
          </p>
        </div>
      </div>
    </main>
  );
}
