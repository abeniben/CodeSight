export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      submissions: {
        Row: {
          id: string
          user_id: string
          title: string
          language: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          language: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          language?: string
          code?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          submission_id: string
          user_id: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          user_id: string
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          user_id?: string
          comment?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_submission_id_fkey"
            columns: ["submission_id"]
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      review_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          vote: boolean
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          vote: boolean
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          vote?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      replies: {
        Row: {
          id: string
          review_id: string
          parent_id: string | null
          user_id: string
          user_email: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          parent_id?: string | null
          user_id: string
          user_email: string
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          parent_id?: string | null
          user_id?: string
          user_email?: string
          comment?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "replies_review_id_fkey"
            columns: ["review_id"]
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
  }
}