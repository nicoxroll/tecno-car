import { Product } from '../types';

export interface Service {
  id: number;
  anchorId: string;
  category: string;
  title: string;
  description: string;
  image: string;
  fullDescription: string;
}

// Load products from JSON
export const loadProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) {
      throw new Error('Failed to load products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading products:', error);
    // Fallback to empty array
    return [];
  }
};

// Load services from JSON
export const loadServices = async (): Promise<Service[]> => {
  try {
    const response = await fetch('/data/services.json');
    if (!response.ok) {
      throw new Error('Failed to load services');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading services:', error);
    // Fallback to empty array
    return [];
  }
};

// Get products synchronously (for components that need immediate data)
export const getProductsSync = (): Product[] => {
  // This would be used for static data, but since we're using JSON,
  // components should use loadProducts() with useEffect
  return [];
};

// Get services synchronously (for components that need immediate data)
export const getServicesSync = (): Service[] => {
  // This would be used for static data, but since we're using JSON,
  // components should use loadServices() with useEffect
  return [];
};