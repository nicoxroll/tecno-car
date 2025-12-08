import React from "react";

export type ViewState =
  | "landing"
  | "catalog"
  | "product-details"
  | "service-details"
  | "checkout"
  | "admin";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  isThinking?: boolean;
  groundingUrls?: string[];
}

export interface ServiceHighlight {
  id: string;
  title: string;
  image: string;
  icon?: React.ReactNode;
}

export interface Post {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  features?: string[]; // Made optional to support catalog items that might add this later
  stock?: number;
  available?: boolean;
  featured?: boolean;
  year?: number;
  tags?: string[];
  discount_price?: number;
  images?: string[];
  model?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimelineStep {
  title: string;
  description: string;
  image: string;
}

export interface Service {
  id: number;
  anchorId: string;
  category: string;
  title: string;
  description: string;
  image: string;
  fullDescription: string;
  order?: number;
  timeline_images?: string[];
  timeline?: TimelineStep[];
  video_url?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
