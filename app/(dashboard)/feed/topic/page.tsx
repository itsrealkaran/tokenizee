import Link from "next/link";

const topics = ["Travel", "Tech", "Art", "Science", "Sports"];

export default function TopicsPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Browse Topics</h1>
      <ul className="space-y-3">
        {topics.map((topic) => (
          <li key={topic}>
            <Link
              href={`/feed/topic/${topic.toLowerCase()}`}
              className="block px-4 py-3 rounded-lg bg-muted/60 hover:bg-primary/10 text-lg font-medium transition-colors border border-transparent hover:border-primary text-muted-foreground hover:text-primary"
            >
              #{topic}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
