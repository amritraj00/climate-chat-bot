// Chatbot implementation with Gemini API integration

// Configuration for Gemini API
// Using the correct endpoint for Gemini 1.0 Pro which is available for free
const GEMINI_API_KEY = 'AIzaSyAt5pf0SbFZ4hHGYoQoe2rylm4tt9TFP-8'; // Add your API key here
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Initialize the chatbot with context
function initChatBot() {
    // The chatbot is already initialized with a welcome message in the HTML
    console.log('Chatbot initialized');
}

// Process user message and generate response
async function processMessage(message) {
    try {
        // Check if it's a common question we can answer without API
        const commonAnswer = handleCommonQuestion(message);
        if (commonAnswer) {
            removeTypingIndicator();
            addMessageToChat('bot', commonAnswer);
            return;
        }
        
        // Check for weather-related queries
        if (isWeatherQuery(message)) {
            await handleWeatherQuery(message);
            return;
        }

        // For other queries, use Gemini API if key is provided
        if (GEMINI_API_KEY) {
            const response = await getGeminiResponse(message);
            removeTypingIndicator();
            addMessageToChat('bot', response);
        } else {
            // If no API key, use fallback response
            removeTypingIndicator();
            addMessageToChat('bot', getFallbackResponse(message));
        }
        
    } catch (error) {
        console.error('Error processing message:', error);
        removeTypingIndicator();
        addMessageToChat('bot', "Sorry, I'm having trouble connecting to my services right now. Please try again later.");
    }
}

// Check if the query is related to weather
function isWeatherQuery(message) {
    const weatherKeywords = [
        'weather', 'temperature', 'forecast', 'rain', 
        'sunny', 'cloudy', 'humidity', 'wind', 
        'climate', 'hot', 'cold', 'warm', 'snow',
        'degrees', 'celsius', 'fahrenheit'
    ];
    
    const lowercaseMsg = message.toLowerCase();
    
    // Check for weather keywords
    return weatherKeywords.some(keyword => lowercaseMsg.includes(keyword));
}

// Handle weather-specific queries
async function handleWeatherQuery(message) {
    try {
        // Extract location from message
        const location = extractLocationFromMessage(message);
        
        if (!location) {
            // No specific location found, ask for location
            removeTypingIndicator();
            addMessageToChat('bot', "I'd be happy to tell you about the weather! Could you please specify which city or location you're interested in?");
            return;
        }
        
        try {
            // Fetch weather data for the location
            const weatherData = await fetchWeatherForCity(location);
            
            // Create a weather card response
            const weatherCardHTML = createWeatherCard(weatherData);
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add weather card to chat
            addMessageToChat('bot', weatherCardHTML, true);
            
            // Add additional climate context using Gemini or fallback
            let climateContext;
            if (GEMINI_API_KEY) {
                climateContext = await getClimateContext(location, weatherData);
            } else {
                climateContext = `The current weather in ${location} shows ${weatherData.weather[0].description} with a temperature of ${Math.round(weatherData.main.temp)}°C. This is typical for the season in this region.`;
            }
            
            // Add a slight delay before showing the climate context
            setTimeout(() => {
                addMessageToChat('bot', climateContext);
            }, 1000);
        } catch (error) {
            console.error('Error fetching weather:', error);
            removeTypingIndicator();
            
            if (error.message === 'City not found') {
                addMessageToChat('bot', "I couldn't find weather data for that location. Could you please check the spelling or try another nearby city?");
            } else {
                addMessageToChat('bot', "I'm having trouble getting weather information right now. Please try again later.");
            }
        }
        
    } catch (error) {
        console.error('Error handling weather query:', error);
        removeTypingIndicator();
        addMessageToChat('bot', "I'm having trouble processing your weather request. Please try again with a different location.");
    }
}

