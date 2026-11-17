/**
 * GENERATED FILE — do not edit by hand.
 * Source: prisma/schema.postgres.prisma
 * Regenerate: bun run db:types  (from web/)
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          supabaseId: string | null
          name: string | null
          email: string
          emailVerified: string | null
          image: string | null
          role: string
          phone: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          supabaseId?: string | null
          name?: string | null
          email: string
          emailVerified?: string | null
          image?: string | null
          role?: string
          phone?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          supabaseId?: string | null
          name?: string | null
          email?: string
          emailVerified?: string | null
          image?: string | null
          role?: string
          phone?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Invite: {
        Row: {
          id: string
          email: string
          role: string
          token: string
          invitedBy: string
          usedById: string | null
          expiresAt: string
          usedAt: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          email: string
          role?: string
          token: string
          invitedBy: string
          usedById?: string | null
          expiresAt: string
          usedAt?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          token?: string
          invitedBy?: string
          usedById?: string | null
          expiresAt?: string
          usedAt?: string | null
          createdAt?: string
        }
        Relationships: []
      }
      Category: {
        Row: {
          id: string
          name: string
          slug: string
          position: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          position?: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          position?: number
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Product: {
        Row: {
          id: string
          ref: string
          name: string
          nameAmazigh: string | null
          description: string
          shortStory: string
          materials: string
          colors: string
          sizes: string
          price: number
          salePrice: number | null
          currency: string
          inStock: boolean
          featured: boolean
          categoryId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          ref: string
          name: string
          nameAmazigh?: string | null
          description: string
          shortStory: string
          materials: string
          colors: string
          sizes: string
          price: number
          salePrice?: number | null
          currency?: string
          inStock?: boolean
          featured?: boolean
          categoryId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          ref?: string
          name?: string
          nameAmazigh?: string | null
          description?: string
          shortStory?: string
          materials?: string
          colors?: string
          sizes?: string
          price?: number
          salePrice?: number | null
          currency?: string
          inStock?: boolean
          featured?: boolean
          categoryId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Image: {
        Row: {
          id: string
          productId: string
          url: string
          alt: string | null
          position: number
          createdAt: string
        }
        Insert: {
          id?: string
          productId: string
          url: string
          alt?: string | null
          position?: number
          createdAt?: string
        }
        Update: {
          id?: string
          productId?: string
          url?: string
          alt?: string | null
          position?: number
          createdAt?: string
        }
        Relationships: []
      }
      Order: {
        Row: {
          id: string
          number: string
          status: string
          customerName: string
          customerPhone: string
          customerEmail: string | null
          city: string | null
          address: string | null
          notes: string | null
          utmSource: string | null
          utmMedium: string | null
          utmCampaign: string | null
          utmContent: string | null
          utmTerm: string | null
          total: number
          currency: string
          payment: string
          userId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          number: string
          status?: string
          customerName: string
          customerPhone: string
          customerEmail?: string | null
          city?: string | null
          address?: string | null
          notes?: string | null
          utmSource?: string | null
          utmMedium?: string | null
          utmCampaign?: string | null
          utmContent?: string | null
          utmTerm?: string | null
          total: number
          currency?: string
          payment?: string
          userId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          number?: string
          status?: string
          customerName?: string
          customerPhone?: string
          customerEmail?: string | null
          city?: string | null
          address?: string | null
          notes?: string | null
          utmSource?: string | null
          utmMedium?: string | null
          utmCampaign?: string | null
          utmContent?: string | null
          utmTerm?: string | null
          total?: number
          currency?: string
          payment?: string
          userId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      OrderItem: {
        Row: {
          id: string
          orderId: string
          productId: string
          ref: string
          name: string
          price: number
          quantity: number
          size: string | null
        }
        Insert: {
          id?: string
          orderId: string
          productId: string
          ref: string
          name: string
          price: number
          quantity: number
          size?: string | null
        }
        Update: {
          id?: string
          orderId?: string
          productId?: string
          ref?: string
          name?: string
          price?: number
          quantity?: number
          size?: string | null
        }
        Relationships: []
      }
      Article: {
        Row: {
          id: string
          slug: string
          locale: string
          title: string
          excerpt: string
          body: string
          coverImage: string | null
          authorName: string
          tags: string
          published: boolean
          publishedAt: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          slug: string
          locale?: string
          title: string
          excerpt: string
          body: string
          coverImage?: string | null
          authorName?: string
          tags: string
          published?: boolean
          publishedAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          slug?: string
          locale?: string
          title?: string
          excerpt?: string
          body?: string
          coverImage?: string | null
          authorName?: string
          tags?: string
          published?: boolean
          publishedAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Setting: {
        Row: {
          key: string
          value: string
          updatedAt: string
        }
        Insert: {
          key: string
          value: string
          updatedAt?: string
        }
        Update: {
          key?: string
          value?: string
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
