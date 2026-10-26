import { ArticleForm, type ArticleFormValues } from "@/components/admin/article-form";

export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  const initial: ArticleFormValues = {
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    coverImage: "",
    authorName: "Maison Titrit",
    tags: "",
    published: false,
  };
  return <ArticleForm mode="create" initial={initial} />;
}
