import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EndConversationRequest {
  conversation_id: string
}

interface TavusEndConversationResponse {
  conversation_id: string
  status: string
  message?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { conversation_id }: EndConversationRequest = await req.json()

    // Validate required input
    if (!conversation_id || conversation_id.trim().length === 0) {
      throw new Error('conversation_id is required and cannot be empty')
    }

    // Retrieve Tavus API key from Supabase secrets
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY')

    if (!tavusApiKey) {
      console.error('❌ TAVUS_API_KEY not found in Supabase secrets')
      throw new Error('TAVUS_API_KEY not configured in Supabase secrets. Please set your Tavus API key using: supabase secrets set TAVUS_API_KEY=your_api_key')
    }

    console.log('🛑 Ending Tavus conversation...')
    console.log(`🆔 Conversation ID: ${conversation_id}`)

    // Call Tavus API to end the conversation
    const tavusResponse = await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}/end`, {
      method: 'POST',
      headers: {
        'x-api-key': tavusApiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'SafetyLearn-Platform/1.0'
      }
    })

    console.log(`📡 Tavus API response status: ${tavusResponse.status}`)

    if (!tavusResponse.ok) {
      const errorText = await tavusResponse.text()
      console.error(`❌ Tavus End Conversation API error: ${tavusResponse.status} - ${errorText}`)
      
      // Provide more specific error messages based on status code
      let errorMessage = `Tavus End Conversation API error: ${tavusResponse.status}`
      
      if (tavusResponse.status === 401) {
        errorMessage = 'Invalid access token. Please check your TAVUS_API_KEY in Supabase secrets.'
      } else if (tavusResponse.status === 403) {
        errorMessage = 'Access forbidden. Please verify your Tavus account permissions and API key.'
      } else if (tavusResponse.status === 404) {
        errorMessage = 'Conversation not found. The conversation may have already ended or the ID is invalid.'
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

    const tavusData: TavusEndConversationResponse = await tavusResponse.json()
    
    console.log('✅ Tavus conversation ended successfully')
    console.log(`🆔 Conversation ID: ${tavusData.conversation_id}`)
    console.log(`📊 Status: ${tavusData.status}`)

    // Return the conversation end details
    return new Response(
      JSON.stringify({
        success: true,
        conversation_id: tavusData.conversation_id,
        status: tavusData.status,
        message: tavusData.message || 'Conversation ended successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error in tavus-end-conversation function:', error)
    
    // Determine if this is a configuration error or runtime error
    const isConfigError = error.message.includes('not configured') || 
                         error.message.includes('TAVUS_') ||
                         error.message.includes('Invalid access token') ||
                         error.message.includes('supabase secrets set')
    
    const statusCode = isConfigError ? 500 : 400
    const errorType = isConfigError ? 'Configuration Error' : 'Request Error'
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorType,
        message: 'Failed to end Tavus conversation',
        details: error.message,
        timestamp: new Date().toISOString(),
        // Add helpful context for configuration errors
        ...(isConfigError && {
          help: 'Please configure your Tavus API credentials in Supabase secrets',
          required_secrets: ['TAVUS_API_KEY']
        })
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})