/** Editorial article shapes (table rows + form values). */

export type ArticleTableRow = {
	id: string;
	slug: string;
	title: string;
	published: boolean;
	publishedAt: string | null;
	updatedAt: string;
};

export type ArticleFormValues = {
	slug: string;
	title: string;
	excerpt: string;
	body: string;
	coverImage: string;
	authorName: string;
	tags: string;
	published: boolean;
};
