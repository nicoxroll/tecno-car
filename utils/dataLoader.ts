import { Product, Service } from '../types';
import { supabase } from '../services/supabase';

// Load products from Supabase
export const loadProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error loading products from Supabase:', error);
    // Fallback to local JSON if Supabase fails (optional, or just return empty)
    try {
      const response = await fetch('/data/products.json');
      if (!response.ok) throw new Error('Failed to load local products');
      return await response.json();
    } catch (localError) {
      console.error('Error loading local products:', localError);
      return [];
    }
  }
};

// Load services from Supabase
export const loadServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error loading services from Supabase:', error);
    // Fallback to local JSON
    try {
      const response = await fetch('/data/services.json');
      if (!response.ok) throw new Error('Failed to load local services');
      return await response.json();
    } catch (localError) {
      console.error('Error loading local services:', localError);
      return [];
    }
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