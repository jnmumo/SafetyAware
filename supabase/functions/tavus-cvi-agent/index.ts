import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TavusCVIRequest {
  user_input: string
  conversation_id?: string // Optional: to continue an existing conversation
  user_name?: string // Optional: personalization
  user_age?: number // Optional: age-appropriate responses
}

interface TavusCVIResponse {
  conversation_url: string
  conversation_id: string
  status: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      user_input, 
      conversation_id, 
      user_name, 
      user_age 
    }: TavusCVIRequest = await req.json()

    // Validate required input
    if (!user_input || user_input.trim().length === 0) {
      throw new Error('user_input is required and cannot be empty')
    }

    // Retrieve Tavus configuration from Supabase secrets
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY')
    const tavusReplicaId = Deno.env.get('TAVUS_REPLICA_ID')
    const tavusPersonaId = Deno.env.get('TAVUS_PERSONA_ID')

    // Check for missing configuration with specific error messages
    if (!tavusApiKey) {
      console.error('❌ TAVUS_API_KEY not found in Supabase secrets')
      throw new Error('TAVUS_API_KEY not configured in Supabase secrets. Please set your Tavus API key using the Supabase Dashboard.')
    }
    if (!tavusReplicaId) {
      console.error('❌ TAVUS_REPLICA_ID not found in Supabase secrets')
      throw new Error('TAVUS_REPLICA_ID not configured in Supabase secrets. Please set your Tavus replica ID using the Supabase Dashboard.')
    }
    if (!tavusPersonaId) {
      console.error('❌ TAVUS_PERSONA_ID not found in Supabase secrets')
      throw new Error('TAVUS_PERSONA_ID not configured in Supabase secrets. Please set your Tavus persona ID using the Supabase Dashboard.')
    }

    console.log('🎬 Creating Tavus CVI conversation...')
    console.log(`📝 User input: ${user_input.substring(0, 100)}${user_input.length > 100 ? '...' : ''}`)
    console.log(`👤 User: ${user_name || 'Unknown'}, Age: ${user_age || 'Unknown'}`)
    
    // Create the conversation payload for Tavus API
    const conversationPayload = {
      replica_id: tavusReplicaId,
      persona_id: tavusPersonaId,
      conversation_name: `Safety Chat for ${user_name || 'User'}`,
      conversational_context: `You are a safety expert speaking with ${user_name || 'someone'} who is ${user_age ? `${user_age} years old` : 'a young person'}. ${user_input}`,
      custom_greeting: `Hello ${user_name || 'there'}! I'm here to help with any safety questions or concerns you might have. What would you like to talk about?`,
      properties: {
        max_call_duration: 500, // 30 minutes
        participant_left_timeout: 60,
        participant_absent_timeout: 300,
        enable_recording: false,
        enable_closed_captions: true,
        apply_greenscreen: false,
        language: "english"
      }
    }

    console.log('🔑 Making request to Tavus API...')
    console.log(`🔗 Using replica ID: ${tavusReplicaId.substring(0, 8)}...`)
    console.log(`🎭 Using persona ID: ${tavusPersonaId.substring(0, 8)}...`)

    // Call Tavus API with correct authentication
    const tavusResponse = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': tavusApiKey,
        'User-Agent': 'SafetyLearn-Platform/1.0'
      },
      body: JSON.stringify(conversationPayload)
    })

    console.log(`📡 Tavus API response status: ${tavusResponse.status}`)

    if (!tavusResponse.ok) {
      const errorText = await tavusResponse.text()
      console.error(`❌ Tavus CVI API error: ${tavusResponse.status} - ${errorText}`)
      
      // Provide more specific error messages based on status code
      let errorMessage = `Tavus CVI API error: ${tavusResponse.status}`
      
      if (tavusResponse.status === 401) {
        errorMessage = 'Invalid access token. Please verify your TAVUS_API_KEY is correct in Supabase secrets.'
      } else if (tavusResponse.status === 403) {
        errorMessage = 'Access forbidden. Please verify your Tavus account permissions and API key.'
      } else if (tavusResponse.status === 404) {
        errorMessage = 'Tavus API endpoint not found. Please check your replica ID and persona ID.'
      } else if (tavusResponse.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a few moments.'
      } else if (tavusResponse.status >= 500) {
        errorMessage = 'Tavus service temporarily unavailable. Please try again later.'
      }
      
      // Include response details if available
      if (errorText) {
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.message) {
            errorMessage += ` Details: ${errorJson.message}`
          }
        } catch {
          // If not JSON, include raw text
          errorMessage += ` Details: ${errorText}`
        }
      }
      
      throw new Error(errorMessage)
    }

    const tavusData: TavusCVIResponse = await tavusResponse.json()
    
    console.log('✅ Tavus CVI conversation created successfully')
    console.log(`🔗 Conversation URL: ${tavusData.conversation_url}`)
    console.log(`🆔 Conversation ID: ${tavusData.conversation_id}`)

    // Return the conversation details
    return new Response(
      JSON.stringify({
        success: true,
        conversation_url: tavusData.conversation_url,
        conversation_id: tavusData.conversation_id,
        status: tavusData.status || 'created',
        message: 'Tavus CVI conversation created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error in tavus-cvi-agent function:', error)
    
    // Determine if this is a configuration error or runtime error
    const isConfigError = error.message.includes('not configured') || 
                         error.message.includes('TAVUS_') ||
                         error.message.includes('Invalid access token') ||
                         error.message.includes('Supabase Dashboard')
    
    const statusCode = isConfigError ? 500 : 400
    const errorType = isConfigError ? 'Configuration Error' : 'Request Error'
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorType,
        message: 'Failed to create Tavus CVI conversation',
        details: error.message,
        timestamp: new Date().toISOString(),
        // Add helpful context for configuration errors
        ...(isConfigError && {
          help: 'Please configure your Tavus API credentials in Supabase Dashboard under Settings > Edge Functions > Secrets',
          required_secrets: ['TAVUS_API_KEY', 'TAVUS_REPLICA_ID', 'TAVUS_PERSONA_ID']
        })
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})