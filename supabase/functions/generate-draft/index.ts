import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Gemini JSON Schema
const LETTER_SCHEMA = {
  type: 'object',
  required: ['schema_version', 'title', 'date', 'content'],
  properties: {
    schema_version: { type: 'string' },
    title: { type: 'string' },
    date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    sender_name: { type: 'string' },
    sender_address: { type: 'string' },
    attorney_name: { type: 'string' },
    recipient_name: { type: 'string' },
    matter: { type: 'string' },
    resolution: { type: 'string' },
    jurisdiction: { type: 'string' },
    tone: { type: 'string' },
    content: { type: 'string' },
    summary: { type: 'string' },
    action_deadline: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    metadata: {
      type: 'object',
      properties: {
        estimated_read_time_seconds: { type: 'number' },
        structured_sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              heading: { type: 'string' },
              body: { type: 'string' }
            }
          }
        }
      }
    }
  }
}

function buildGeminiPrompt(inputs: any): string {
  const systemPrompt = `You are a professional legal drafting assistant. Produce a single JSON object exactly matching the provided schema. No extra text, no explanation. Tone: "${inputs.tone || 'firm but professional'}" Use YYYY-MM-DD dates.

JSON Schema: ${JSON.stringify(LETTER_SCHEMA)}

Create a professional legal letter with the following structure:
1. Proper legal letterhead format
2. Date and recipient information
3. Clear statement of the matter
4. Professional but firm tone
5. Specific resolution demands
6. Appropriate legal language and formatting`

  const userPrompt = `Create a legal letter with these details:
- Title: ${inputs.title || 'Legal Matter'}
- Sender: ${inputs.sender_name}
- Sender Address: ${inputs.sender_address}
- Attorney/Firm: ${inputs.attorney_name}
- Recipient: ${inputs.recipient_name}
- Matter: ${inputs.matter}
- Desired Resolution: ${inputs.resolution}
- Jurisdiction: ${inputs.jurisdiction || 'General'}
- Tone: ${inputs.tone || 'firm but professional'}
- Date: ${inputs.date || new Date().toISOString().split('T')[0]}

Additional Notes: ${inputs.extra_notes || 'None'}

Produce the JSON now.`

  return `${systemPrompt}\n\n${userPrompt}`
}

function extractFirstJson(text: string): string {
  const jsonStart = text.indexOf('{')
  if (jsonStart === -1) throw new Error('No JSON found in response')
  
  let braceCount = 0
  let jsonEnd = jsonStart
  
  for (let i = jsonStart; i < text.length; i++) {
    if (text[i] === '{') braceCount++
    if (text[i] === '}') braceCount--
    if (braceCount === 0) {
      jsonEnd = i
      break
    }
  }
  
  return text.substring(jsonStart, jsonEnd + 1)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
      Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const inputs = await req.json()

    // Validate required fields
    const requiredFields = ['sender_name', 'attorney_name', 'recipient_name', 'matter', 'resolution']
    for (const field of requiredFields) {
      if (!inputs[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Build Gemini prompt
    const prompt = buildGeminiPrompt(inputs)

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.0,
            maxOutputTokens: 1200,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      throw new Error('No content generated by Gemini')
    }

    // Extract and parse JSON
    const jsonString = extractFirstJson(generatedText)
    const aiOutput = JSON.parse(jsonString)

    // Basic validation
    if (!aiOutput.content || !aiOutput.title) {
      throw new Error('Invalid AI output: missing required fields')
    }

    // Insert letter into database
    const { data: letter, error: insertError } = await supabaseClient
      .from('letters')
      .insert([{
        user_id: user.id,
        title: aiOutput.title || inputs.title || 'Untitled Letter',
        sender_name: aiOutput.sender_name || inputs.sender_name,
        sender_address: aiOutput.sender_address || inputs.sender_address,
        attorney_name: aiOutput.attorney_name || inputs.attorney_name,
        recipient_name: aiOutput.recipient_name || inputs.recipient_name,
        matter: aiOutput.matter || inputs.matter,
        resolution: aiOutput.resolution || inputs.resolution,
        content: aiOutput.content,
        ai_meta: aiOutput,
        status: 'received'
      }])
      .select()
      .single()

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`)
    }

    return new Response(
      JSON.stringify({ letter }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-draft:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})