// Extract location from user message
function extractLocationFromMessage(message) {
    // Simple regex-based location extraction
    // Look for phrases like "weather in [location]" or "temperature at [location]"
    
    const patterns = [
        /weather (?:in|at|for) ([\w\s]+?)(?:\?|$|\.)/i,
        /temperature (?:in|at|for) ([\w\s]+?)(?:\?|$|\.)/i,
        /(?:how's|what's|what is) (?:the weather|it) (?:like )?(?:in|at) ([\w\s]+?)(?:\?|$|\.)/i,
        /forecast (?:for|in) ([\w\s]+?)(?:\?|$|\.)/i,
        /(?:in|at) ([\w\s]+?)(?:\?|$|\.)/i
    ];
    
    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return null;
}

// Get climate context from Gemini API
async function getClimateContext(location, weatherData) {
    const prompt = `
    Provide a brief (2-3 sentences) climate context for ${location} based on this current weather data:
    - Temperature: ${weatherData.main.temp}°C
    - Condition: ${weatherData.weather[0].description}
    - Humidity: ${weatherData.main.humidity}%
    - Wind: ${weatherData.wind.speed} km/h
    
    Include seasonal context and whether this weather is typical or unusual for the current time of year.
    Be informative but brief.
    `;
    
    try {
        return await getGeminiResponse(prompt);
    } catch (error) {
        console.error('Error getting climate context:', error);
        return "This weather is typical for this time of year in this region. The local climate patterns are influenced by seasonal factors and geographical location.";
    }
}

// Call Gemini API for responses
async function getGeminiResponse(prompt) {
    try {
        // Safety check for API key
        if (!GEMINI_API_KEY) {
            throw new Error('No API key provided');
        }
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `You are a helpful climate and weather assistant called ClimateChat. 
                                You provide information about weather, climate patterns, and environmental topics.
                                You keep your responses concise, informative, and helpful.
                                You always use natural, conversational language.
                                You never mention that you're an AI or language model.
                                You never apologize for limitations.
                                
                                User query: ${prompt}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API error details:', errorData);
            throw new Error(`Gemini API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract the text from the response - handle different response structures
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                return candidate.content.parts[0].text || "I don't have specific information about that topic.";
            }
        }
        
        throw new Error('Unexpected response structure from Gemini API');
        
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return "I'm having trouble processing your request right now. Please try again in a moment.";
    }
}

