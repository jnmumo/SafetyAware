import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatRequest {
  message: string
  userAge: number
  conversationHistory?: Array<{
    role: 'user' | 'model'
    parts: Array<{ text: string }>
  }>
}

// Comprehensive global emergency contacts database
const emergencyContacts = {
  // Africa
  'kenya': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '116',
    genderViolence: '1195',
    description: 'Kenya Emergency Services'
  },
  'uganda': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '116',
    description: 'Uganda Emergency Services'
  },
  'tanzania': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '116',
    description: 'Tanzania Emergency Services'
  },
  'nigeria': {
    emergency: '199 or 112',
    police: '199',
    fire: '199',
    ambulance: '199',
    childline: '116',
    description: 'Nigeria Emergency Services'
  },
  'south africa': {
    emergency: '10111 or 112',
    police: '10111',
    fire: '10177',
    ambulance: '10177',
    childline: '116',
    genderViolence: '0800 150 150',
    description: 'South Africa Emergency Services'
  },
  'ghana': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '116',
    description: 'Ghana Emergency Services'
  },
  'ethiopia': {
    emergency: '991 or 112',
    police: '991',
    fire: '993',
    ambulance: '907',
    childline: '116',
    description: 'Ethiopia Emergency Services'
  },
  'rwanda': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '116',
    description: 'Rwanda Emergency Services'
  },
  'morocco': {
    emergency: '15 or 112',
    police: '19',
    fire: '15',
    ambulance: '15',
    childline: '116',
    description: 'Morocco Emergency Services'
  },
  'egypt': {
    emergency: '122 or 112',
    police: '122',
    fire: '180',
    ambulance: '123',
    childline: '16000',
    description: 'Egypt Emergency Services'
  },
  'botswana': {
    emergency: '999 or 112',
    police: '999',
    fire: '998',
    ambulance: '997',
    childline: '116',
    description: 'Botswana Emergency Services'
  },
  'zambia': {
    emergency: '999 or 112',
    police: '999',
    fire: '993',
    ambulance: '992',
    childline: '116',
    description: 'Zambia Emergency Services'
  },
  'zimbabwe': {
    emergency: '999 or 112',
    police: '995',
    fire: '993',
    ambulance: '994',
    childline: '116',
    description: 'Zimbabwe Emergency Services'
  },
  
  // North America
  'united states': {
    emergency: '911',
    police: '911',
    fire: '911',
    ambulance: '911',
    childline: '1-800-4-A-CHILD (1-800-422-4453)',
    suicide: '988',
    description: 'United States Emergency Services'
  },
  'usa': {
    emergency: '911',
    police: '911',
    fire: '911',
    ambulance: '911',
    childline: '1-800-4-A-CHILD (1-800-422-4453)',
    suicide: '988',
    description: 'United States Emergency Services'
  },
  'america': {
    emergency: '911',
    police: '911',
    fire: '911',
    ambulance: '911',
    childline: '1-800-4-A-CHILD (1-800-422-4453)',
    suicide: '988',
    description: 'United States Emergency Services'
  },
  'canada': {
    emergency: '911',
    police: '911',
    fire: '911',
    ambulance: '911',
    childline: '1-800-668-6868',
    suicide: '1-833-456-4566',
    description: 'Canada Emergency Services'
  },
  'mexico': {
    emergency: '911',
    police: '911',
    fire: '911',
    ambulance: '911',
    childline: '01 800 917 4444',
    description: 'Mexico Emergency Services'
  },
  
  // Europe
  'united kingdom': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '0800 1111',
    domestic: '0808 2000 247',
    description: 'United Kingdom Emergency Services'
  },
  'uk': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '0800 1111',
    domestic: '0808 2000 247',
    description: 'United Kingdom Emergency Services'
  },
  'britain': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '0800 1111',
    domestic: '0808 2000 247',
    description: 'United Kingdom Emergency Services'
  },
  'england': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '0800 1111',
    domestic: '0808 2000 247',
    description: 'United Kingdom Emergency Services'
  },
  'scotland': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '0800 1111',
    domestic: '0808 2000 247',
    description: 'United Kingdom Emergency Services'
  },
  'wales': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '0800 1111',
    domestic: '0808 2000 247',
    description: 'United Kingdom Emergency Services'
  },
  'ireland': {
    emergency: '999 or 112',
    police: '999',
    fire: '999',
    ambulance: '999',
    childline: '116 111',
    description: 'Ireland Emergency Services'
  },
  'germany': {
    emergency: '112',
    police: '110',
    fire: '112',
    ambulance: '112',
    childline: '116 111',
    description: 'Germany Emergency Services'
  },
  'france': {
    emergency: '112',
    police: '17',
    fire: '18',
    ambulance: '15',
    childline: '119',
    description: 'France Emergency Services'
  },
  'spain': {
    emergency: '112',
    police: '091',
    fire: '080',
    ambulance: '061',
    childline: '116 111',
    description: 'Spain Emergency Services'
  },
  'italy': {
    emergency: '112',
    police: '113',
    fire: '115',
    ambulance: '118',
    childline: '114',
    description: 'Italy Emergency Services'
  },
  'netherlands': {
    emergency: '112',
    police: '112',
    fire: '112',
    ambulance: '112',
    childline: '0800 0432',
    description: 'Netherlands Emergency Services'
  },
  'belgium': {
    emergency: '112',
    police: '101',
    fire: '112',
    ambulance: '112',
    childline: '103',
    description: 'Belgium Emergency Services'
  },
  'switzerland': {
    emergency: '112',
    police: '117',
    fire: '118',
    ambulance: '144',
    childline: '147',
    description: 'Switzerland Emergency Services'
  },
  'austria': {
    emergency: '112',
    police: '133',
    fire: '122',
    ambulance: '144',
    childline: '147',
    description: 'Austria Emergency Services'
  },
  'sweden': {
    emergency: '112',
    police: '112',
    fire: '112',
    ambulance: '112',
    childline: '116 111',
    description: 'Sweden Emergency Services'
  },
  'norway': {
    emergency: '112',
    police: '112',
    fire: '110',
    ambulance: '113',
    childline: '116 111',
    description: 'Norway Emergency Services'
  },
  'denmark': {
    emergency: '112',
    police: '114',
    fire: '112',
    ambulance: '112',
    childline: '116 111',
    description: 'Denmark Emergency Services'
  },
  'finland': {
    emergency: '112',
    police: '112',
    fire: '112',
    ambulance: '112',
    childline: '116 111',
    description: 'Finland Emergency Services'
  },
  'poland': {
    emergency: '112',
    police: '997',
    fire: '998',
    ambulance: '999',
    childline: '116 111',
    description: 'Poland Emergency Services'
  },
  'russia': {
    emergency: '112',
    police: '102',
    fire: '101',
    ambulance: '103',
    childline: '8-800-2000-122',
    description: 'Russia Emergency Services'
  },
  
  // Asia
  'india': {
    emergency: '112',
    police: '100',
    fire: '101',
    ambulance: '108',
    childline: '1098',
    women: '1091',
    description: 'India Emergency Services'
  },
  'china': {
    emergency: '110',
    police: '110',
    fire: '119',
    ambulance: '120',
    childline: '12355',
    description: 'China Emergency Services'
  },
  'japan': {
    emergency: '110 (Police) or 119 (Fire/Medical)',
    police: '110',
    fire: '119',
    ambulance: '119',
    childline: '0120-99-7777',
    description: 'Japan Emergency Services'
  },
  'south korea': {
    emergency: '112 or 119',
    police: '112',
    fire: '119',
    ambulance: '119',
    childline: '1391',
    description: 'South Korea Emergency Services'
  },
  'thailand': {
    emergency: '191 or 1669',
    police: '191',
    fire: '199',
    ambulance: '1669',
    childline: '1387',
    description: 'Thailand Emergency Services'
  },
  'vietnam': {
    emergency: '113 or 115',
    police: '113',
    fire: '114',
    ambulance: '115',
    childline: '111',
    description: 'Vietnam Emergency Services'
  },
  'philippines': {
    emergency: '911',
    police: '117',
    fire: '116',
    ambulance: '911',
    childline: '163',
    description: 'Philippines Emergency Services'
  },
  'indonesia': {
    emergency: '112',
    police: '110',
    fire: '113',
    ambulance: '118',
    childline: '129',
    description: 'Indonesia Emergency Services'
  },
  'malaysia': {
    emergency: '999',
    police: '999',
    fire: '994',
    ambulance: '999',
    childline: '15999',
    description: 'Malaysia Emergency Services'
  },
  'singapore': {
    emergency: '999 or 995',
    police: '999',
    fire: '995',
    ambulance: '995',
    childline: '1800-777-0000',
    description: 'Singapore Emergency Services'
  },
  'pakistan': {
    emergency: '15',
    police: '15',
    fire: '16',
    ambulance: '1122',
    childline: '1121',
    description: 'Pakistan Emergency Services'
  },
  'bangladesh': {
    emergency: '999',
    police: '999',
    fire: '9555555',
    ambulance: '199',
    childline: '1098',
    description: 'Bangladesh Emergency Services'
  },
  'sri lanka': {
    emergency: '119',
    police: '119',
    fire: '110',
    ambulance: '110',
    childline: '1929',
    description: 'Sri Lanka Emergency Services'
  },
  
  // Middle East
  'saudi arabia': {
    emergency: '999 or 112',
    police: '999',
    fire: '998',
    ambulance: '997',
    childline: '116',
    description: 'Saudi Arabia Emergency Services'
  },
  'uae': {
    emergency: '999 or 112',
    police: '999',
    fire: '997',
    ambulance: '998',
    childline: '116',
    description: 'UAE Emergency Services'
  },
  'united arab emirates': {
    emergency: '999 or 112',
    police: '999',
    fire: '997',
    ambulance: '998',
    childline: '116',
    description: 'UAE Emergency Services'
  },
  'israel': {
    emergency: '112',
    police: '100',
    fire: '102',
    ambulance: '101',
    childline: '1201',
    description: 'Israel Emergency Services'
  },
  'turkey': {
    emergency: '112',
    police: '155',
    fire: '110',
    ambulance: '112',
    childline: '183',
    description: 'Turkey Emergency Services'
  },
  'iran': {
    emergency: '110',
    police: '110',
    fire: '125',
    ambulance: '115',
    childline: '123',
    description: 'Iran Emergency Services'
  },
  'iraq': {
    emergency: '104',
    police: '104',
    fire: '115',
    ambulance: '122',
    childline: '116',
    description: 'Iraq Emergency Services'
  },
  'jordan': {
    emergency: '911 or 112',
    police: '911',
    fire: '911',
    ambulance: '911',
    childline: '116',
    description: 'Jordan Emergency Services'
  },
  'lebanon': {
    emergency: '112',
    police: '112',
    fire: '175',
    ambulance: '140',
    childline: '147',
    description: 'Lebanon Emergency Services'
  },
  
  // Oceania
  'australia': {
    emergency: '000',
    police: '000',
    fire: '000',
    ambulance: '000',
    childline: '1800 55 1800',
    domestic: '1800 737 732',
    description: 'Australia Emergency Services'
  },
  'new zealand': {
    emergency: '111',
    police: '111',
    fire: '111',
    ambulance: '111',
    childline: '0800 543 754',
    description: 'New Zealand Emergency Services'
  },
  'fiji': {
    emergency: '911',
    police: '917',
    fire: '910',
    ambulance: '911',
    childline: '1325',
    description: 'Fiji Emergency Services'
  },
  
  // South America
  'brazil': {
    emergency: '190 or 193',
    police: '190',
    fire: '193',
    ambulance: '192',
    childline: '100',
    description: 'Brazil Emergency Services'
  },
  'argentina': {
    emergency: '911',
    police: '911',
    fire: '100',
    ambulance: '107',
    childline: '102',
    description: 'Argentina Emergency Services'
  },
  'chile': {
    emergency: '133',
    police: '133',
    fire: '132',
    ambulance: '131',
    childline: '147',
    description: 'Chile Emergency Services'
  },
  'colombia': {
    emergency: '123',
    police: '123',
    fire: '119',
    ambulance: '125',
    childline: '141',
    description: 'Colombia Emergency Services'
  },
  'peru': {
    emergency: '105',
    police: '105',
    fire: '116',
    ambulance: '117',
    childline: '100',
    description: 'Peru Emergency Services'
  },
  'venezuela': {
    emergency: '171',
    police: '171',
    fire: '171',
    ambulance: '171',
    childline: '0800-FAMILIA',
    description: 'Venezuela Emergency Services'
  },
  'ecuador': {
    emergency: '911',
    police: '911',
    fire: '911',
    ambulance: '911',
    childline: '1-800-DENUNCIA',
    description: 'Ecuador Emergency Services'
  },
  'uruguay': {
    emergency: '911',
    police: '109',
    fire: '104',
    ambulance: '105',
    childline: '0800-5050',
    description: 'Uruguay Emergency Services'
  },
  
  // Default/International
  'international': {
    emergency: '112 (International Emergency Number)',
    police: 'Contact local authorities',
    fire: 'Contact local authorities',
    ambulance: 'Contact local authorities',
    childline: 'Contact local child protection services',
    description: 'International Emergency Guidelines'
  }
};

