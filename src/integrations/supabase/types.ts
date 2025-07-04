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
      matches: {
        Row: {
          completed_at: string | null
          created_at: string | null
          creator_deposit_confirmed: boolean | null
          creator_deposit_signature: string | null
          creator_wallet: string
          id: string
          is_private: boolean
          is_quick_game: boolean
          opponent_deposit_confirmed: boolean | null
          opponent_deposit_signature: string | null
          opponent_wallet: string | null
          started_at: string | null
          status: string | null
          wager: number
          winner_wallet: string | null
          winnings_claimed: boolean | null
          winnings_claimed_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          creator_deposit_confirmed?: boolean | null
          creator_deposit_signature?: string | null
          creator_wallet: string
          id?: string
          is_private?: boolean
          is_quick_game?: boolean
          opponent_deposit_confirmed?: boolean | null
          opponent_deposit_signature?: string | null
          opponent_wallet?: string | null
          started_at?: string | null
          status?: string | null
          wager: number
          winner_wallet?: string | null
          winnings_claimed?: boolean | null
          winnings_claimed_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          creator_deposit_confirmed?: boolean | null
          creator_deposit_signature?: string | null
          creator_wallet?: string
          id?: string
          is_private?: boolean
          is_quick_game?: boolean
          opponent_deposit_confirmed?: boolean | null
          opponent_deposit_signature?: string | null
          opponent_wallet?: string | null
          started_at?: string | null
          status?: string | null
          wager?: number
          winner_wallet?: string | null
          winnings_claimed?: boolean | null
          winnings_claimed_at?: string | null
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          best_tap_count: number
          created_at: string
          id: string
          total_battles: number
          total_victories: number
          updated_at: string
          wallet_address: string
        }
        Insert: {
          best_tap_count?: number
          created_at?: string
          id?: string
          total_battles?: number
          total_victories?: number
          updated_at?: string
          wallet_address: string
        }
        Update: {
          best_tap_count?: number
          created_at?: string
          id?: string
          total_battles?: number
          total_victories?: number
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      tap_results: {
        Row: {
          id: string
          match_id: string | null
          score: number
          signature: string
          submitted_at: string | null
          timestamp: string
          wallet_address: string
        }
        Insert: {
          id?: string
          match_id?: string | null
          score: number
          signature: string
          submitted_at?: string | null
          timestamp: string
          wallet_address: string
        }
        Update: {
          id?: string
          match_id?: string | null
          score?: number
          signature?: string
          submitted_at?: string | null
          timestamp?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "tap_results_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
