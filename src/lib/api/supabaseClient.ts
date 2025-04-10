
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Helper function to generate a unique ID
export const generateId = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
};

// CSRF Protection - Generate and store a token
export const generateCSRFToken = (): string => {
  const token = generateId();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

// CSRF Protection - Validate a token
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = sessionStorage.getItem('csrf_token');
  return token === storedToken;
};

// Helper function for secure API requests
export const secureRequest = async <T>(
  url: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
  data?: any
): Promise<T> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token for non-GET requests
    if (method !== 'GET') {
      headers['X-CSRF-Token'] = generateCSRFToken();
    }
    
    // Get session token if user is logged in
    const { data: authData } = await supabase.auth.getSession();
    if (authData.session) {
      headers['Authorization'] = `Bearer ${authData.session.access_token}`;
    }
    
    // Set up request options
    const options: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }
    
    // Make request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    options.signal = controller.signal;
    
    const response = await fetch(url, options);
    clearTimeout(timeoutId);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    
    // Handle abort errors
    if (error.name === 'AbortError') {
      toast({
        title: "Request timeout",
        description: "The server is taking too long to respond. Please try again later.",
        variant: "destructive"
      });
      throw new Error('Request timed out');
    }
    
    // Handle other errors
    toast({
      title: "Error",
      description: error.message || 'An unexpected error occurred',
      variant: "destructive"
    });
    throw error;
  }
};

export { supabase };
