// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { OpenAI } from "npm:openai@4.8.0"
import { createClient } from 'jsr:@supabase/supabase-js@2'

  
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
})

Deno.serve(async (req)=>{
  
   try {
   const supabase = createClient(
     Deno.env.get('SUPABASE_URL') ?? '',
     Deno.env.get('SUPABASE_ANON_KEY') ?? '',
     { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
   )

   const { error } = await supabase.auth.getUser();
   if (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    })
   }

  
  const { systemPrompt, userPrompt, model = "4.0-mini", temperature = 1 } = await req.json();


  const response = await openai.chat.completions.create({
    model: model,
    temperature: temperature,
    response_format: { "type": "json" },
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userPrompt
      }
    ]
  })
  return new Response(JSON.stringify({
    fullResponse: response,
    data: response.choices[0].message.content
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    }
  })
 } catch (error) {
  return new Response(JSON.stringify({
    error: error.message
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    }
  })
 }
})