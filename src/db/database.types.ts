export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
        };
        Relationships: [];
      };
      exercises: {
        Row: {
          category_id: string;
          created_at: string;
          description: string | null;
          difficulty: string;
          icon_svg: string | null;
          id: string;
          name: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          description?: string | null;
          difficulty: string;
          icon_svg?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          description?: string | null;
          difficulty?: string;
          icon_svg?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercises_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      plan_exercise_sets: {
        Row: {
          created_at: string;
          exercise_id: string;
          id: string;
          repetitions: number;
          set_order: number;
          training_plan_id: string;
          weight: number;
        };
        Insert: {
          created_at?: string;
          exercise_id: string;
          id?: string;
          repetitions: number;
          set_order: number;
          training_plan_id: string;
          weight: number;
        };
        Update: {
          created_at?: string;
          exercise_id?: string;
          id?: string;
          repetitions?: number;
          set_order?: number;
          training_plan_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "plan_exercise_sets_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_exercise_sets_training_plan_id_fkey";
            columns: ["training_plan_id"];
            isOneToOne: false;
            referencedRelation: "training_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      plan_exercises: {
        Row: {
          exercise_id: string;
          order_index: number;
          training_plan_id: string;
        };
        Insert: {
          exercise_id: string;
          order_index: number;
          training_plan_id: string;
        };
        Update: {
          exercise_id?: string;
          order_index?: number;
          training_plan_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plan_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_exercises_training_plan_id_fkey";
            columns: ["training_plan_id"];
            isOneToOne: false;
            referencedRelation: "training_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          height: number;
          name: string;
          role: string;
          updated_at: string;
          user_id: string;
          weight: number;
        };
        Insert: {
          height: number;
          name: string;
          role?: string;
          updated_at?: string;
          user_id: string;
          weight: number;
        };
        Update: {
          height?: number;
          name?: string;
          role?: string;
          updated_at?: string;
          user_id?: string;
          weight?: number;
        };
        Relationships: [];
      };
      training_plans: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      workout_sets: {
        Row: {
          completed: boolean;
          exercise_id: string;
          id: string;
          modified_at: string;
          repetitions: number;
          set_order: number;
          weight: number;
          workout_id: string;
        };
        Insert: {
          completed?: boolean;
          exercise_id: string;
          id?: string;
          modified_at?: string;
          repetitions: number;
          set_order: number;
          weight: number;
          workout_id: string;
        };
        Update: {
          completed?: boolean;
          exercise_id?: string;
          id?: string;
          modified_at?: string;
          repetitions?: number;
          set_order?: number;
          weight?: number;
          workout_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_sets_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          },
        ];
      };
      workouts: {
        Row: {
          created_at: string;
          end_time: string | null;
          id: string;
          start_time: string;
          training_plan_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          end_time?: string | null;
          id?: string;
          start_time: string;
          training_plan_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          end_time?: string | null;
          id?: string;
          start_time?: string;
          training_plan_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workouts_training_plan_id_fkey";
            columns: ["training_plan_id"];
            isOneToOne: false;
            referencedRelation: "training_plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
