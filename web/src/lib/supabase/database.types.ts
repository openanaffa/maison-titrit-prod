type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type UserRow = {
  id: string;
  supabaseId: string | null;
  name: string | null;
  email: string;
  emailVerified: string | null;
  image: string | null;
  role: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductRow = {
  id: string;
  ref: string;
  name: string;
  nameAmazigh: string | null;
  description: string;
  shortStory: string;
  materials: string;
  colors: string;
  sizes: string;
  price: number;
  salePrice: number | null;
  currency: string;
  inStock: boolean;
  featured: boolean;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ImageRow = {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  position: number;
  createdAt: string;
};

export type OrderRow = {
  id: string;
  number: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  city: string | null;
  address: string | null;
  notes: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  total: number;
  currency: string;
  payment: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItemRow = {
  id: string;
  orderId: string;
  productId: string;
  ref: string;
  name: string;
  price: number;
  quantity: number;
  size: string | null;
};

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  authorName: string;
  tags: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SettingRow = {
  key: string;
  value: string;
  updatedAt: string;
};

export type InviteRow = {
  id: string;
  email: string;
  role: string;
  token: string;
  invitedBy: string;
  usedById: string | null;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};

export type Database = {
  public: {
    Tables: {
      User: Table<UserRow>;
      Invite: Table<InviteRow>;
      Category: Table<CategoryRow>;
      Product: Table<ProductRow>;
      Image: Table<ImageRow>;
      Order: Table<OrderRow>;
      OrderItem: Table<OrderItemRow>;
      Article: Table<ArticleRow>;
      Setting: Table<SettingRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
