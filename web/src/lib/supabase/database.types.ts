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
          marketingConsent: string | null
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
          marketingConsent?: string | null
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
          marketingConsent?: string | null
        }
        Relationships: []
      }
      CustomerNote: {
        Row: {
          id: string
          userId: string
          authorId: string
          body: string
          createdAt: string
        }
        Insert: {
          id?: string
          userId: string
          authorId: string
          body: string
          createdAt?: string
        }
        Update: {
          id?: string
          userId?: string
          authorId?: string
          body?: string
          createdAt?: string
        }
        Relationships: []
      }
      CustomerAuditEvent: {
        Row: {
          id: string
          userId: string | null
          actorId: string
          action: string
          detail: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          userId?: string | null
          actorId: string
          action: string
          detail?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          userId?: string | null
          actorId?: string
          action?: string
          detail?: string | null
          createdAt?: string
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
      ProductVariant: {
        Row: {
          id: string
          productId: string
          sku: string
          size: string | null
          color: string | null
          priceOverride: number | null
          isActive: boolean
          position: number
          onHand: number
          reserved: number
          lowStockThreshold: number
          version: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          productId: string
          sku: string
          size?: string | null
          color?: string | null
          priceOverride?: number | null
          isActive?: boolean
          position?: number
          onHand?: number
          reserved?: number
          lowStockThreshold?: number
          version?: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          productId?: string
          sku?: string
          size?: string | null
          color?: string | null
          priceOverride?: number | null
          isActive?: boolean
          position?: number
          onHand?: number
          reserved?: number
          lowStockThreshold?: number
          version?: number
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      StockMovement: {
        Row: {
          id: string
          variantId: string
          type: string
          quantity: number
          onHandAfter: number
          reservedAfter: number
          reason: string | null
          actorId: string | null
          sourceRef: string | null
          idempotencyKey: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          variantId: string
          type: string
          quantity: number
          onHandAfter: number
          reservedAfter: number
          reason?: string | null
          actorId?: string | null
          sourceRef?: string | null
          idempotencyKey?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          variantId?: string
          type?: string
          quantity?: number
          onHandAfter?: number
          reservedAfter?: number
          reason?: string | null
          actorId?: string | null
          sourceRef?: string | null
          idempotencyKey?: string | null
          createdAt?: string
        }
        Relationships: []
      }
      DeliveryZone: {
        Row: {
          id: string
          name: string
          cities: string
          fee: number
          isActive: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          cities: string
          fee?: number
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          cities?: string
          fee?: number
          isActive?: boolean
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
          paymentStatus: string
          fulfilmentStatus: string
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
          idempotencyKey: string | null
          deliveryZoneId: string | null
          deliveryZoneName: string | null
          deliveryFee: number
          deliveryProvider: string | null
          deliveryReference: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          number: string
          status?: string
          paymentStatus?: string
          fulfilmentStatus?: string
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
          idempotencyKey?: string | null
          deliveryZoneId?: string | null
          deliveryZoneName?: string | null
          deliveryFee?: number
          deliveryProvider?: string | null
          deliveryReference?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          number?: string
          status?: string
          paymentStatus?: string
          fulfilmentStatus?: string
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
          idempotencyKey?: string | null
          deliveryZoneId?: string | null
          deliveryZoneName?: string | null
          deliveryFee?: number
          deliveryProvider?: string | null
          deliveryReference?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      OrderStatusHistory: {
        Row: {
          id: string
          orderId: string
          fromStatus: string | null
          toStatus: string
          paymentStatus: string | null
          fulfilmentStatus: string | null
          actorId: string | null
          reason: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          orderId: string
          fromStatus?: string | null
          toStatus: string
          paymentStatus?: string | null
          fulfilmentStatus?: string | null
          actorId?: string | null
          reason?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          orderId?: string
          fromStatus?: string | null
          toStatus?: string
          paymentStatus?: string | null
          fulfilmentStatus?: string | null
          actorId?: string | null
          reason?: string | null
          createdAt?: string
        }
        Relationships: []
      }
      OrderNotification: {
        Row: {
          id: string
          orderId: string
          event: string
          channel: string
          to: string
          status: string
          attempts: number
          lastError: string | null
          lastAttemptAt: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          orderId: string
          event: string
          channel: string
          to: string
          status?: string
          attempts?: number
          lastError?: string | null
          lastAttemptAt?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          orderId?: string
          event?: string
          channel?: string
          to?: string
          status?: string
          attempts?: number
          lastError?: string | null
          lastAttemptAt?: string | null
          createdAt?: string
        }
        Relationships: []
      }
      OrderItem: {
        Row: {
          id: string
          orderId: string
          productId: string
          variantId: string | null
          sku: string | null
          ref: string
          name: string
          price: number
          quantity: number
          size: string | null
          color: string | null
        }
        Insert: {
          id?: string
          orderId: string
          productId: string
          variantId?: string | null
          sku?: string | null
          ref: string
          name: string
          price: number
          quantity: number
          size?: string | null
          color?: string | null
        }
        Update: {
          id?: string
          orderId?: string
          productId?: string
          variantId?: string | null
          sku?: string | null
          ref?: string
          name?: string
          price?: number
          quantity?: number
          size?: string | null
          color?: string | null
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
