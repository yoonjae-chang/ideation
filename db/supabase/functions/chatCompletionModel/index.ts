// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { OpenAI } from "npm:openai@4.8.0"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
})

Deno.serve(async (req) => {
  // Set CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with timeout
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: req.headers.get('Authorization')! },
        }
      }
    )

    // Verify user authentication with timeout
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    )
    
    const { error: authError } = await Promise.race([authPromise, timeoutPromise]) as any
    if (authError) {
      console.error('Auth error:', authError.message)
      return new Response(JSON.stringify({
        error: `Authentication failed: ${authError.message}`
      }), {
        status: 401,
        headers: corsHeaders
      })
    }

    // Parse request body with validation
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: corsHeaders
      })
    }

    const { 
      systemPrompt, 
      userPrompt, 
      model = "gpt-4o-mini", 
      temperature = 1,
      maxTokens = 8000,
      expectArray = false
    } = requestBody

    // Validate required fields
    if (!systemPrompt || !userPrompt) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: systemPrompt and userPrompt'
      }), {
        status: 400,
        headers: corsHeaders
      })
    }

    console.log('Processing request:', { model, temperature, maxTokens, expectArray })
    console.log('System prompt length:', systemPrompt.length)
    console.log('User prompt length:', userPrompt.length)

    // Create OpenAI completion with conditional response format
    const completionPromise = openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
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

    // Add timeout to OpenAI request (25 seconds to stay under Edge Function limit)
    const completionTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OpenAI request timeout')), 100000)
    )

    const response = await Promise.race([completionPromise, completionTimeoutPromise]) as any
    
    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    console.log('OpenAI response received successfully')
    console.log('Response length:', response.choices[0].message.content)

    return new Response(JSON.stringify({
      success: true,
      data: response.choices[0].message.content,
      usage: response.usage,
      model: response.model
    }), {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Function error:', error)
    
    // Determine appropriate error status and message
    let status = 500
    let errorMessage = 'Internal server error'
    
    if (error.message.includes('timeout')) {
      status = 408
      errorMessage = 'Request timeout - please try again'
    } else if (error.message.includes('rate_limit')) {
      status = 429
      errorMessage = 'Rate limit exceeded - please wait and try again'
    } else if (error.message.includes('insufficient_quota')) {
      status = 402
      errorMessage = 'API quota exceeded'
    } else if (error.message.includes('Authentication')) {
      status = 401
      errorMessage = error.message
    }

    return new Response(JSON.stringify({
      error: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status,
      headers: corsHeaders
    })
  }
})
