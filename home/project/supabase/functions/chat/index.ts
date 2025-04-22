import OpenAI from 'npm:openai@4.28.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, settings }: ChatRequest = await req.json();

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Create a dynamic system prompt based on settings
    const systemPrompt = `You are a friendly AI assistant who speaks in ${settings.language} style. 
    Your current mood is ${settings.mood}, and you have the personality of a ${settings.personality}.
    You should incorporate ${settings.culturalVibe} cultural references when appropriate.
    Keep responses concise (max 2-3 sentences) and engaging.`;

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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});