
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Store API key in environment variable - not hardcoded
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Rate limiting implementation
const ipRequestCount = new Map<string, { count: number, timestamp: number }>();
const MAX_REQUESTS = 30; // Maximum requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // Window in milliseconds (1 minute)

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const ipData = ipRequestCount.get(ip);
  
  if (!ipData) {
    ipRequestCount.set(ip, { count: 1, timestamp: now });
    return false;
  }
  
  // Reset counter if window has passed
  if (now - ipData.timestamp > RATE_LIMIT_WINDOW) {
    ipRequestCount.set(ip, { count: 1, timestamp: now });
    return false;
  }
  
  // Increment counter and check if over limit
  if (ipData.count >= MAX_REQUESTS) {
    return true;
  }
  
  ipData.count++;
  return false;
}

// Helper function to sanitize input
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Basic XSS prevention for strings
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  } else if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  } else if (input !== null && typeof input === 'object') {
    const sanitizedObj: {[key: string]: any} = {};
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[key] = sanitizeInput(value);
    }
    return sanitizedObj;
  }
  return input;
}

// Helper function to validate messages array
function validateMessages(messages: any[]): boolean {
  if (!Array.isArray(messages)) return false;
  
  // Check if messages have required properties
  return messages.every(msg => 
    typeof msg === 'object' && 
    msg !== null && 
    typeof msg.role === 'string' && 
    typeof msg.content === 'string' && 
    ['system', 'user', 'assistant'].includes(msg.role)
  );
}

serve(async (req) => {
  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Implement rate limiting
  if (isRateLimited(clientIP)) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '60'
        } 
      }
    );
  }

  try {
    // Validate API key
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: API key not configured' }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { 
          status: 415, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const { messages } = requestBody;

    // Validate messages
    if (!messages || !validateMessages(messages)) {
      console.error('Invalid messages format:', messages);
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Sanitize input
    const sanitizedMessages = sanitizeInput(messages);

    // Convert messages to Gemini format
    // We need to extract user messages and system prompt
    let systemPrompt = '';
    const formattedMessages = [];

    for (const message of sanitizedMessages) {
      if (message.role === 'system') {
        systemPrompt = message.content;
      } else {
        formattedMessages.push({
          role: message.role,
          parts: [{ text: message.content }]
        });
      }
    }

    // If we have a system prompt, add it to the first user message or create one
    if (systemPrompt && formattedMessages.length > 0) {
      // Find the first user message
      const firstUserIndex = formattedMessages.findIndex(msg => msg.role === 'user');
      if (firstUserIndex >= 0) {
        // Prepend the system prompt to the first user message
        const userMessage = formattedMessages[firstUserIndex].parts[0].text;
        formattedMessages[firstUserIndex].parts[0].text = `${systemPrompt}\n\n${userMessage}`;
      }
    }

    // Format for Gemini API
    const geminiPayload = {
      contents: formattedMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: msg.parts
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    console.log('Sending to Gemini API:', JSON.stringify(geminiPayload));

    try {
      // Add a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geminiPayload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        return new Response(
          JSON.stringify({ 
            error: `Gemini API error: ${response.status}`, 
            details: errorText 
          }),
          { 
            status: 502, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      const geminiResponse = await response.json();
      console.log('Gemini API response:', JSON.stringify(geminiResponse));

      // Check for errors in the Gemini response
      if (geminiResponse.error) {
        console.error('Gemini response contains error:', geminiResponse.error);
        return new Response(
          JSON.stringify({ error: geminiResponse.error.message || 'Error in Gemini API response' }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      // Check if we actually have content
      if (!geminiResponse.candidates || !geminiResponse.candidates[0] || !geminiResponse.candidates[0].content) {
        console.error('No content in Gemini response:', geminiResponse);
        return new Response(
          JSON.stringify({ error: 'No content in Gemini API response' }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      // Format response to match OpenAI structure for compatibility with frontend
      const formattedResponse = {
        choices: [{
          message: {
            role: 'assistant',
            content: geminiResponse.candidates[0].content.parts[0].text || 'No response generated'
          }
        }]
      };

      return new Response(
        JSON.stringify(formattedResponse),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          } 
        }
      );
    } catch (error) {
      console.error('Error making Gemini API request:', error);
      
      // Handle AbortController timeout
      if (error.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Request timeout', details: 'The request to the Gemini service timed out' }),
          { 
            status: 504, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Error communicating with Gemini service', details: error.message }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