// Function to handle fallback responses when API is unavailable
function getFallbackResponse(query) {
    // First try to extract any specific topic from the query
    const lowercaseQuery = query.toLowerCase();
    let response;
    
    if (lowercaseQuery.includes('climate change')) {
        response = "Climate change is a long-term change in the average weather patterns that define Earth's local, regional and global climates. Human activities, particularly the burning of fossil fuels, are the primary driver of observed climate change since the mid-20th century.";
    } else if (lowercaseQuery.includes('global warming')) {
        response = "Global warming is the long-term heating of Earth's climate system observed since the pre-industrial period due to human activities, primarily fossil fuel burning, which increases heat-trapping greenhouse gas levels in Earth's atmosphere.";
    } else if (lowercaseQuery.includes('recycle') || lowercaseQuery.includes('recycling')) {
        response = "Recycling helps reduce waste sent to landfills, conserves natural resources, and reduces pollution. Common recyclable materials include paper, glass, plastic, and metals. Check your local recycling guidelines for specific instructions.";
    } else if (lowercaseQuery.includes('tip') || lowercaseQuery.includes('advice')) {
        // Environmental tips array
        const tips = [
            "Try using a reusable water bottle instead of buying plastic ones. This simple switch can save hundreds of single-use bottles per year.",
            "Consider walking, biking, or using public transportation when possible to reduce carbon emissions from personal vehicles.",
            "Reduce food waste by planning meals, using leftovers creatively, and composting food scraps.",
            "Save energy by turning off lights when not in use and unplugging electronics that aren't being used.",
            "Opt for reusable shopping bags instead of plastic or paper bags from stores.",
            "Consider eating less meat, especially beef, to reduce your carbon footprint."
        ];
        response = tips[Math.floor(Math.random() * tips.length)];
    } else {
        // General fallbacks
        const fallbacks = [
            "I'm here to help with weather and climate information. Could you try asking about current weather or climate trends?",
            "I can provide information about weather patterns, climate data, and environmental topics. What would you like to know?",
            "Feel free to ask about weather forecasts, climate trends, or environmental facts. I'm happy to assist!",
            "I'm your climate assistant, ready to help with weather information and climate data. What are you curious about?"
        ];
        response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    
    return response;
}

// Function to handle common questions without API
function handleCommonQuestion(query) {
    const lowercaseQuery = query.toLowerCase();
    
    // Define some common Q&A pairs - expanded with more questions
    const commonQA = {
        'what is climate change': "Climate change refers to long-term shifts in temperatures and weather patterns. These changes may be natural, but since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels which increases heat-trapping greenhouse gas levels in Earth's atmosphere.",
        'what causes global warming': "Global warming is primarily caused by human activities that emit greenhouse gases like carbon dioxide and methane. These gases trap heat in the atmosphere, leading to a rise in global temperatures. Major sources include burning fossil fuels for energy, deforestation, and industrial processes.",
        'difference between weather and climate': "Weather refers to short-term atmospheric conditions like temperature, humidity, and precipitation in a specific place and time. Climate is the average weather pattern in an area over a long period, typically 30 years or more. Weather can change minute-to-minute, while climate changes occur over decades or centuries.",
        'what is carbon footprint': "A carbon footprint is the total amount of greenhouse gases (including carbon dioxide and methane) that are generated by our actions. The average carbon footprint for a person in the United States is 16 tons, one of the highest rates in the world.",
        'how to reduce carbon footprint': "You can reduce your carbon footprint by using energy-efficient appliances, driving less, eating more plant-based foods, reducing waste, and conserving water. Small changes in daily habits can make a significant difference over time.",
        'what is renewable energy': "Renewable energy comes from natural sources that are constantly replenished, such as sunlight, wind, water, and geothermal heat. Unlike fossil fuels, renewable energy sources don't deplete over time and generally produce fewer greenhouse gas emissions.",
        'how do i start recycling': "Start recycling by checking your local guidelines for what materials are accepted. Set up separate bins for recyclables, clean containers before recycling them, and learn about special collection events for electronics or hazardous materials.",
        'what is sustainable living': "Sustainable living means making choices that reduce your environmental impact by reducing resource consumption, carbon emissions, and waste. This includes using renewable energy, conserving water, reducing waste, and choosing environmentally friendly products.",
        'what are environmental tips': "Some environmental tips include: use reusable bags and water bottles, reduce energy consumption by unplugging devices when not in use, eat less meat, compost food waste, conserve water, and walk or use public transportation when possible."
    };
    
    // Check if query matches any common questions
    for (const [question, answer] of Object.entries(commonQA)) {
        if (lowercaseQuery.includes(question)) {
            return answer;
        }
    }
    
    return null;
}

// Function to provide environmental tips
function getEnvironmentalTip() {
    const tips = [
        "Try using a reusable water bottle instead of buying plastic ones. This small change can prevent hundreds of plastic bottles from reaching landfills each year.",
        "Consider walking, biking, or using public transportation for short trips to reduce your carbon footprint.",
        "Reduce food waste by planning meals, storing food properly, and composting scraps.",
        "Save energy by turning off lights when not in use and unplugging electronics that aren't being used.",
        "Choose reusable shopping bags instead of single-use plastic bags.",
        "Opt for energy-efficient appliances when replacing old ones.",
        "Consider eating less meat, especially beef, which has a high carbon footprint.",
        "Plant native species in your garden to support local ecosystems and reduce water usage.",
        "Fix leaky faucets and pipes to conserve water.",
        "Buy locally produced food to reduce the emissions associated with transportation."
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
}