function getEmergencyContactsForCountry(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Check if the message is asking for emergency contacts
  if (!lowerMessage.includes('emergency') && !lowerMessage.includes('contact') && !lowerMessage.includes('number')) {
    return null;
  }
  
  // Extract country from message or provide general guidance
  let country = 'international';
  let foundCountry = false;
  
  // Check for specific country mentions
  for (const countryName of Object.keys(emergencyContacts)) {
    if (lowerMessage.includes(countryName)) {
      country = countryName;
      foundCountry = true;
      break;
    }
  }
  
  // Additional country detection for common variations
  if (!foundCountry) {
    if (lowerMessage.includes('america') || lowerMessage.includes('usa') || lowerMessage.includes('united states')) {
      country = 'united states';
      foundCountry = true;
    } else if (lowerMessage.includes('britain') || lowerMessage.includes('england') || lowerMessage.includes('scotland') || lowerMessage.includes('wales')) {
      country = 'united kingdom';
      foundCountry = true;
    } else if (lowerMessage.includes('my country') || lowerMessage.includes('here') || lowerMessage.includes('where i live')) {
      // If they don't specify a country, provide international guidance
      country = 'international';
    }
  }
  
  const contacts = emergencyContacts[country as keyof typeof emergencyContacts];
  
  let response = `🚨 ${contacts.description}\n\n`;
  response += `🆘 General Emergency: ${contacts.emergency}\n`;
  response += `👮 Police: ${contacts.police}\n`;
  response += `🔥 Fire Department: ${contacts.fire}\n`;
  response += `🚑 Ambulance/Medical: ${contacts.ambulance}\n`;
  
  if (contacts.childline) {
    response += `👶 Child Helpline: ${contacts.childline}\n`;
  }
  
  if (contacts.suicide) {
    response += `🧠 Suicide Prevention: ${contacts.suicide}\n`;
  }
  
  if (contacts.domestic) {
    response += `🏠 Domestic Violence: ${contacts.domestic}\n`;
  }
  
  if (contacts.genderViolence) {
    response += `⚖️ Gender Violence: ${contacts.genderViolence}\n`;
  }
  
  if (contacts.women) {
    response += `👩 Women's Helpline: ${contacts.women}\n`;
  }
  
  response += `\n⚠️ IMPORTANT: In a real emergency, call immediately! These numbers are available 24/7.\n\n`;
  
  if (country === 'international' && !foundCountry) {
    response += `I couldn't identify your specific country from your message. Please tell me which country you're in (for example: "What are emergency numbers for Kenya?" or "Emergency contacts for India") and I'll provide the exact numbers for your location.\n\n`;
    response += `📍 Most countries use 112 as an international emergency number, but each country also has its own specific numbers that may work better.`;
  } else if (country === 'international') {
    response += `These are general international guidelines. For specific emergency numbers in your country, please tell me which country you're in and I'll provide the exact local numbers.`;
  } else {
    response += `These are the official emergency numbers for ${country.charAt(0).toUpperCase() + country.slice(1)}. Save these numbers in your phone and make sure a trusted adult knows them too.\n\n`;
    response += `💡 TIP: You can also ask me for emergency numbers for any other country by saying "What are emergency numbers for [country name]?"`;
  }
  
  return response;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, userAge, conversationHistory = [] }: ChatRequest = await req.json()

    // Check if this is an emergency contacts request
    const emergencyResponse = getEmergencyContactsForCountry(message);
    if (emergencyResponse) {
      return new Response(
        JSON.stringify({ 
          response: emergencyResponse,
          conversationHistory: [
            ...conversationHistory,
            { role: 'user', parts: [{ text: message }] },
            { role: 'model', parts: [{ text: emergencyResponse }] }
          ]
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Create age-appropriate system prompt with specific topics
    const getSystemPrompt = (age: number) => {
      const baseInstructions = `
      CRITICAL FORMATTING RULE: Never use ** (double asterisks) for bold text in your responses. Instead:
      - Use plain text for emphasis
      - Use ALL CAPS sparingly for very important warnings
      - Use simple formatting like dashes or bullet points for lists
      - Keep text clean and readable without markdown formatting
      
      This is extremely important - no ** symbols should ever appear in your responses.`

      if (age >= 5 && age <= 8) {
        return `You are a friendly AI safety assistant for young children (ages 5-8). ${baseInstructions}

        You MUST ONLY discuss these specific safety topics:

        ALLOWED TOPICS ONLY:
        1. Stranger danger - Teaching about not talking to strangers, staying close to trusted adults
        2. Good touch/bad touch - Age-appropriate body safety, private parts, saying no to uncomfortable touch
        3. Saying no - Teaching children it's okay to say no when they feel uncomfortable
        4. Safe adults - Identifying trusted adults they can talk to (parents, teachers, family)
        5. Emergency contacts - Providing country-specific emergency numbers when asked

        Your responses should be:
        - Simple and easy to understand with basic vocabulary
        - Very short (1-2 sentences maximum)
        - Use encouraging phrases like "Great question!" or "You're being so smart!"
        - Always emphasize telling a trusted adult when something feels wrong
        - Use positive, reassuring language
        - Avoid scary or detailed descriptions

        IMPORTANT: If asked about topics outside of stranger danger, good/bad touch, saying no, safe adults, or emergency contacts, politely redirect the conversation back to these five topics only. Say something like "That's a good question, but let's talk about staying safe with strangers/touch/saying no/trusted adults instead."`
      } else if (age >= 9 && age <= 12) {
        return `You are a helpful AI safety assistant for children (ages 9-12). ${baseInstructions}

        You MUST ONLY discuss these specific safety topics:

        ALLOWED TOPICS ONLY:
        1. Bullying - Recognizing bullying, how to respond, getting help from adults
        2. Online safety - Basic internet safety, not sharing personal information, safe websites
        3. Body boundaries - Understanding personal space, consent, appropriate vs inappropriate touch
        4. Emergencies - What to do in emergency situations, calling emergency services, emergency contacts
        5. Emergency contacts - Providing country-specific emergency numbers when asked

        Your responses should be:
        - Clear and informative but age-appropriate
        - Provide practical tips they can remember and use
        - Keep responses concise (2-3 sentences)
        - Always remind them to talk to trusted adults about concerns
        - Use encouraging and supportive language

        IMPORTANT: If asked about topics outside of bullying, online safety, body boundaries, emergencies, or emergency contacts, politely redirect the conversation back to these five topics only. Say something like "That's important, but let's focus on bullying/online safety/body boundaries/emergencies instead."`
      } else if (age >= 13 && age <= 15) {
        return `You are a knowledgeable AI safety assistant for teenagers (ages 13-15). ${baseInstructions}

        You MUST ONLY discuss these specific safety topics:

        ALLOWED TOPICS ONLY:
        1. Peer pressure - Recognizing and resisting negative peer pressure, making good choices
        2. Toxic friendships - Identifying unhealthy relationships, setting boundaries with friends
        3. Confidence - Building self-esteem, believing in yourself, standing up for your values
        4. Self-worth - Understanding your value, not letting others define you, positive self-image
        5. Emergency contacts - Providing country-specific emergency numbers when asked

        Your responses should be:
        - Comprehensive and detailed but focused on these topics
        - Respect their growing independence while providing guidance
        - Provide actionable advice and strategies
        - Address emotional and social aspects appropriately
        - Use mature but supportive language

        IMPORTANT: If asked about topics outside of peer pressure, toxic friendships, confidence, self-worth, or emergency contacts, politely redirect the conversation back to these five topics only. Say something like "I understand that's important, but let's focus on peer pressure/toxic friendships/confidence/self-worth instead."`
      } else if (age >= 16 && age <= 19) {
        return `You are an expert AI safety assistant for young adults (ages 16-19). ${baseInstructions}

        You MUST ONLY discuss these specific safety topics:

        ALLOWED TOPICS ONLY:
        1. Consent - Understanding consent in all contexts, respecting boundaries, saying no
        2. Digital abuse - Recognizing online harassment, cyberstalking, digital manipulation
        3. Reporting abuse - How and where to report various forms of abuse, getting help
        4. Emotional boundaries - Setting healthy emotional limits, protecting mental health
        5. Emergency contacts - Providing country-specific emergency numbers when asked

        Your responses should be:
        - Detailed and comprehensive within these topic areas
        - Treat them as emerging adults while providing guidance
        - Provide practical, real-world safety strategies
        - Include resources and next steps when appropriate
        - Use professional but friendly language

        IMPORTANT: If asked about topics outside of consent, digital abuse, reporting abuse, emotional boundaries, or emergency contacts, politely redirect the conversation back to these five topics only. Say something like "That's a valid concern, but let's focus on consent/digital abuse/reporting abuse/emotional boundaries instead."`
      } else {
        return `You are a safety assistant, but the user's age (${age}) is outside the supported range of 5-19 years. Please ask them to verify their age or contact a parent/guardian for assistance. ${baseInstructions}`
      }
    }

    // Build conversation history with system prompt
    const history = [
      {
        role: 'user' as const,
        parts: [{ text: getSystemPrompt(userAge) }]
      },
      {
        role: 'model' as const,
        parts: [{ text: 'I understand. I\'ll provide age-appropriate safety guidance focused on the specific topics for your age group. What would you like to know about staying safe?' }]
      },
      ...conversationHistory
    ]

    // Start chat with history
    const chat = model.startChat({ history })

    // Send message and get response
    const result = await chat.sendMessage(message)
    const response = await result.response
    let text = response.text()

    // Clean up any ** formatting that might slip through
    text = text.replace(/\*\*(.*?)\*\*/g, '$1')

    return new Response(
      JSON.stringify({ 
        response: text,
        conversationHistory: [
          ...history.slice(2), // Remove system prompt from returned history
          { role: 'user', parts: [{ text: message }] },
          { role: 'model', parts: [{ text }] }
        ]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in gemini-chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat message',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})