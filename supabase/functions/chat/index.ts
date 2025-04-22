import OpenAI from 'npm:openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  settings: {
    language: string;
    mood: string;
    personality: string;
    culturalVibe: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request
    if (!req.body) {
      throw new Error('Request body is empty');
    }

    const { message, settings }: ChatRequest = await req.json();

    if (!message || !settings) {
      throw new Error('Invalid request format');
    }

    // Validate OpenAI API key
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Create system prompt
    const systemPrompt = `You are a friendly AI assistant who speaks in ${settings.language} style. 
    Your current mood is ${settings.mood}, and you have a ${settings.personality} personality.
    Incorporate ${settings.culturalVibe} cultural references and expressions naturally.
    Keep responses concise (2-3 sentences) and engaging.
    If using Punjabi, mix it naturally with English for better understanding.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Chat function error:', error);
    
    // Return a structured error response
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request',
        status: 'error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});