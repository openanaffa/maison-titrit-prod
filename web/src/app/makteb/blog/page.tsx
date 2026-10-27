import { redirect } from "next/navigation";
import { CMS_URL } from "@/lib/cms";

// The journal is edited in Strapi; the storefront reads it from there (lib/cms).
export default function MaktebBlogPage() {
  redirect(`${CMS_URL}/admin/content-manager/collection-types/api::article.article`);
}
