import React from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
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