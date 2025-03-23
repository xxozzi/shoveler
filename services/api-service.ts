// Define the types
interface SoilData {
  soilType: string
  ph: number
  organicCarbon: number
  nitrogen: number
  moisture: number
  texture: {
    clay: number
    silt: number
    sand: number
  }
}

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  rainfall: number
  forecast?: { date: string; temperature: number; rainfall: number }[]
}

interface CropRecommendation {
  crop: string
  yield: string
  marketPrice: string
  productionCost: string
  profit: string
  totalProfit: string
  confidence: number
}

interface AnalysisData {
  location: string
  acres: number
  regionName: string
  weather: WeatherData
  soil: SoilData
  recommendations: CropRecommendation[]
  rotationPlans: any
}

// Get API keys from environment variables
const USDA_API_KEY = process.env.USDA_API_KEY
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
const TOMTOM_API_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY
const PUBLIC_GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

// Get state from coordinates using TomTom API
async function getStateFromCoordinates(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${TOMTOM_API_KEY}&radius=100`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`TomTom API returned status: ${response.status}`)
    }

    const data = await response.json()

    if (data.addresses && data.addresses.length > 0) {
      const address = data.addresses[0].address
      // Get state code (e.g., "KY" for Kentucky)
      return address.countrySubdivision || address.countrySecondarySubdivision || "KY"
    }

    return "KY" // Default to Kentucky if no state found
  } catch (error) {
    console.error("Error getting state from coordinates:", error)
    return "KY" // Default to Kentucky on error
  }
}

// Process USDA crop statistics data
function processCropStats(usdaData: any): any[] {
  try {
    if (!usdaData || !usdaData.data) {
      return []
    }

    // Extract relevant crop data
    const cropStats = usdaData.data.map((item: any) => {
      return {
        crop: item.commodity_desc,
        value: item.Value,
        unit: item.unit_desc,
        year: item.year,
      }
    })

    // Sort by value (if numeric)
    return cropStats.sort((a: any, b: any) => {
      const aValue = Number.parseFloat(a.value.replace(/,/g, ""))
      const bValue = Number.parseFloat(b.value.replace(/,/g, ""))

      if (isNaN(aValue) || isNaN(bValue)) {
        return 0
      }

      return bValue - aValue
    })
  } catch (error) {
    console.error("Error processing USDA data:", error)
    return []
  }
}

// Get location name from coordinates using TomTom API
async function getLocationName(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${TOMTOM_API_KEY}&radius=100`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`TomTom API returned status: ${response.status}`)
    }

    const data = await response.json()

    if (data.addresses && data.addresses.length > 0) {
      const address = data.addresses[0].address

      // Construct location name from address components
      const components = []

      if (address.municipality) {
        components.push(address.municipality)
      }

      if (address.countrySecondarySubdivision) {
        components.push(address.countrySecondarySubdivision)
      }

      if (address.countrySubdivision) {
        components.push(address.countrySubdivision)
      }

      if (components.length > 0) {
        return components.join(", ")
      }
    }

    return "Unknown Location"
  } catch (error) {
    console.error("Error getting location name:", error)
    return "Unknown Location"
  }
}

// Get weather data from coordinates using OpenWeather API
async function getWeatherData(lat: number, lng: number): Promise<WeatherData> {
  try {
    // Get current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&appid=${OPENWEATHER_API_KEY}`
    const currentResponse = await fetch(currentUrl)

    if (!currentResponse.ok) {
      throw new Error(`OpenWeather API returned status: ${currentResponse.status}`)
    }

    const currentData = await currentResponse.json()

    // Get forecast for next few days
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=imperial&appid=${OPENWEATHER_API_KEY}`
    const forecastResponse = await fetch(forecastUrl)

    if (!forecastResponse.ok) {
      throw new Error(`OpenWeather forecast API returned status: ${forecastResponse.status}`)
    }

    const forecastData = await forecastResponse.json()

    // Process current weather data
    const temperature = currentData.main.temp
    const humidity = currentData.main.humidity
    const windSpeed = currentData.wind.speed

    // Get rainfall from last 3 hours if available
    let rainfall = 0
    if (currentData.rain && currentData.rain["3h"]) {
      rainfall = currentData.rain["3h"]
    } else if (currentData.rain && currentData.rain["1h"]) {
      rainfall = currentData.rain["1h"]
    }

    // Process forecast data - get one entry per day
    const forecast = []
    const processedDates = new Set()

    if (forecastData.list && forecastData.list.length > 0) {
      for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000).toLocaleDateString()

        // Only take one reading per day
        if (!processedDates.has(date)) {
          processedDates.add(date)

          let dailyRainfall = 0
          if (item.rain && item.rain["3h"]) {
            dailyRainfall = item.rain["3h"]
          }

          forecast.push({
            date,
            temperature: Math.round(item.main.temp),
            rainfall: dailyRainfall,
          })

          // Only get 3 days of forecast
          if (forecast.length >= 3) {
            break
          }
        }
      }
    }

    return {
      temperature: Math.round(temperature),
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed),
      rainfall,
      forecast,
    }
  } catch (error) {
    console.error("Error getting weather data:", error)
    // Return fallback weather data
    return {
      temperature: 72,
      humidity: 65,
      windSpeed: 5,
      rainfall: 0.0,
      forecast: [
        { date: new Date().toLocaleDateString(), temperature: 72, rainfall: 0 },
        { date: new Date(Date.now() + 86400000).toLocaleDateString(), temperature: 74, rainfall: 0.1 },
        { date: new Date(Date.now() + 172800000).toLocaleDateString(), temperature: 71, rainfall: 0.2 },
      ],
    }
  }
}

async function removeAllSequences(text: string, sequence: string) {
  const regex = new RegExp(sequence, 'g');
  return text.replace(regex, '');
}

// Get soil data based on location
// Note: This is a simplified approach as real soil data would require a specialized API
async function getSoilData(lat: number, lng: number): Promise<SoilData> {
  try {
    // For a real implementation, you would use a soil data API
    // Since we don't have a specific soil API, we'll use Gemini to generate plausible soil data
    // based on the location

    // First, get the location name
    const locationName = await getLocationName(lat, lng)

    const prompt = `
      As a soil science expert, provide realistic soil data for agricultural land in ${locationName} at coordinates ${lat}, ${lng}.
      
      Return ONLY a JSON object with these properties:
      - soilType: common soil type in this region (string)
      - ph: typical soil pH value (number between 4.5-8.5)
      - organicCarbon: percentage of organic carbon (number between 0.5-5)
      - nitrogen: percentage of nitrogen (number between 0.05-0.5)
      - moisture: current soil moisture percentage (number between 5-30)
      - texture: object with percentages of clay, silt, and sand that add up to 100%
      
      Example format:
      {
        "soilType": "Clay Loam",
        "ph": 6.8,
        "organicCarbon": 2.3,
        "nitrogen": 0.15,
        "moisture": 18.5,
        "texture": {
          "clay": 30,
          "silt": 35,
          "sand": 35
        }
      }
      
      Return ONLY the JSON with no additional text.
    `

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Gemini API returned status: ${response.status}`)
      }

      const data = await response.json()

      if (
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text
      ) {
        const responseText = data.candidates[0].content.parts[0].text

        try {
          // Try to parse the JSON response
          const cleanResponseText = responseText
            .replace(/^```json\s*/i, '')  // removes starting ```json or ```
            .replace(/\s*```$/i, '')      // removes ending ```
            .replace("```", "")
            .trim();

          console.log(cleanResponseText);

          const soilData = JSON.parse(cleanResponseText);
          // Validate the soil data
          if (
            soilData.soilType &&
            typeof soilData.ph === "number" &&
            typeof soilData.organicCarbon === "number" &&
            typeof soilData.nitrogen === "number" &&
            typeof soilData.moisture === "number" &&
            soilData.texture &&
            typeof soilData.texture.clay === "number" &&
            typeof soilData.texture.silt === "number" &&
            typeof soilData.texture.sand === "number"
          ) {
            return soilData
          }
        } catch (parseError) {
          console.error("Error parsing soil data JSON:", parseError)
        }
      }
    } catch (apiError) {
      console.error("Error calling Gemini API for soil data:", apiError)
    }

    // If we couldn't get soil data from Gemini, use region-based fallback
    // This is a simplified approach - in a real app, you'd use a soil database
    const regionSoilTypes: { [key: string]: SoilData } = {
      // Eastern US
      NY: {
        soilType: "Silt Loam",
        ph: 6.2,
        organicCarbon: 2.5,
        nitrogen: 0.18,
        moisture: 16.5,
        texture: { clay: 15, silt: 65, sand: 20 },
      },
      PA: {
        soilType: "Silt Loam",
        ph: 6.0,
        organicCarbon: 2.3,
        nitrogen: 0.16,
        moisture: 15.8,
        texture: { clay: 18, silt: 62, sand: 20 },
      },

      // Midwest
      IL: {
        soilType: "Silty Clay Loam",
        ph: 6.8,
        organicCarbon: 3.1,
        nitrogen: 0.22,
        moisture: 18.2,
        texture: { clay: 30, silt: 55, sand: 15 },
      },
      IA: {
        soilType: "Silty Clay Loam",
        ph: 7.0,
        organicCarbon: 3.3,
        nitrogen: 0.24,
        moisture: 19.5,
        texture: { clay: 32, silt: 53, sand: 15 },
      },
      KS: {
        soilType: "Silt Loam",
        ph: 6.5,
        organicCarbon: 2.0,
        nitrogen: 0.15,
        moisture: 14.0,
        texture: { clay: 20, silt: 60, sand: 20 },
      },

      // South
      TX: {
        soilType: "Clay",
        ph: 7.8,
        organicCarbon: 1.5,
        nitrogen: 0.12,
        moisture: 12.5,
        texture: { clay: 55, silt: 25, sand: 20 },
      },
      GA: {
        soilType: "Sandy Loam",
        ph: 5.8,
        organicCarbon: 1.2,
        nitrogen: 0.1,
        moisture: 11.0,
        texture: { clay: 10, silt: 25, sand: 65 },
      },
      KY: {
        soilType: "Silt Loam",
        ph: 6.5,
        organicCarbon: 2.1,
        nitrogen: 0.15,
        moisture: 14.6,
        texture: { clay: 20, silt: 60, sand: 20 },
      },

      // West
      CA: {
        soilType: "Sandy Loam",
        ph: 7.2,
        organicCarbon: 1.0,
        nitrogen: 0.08,
        moisture: 9.5,
        texture: { clay: 10, silt: 20, sand: 70 },
      },
      WA: {
        soilType: "Silt Loam",
        ph: 6.4,
        organicCarbon: 2.8,
        nitrogen: 0.2,
        moisture: 17.2,
        texture: { clay: 15, silt: 70, sand: 15 },
      },
    }

    // Get the state from coordinates
    const state = await getStateFromCoordinates(lat, lng)

    // Return soil data for the state, or default to Kentucky if not found
    return regionSoilTypes[state] || regionSoilTypes["KY"]
  } catch (error) {
    console.error("Error getting soil data:", error)
    // Return default soil data
    return {
      soilType: "Loam",
      ph: 6.5,
      organicCarbon: 2.1,
      nitrogen: 0.15,
      moisture: 14.6,
      texture: {
        clay: 20,
        silt: 40,
        sand: 40,
      },
    }
  }
}

// Get crop recommendations using USDA data and Gemini AI
export async function getCropRecommendations(
  lat: number,
  lng: number,
  acres: number,
  soilData: SoilData,
  weatherData: WeatherData,
): Promise<CropRecommendation[]> {
  try {
    // Get USDA crop statistics for the state
    let cropStats = []
    let state = "KY" // Default to Kentucky

    try {
      state = await getStateFromCoordinates(lat, lng)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // Increase timeout to 8 seconds

        // Add a try-catch block specifically for the fetch operation
        try {
          // Note: The USDA API can be unreliable, so we'll handle failures gracefully
          console.log(
            "USDA API Debug - Request URL:",
            `https://quickstats.nass.usda.gov/api/api_GET/?key=${USDA_API_KEY}&source_desc=SURVEY&sector_desc=CROPS&state_alpha=${state}&year=2022&format=JSON`,
          )
          console.log("USDA API Debug - API Key:", USDA_API_KEY ? "API key exists" : "API key is missing")
          console.log("USDA API Debug - State:", state)
          const usdaResponse = await fetch(
            `https://quickstats.nass.usda.gov/api/api_GET/?key=${USDA_API_KEY}&source_desc=SURVEY&sector_desc=CROPS&state_alpha=${state}&year=2022&format=JSON`,
            { signal: controller.signal },
          )

          clearTimeout(timeoutId)

          if (!usdaResponse.ok) {
            throw new Error(`USDA API returned status: ${usdaResponse.status}`)
          }

          console.log("USDA API Debug - Response status:", usdaResponse.status)
          console.log("USDA API Debug - Response OK:", usdaResponse.ok)

          const usdaData = await usdaResponse.json()

          // Process USDA data to get top crops for the region
          if (usdaData && usdaData.data) {
            cropStats = processCropStats(usdaData)
          }

          console.log(
            "USDA API Debug - Response data structure:",
            usdaData
              ? `Has data property: ${!!usdaData.data}, Data length: ${usdaData.data ? usdaData.data.length : 0}`
              : "No data returned",
          )
        } catch (fetchError) {
          console.error("Error fetching from USDA API:", fetchError)
          // Continue with empty crop stats and use fallback data
          cropStats = []
          console.log("USDA API Debug - Fetch error details:", fetchError)
          console.log("USDA API Debug - Error type:", fetchError instanceof Error ? "Error object" : typeof fetchError)
          console.log(
            "USDA API Debug - Error message:",
            fetchError instanceof Error ? fetchError.message : "Unknown error",
          )
        }
      } catch (usdaError) {
        console.error("Error processing USDA data:", usdaError)
        // Continue with empty crop stats
        cropStats = []
      }
    } catch (usdaError) {
      console.error("Error fetching USDA data:", usdaError)
      // Continue with empty crop stats
      cropStats = []
    }

    // Use Gemini API to analyze and recommend crops based on soil, weather, and regional data
    try {
      // Get location name for context
      const locationName = await getLocationName(lat, lng)

      // Create a simplified prompt that's less likely to cause parsing issues
      const prompt = `
        As an agricultural expert, analyze this data and recommend the top 3 most profitable crops for a ${acres} acre farm.
        
        Location: ${locationName} (${state})
        Coordinates: ${lat}, ${lng}
        
        Soil Data:
        - Type: ${soilData.soilType}
        - pH: ${soilData.ph}
        - Organic Carbon: ${soilData.organicCarbon}%
        - Nitrogen: ${soilData.nitrogen}%
        - Moisture: ${soilData.moisture}%
        - Texture: Clay ${soilData.texture.clay}%, Silt ${soilData.texture.silt}%, Sand ${soilData.texture.sand}%
        
        Weather Data:
        - Current Temperature: ${weatherData.temperature}°F
        - Humidity: ${weatherData.humidity}%
        - Wind Speed: ${weatherData.windSpeed} mph
        - Recent Rainfall: ${weatherData.rainfall} inches
        
        For each recommended crop, provide:
        1. Expected yield per acre
        2. Current market price
        3. Estimated production cost per acre
        4. Profit per acre
        5. Total profit for ${acres} acres
        
        Format your response ONLY as a JSON array with objects containing crop, yield, marketPrice, productionCost, profit, totalProfit, and confidence (0-100%).
        The JSON array should be the only content in your response.
        Example format:
        [
          {
            "crop": "Crop Name",
            "yield": "X units per acre",
            "marketPrice": "$Y per unit",
            "productionCost": "$Z per acre",
            "profit": "$P per acre",
            "totalProfit": "$T",
            "confidence": 85
          }
        ]
      `

      try {
        // Use the Gemini 1.5 Flash model for faster responses
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${PUBLIC_GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
            }),
          },
        )

        if (!geminiResponse.ok) {
          throw new Error(`Gemini API returned status: ${geminiResponse.status}`)
        }

        const geminiData = await geminiResponse.json()

        // Log the full response for debugging
        console.log("Gemini API response:", JSON.stringify(geminiData))

        // Extract text from Gemini response
        if (
          geminiData &&
          geminiData.candidates &&
          geminiData.candidates[0] &&
          geminiData.candidates[0].content &&
          geminiData.candidates[0].content.parts &&
          geminiData.candidates[0].content.parts[0] &&
          geminiData.candidates[0].content.parts[0].text
        ) {
          let responseText = geminiData.candidates[0].content.parts[0].text
          console.log("Gemini response text:", responseText)

          // Check if the response is wrapped in markdown code blocks
          if (responseText.startsWith("```json") && responseText.includes("```")) {
            // Extract the JSON content from the markdown code block
            responseText = responseText.replace(/```json\n|\n```/g, "")
          }

          // Try multiple approaches to extract JSON
          let recommendations

          // Approach 1: Try to parse the entire response as JSON
          try {
            recommendations = JSON.parse(responseText.trim())
            if (Array.isArray(recommendations) && recommendations.length > 0) {
              return recommendations
            }
          } catch (parseError1) {
            console.log("First parse attempt failed:", parseError1)
          }

          // Approach 2: Try to extract JSON using regex
          try {
            const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/)
            if (jsonMatch) {
              recommendations = JSON.parse(jsonMatch[0])
              if (Array.isArray(recommendations) && recommendations.length > 0) {
                return recommendations
              }
            }
          } catch (parseError2) {
            console.log("Second parse attempt failed:", parseError2)
          }

          // Approach 3: Try to extract JSON by finding the first '[' and last ']'
          try {
            const startIndex = responseText.indexOf("[")
            const endIndex = responseText.lastIndexOf("]")

            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
              const jsonString = responseText.substring(startIndex, endIndex + 1)
              recommendations = JSON.parse(jsonString)
              if (Array.isArray(recommendations) && recommendations.length > 0) {
                return recommendations
              }
            }
          } catch (parseError3) {
            console.log("Third parse attempt failed:", parseError3)
          }
        }

        // If we couldn't parse the JSON, create a simple recommendation based on the soil type
        console.log("All JSON parsing attempts failed, using fallback recommendations")
        return generateFallbackRecommendations(soilData, acres)
      } catch (apiError) {
        console.error("Error calling Gemini API:", apiError)
        return generateFallbackRecommendations(soilData, acres)
      }
    } catch (geminiError) {
      console.error("Error getting recommendations from Gemini:", geminiError)
      return generateFallbackRecommendations(soilData, acres)
    }
  } catch (error) {
    console.error("Error getting crop recommendations:", error)
    // Return fallback data
    return [
      {
        crop: "Alfalfa",
        yield: "5.2 tons per acre",
        marketPrice: "$237 per ton",
        productionCost: "$400 per acre",
        profit: "$832 per acre",
        totalProfit: `$${Math.round(832 * acres).toLocaleString()}`,
        confidence: 85,
      },
      {
        crop: "Winter Wheat",
        yield: "68.2 bushels per acre",
        marketPrice: "$6.50 per bushel",
        productionCost: "$350 per acre",
        profit: "$93 per acre",
        totalProfit: `$${Math.round(93 * acres).toLocaleString()}`,
        confidence: 78,
      },
      {
        crop: "Soybeans",
        yield: "45 bushels per acre",
        marketPrice: "$12.40 per bushel",
        productionCost: "$320 per acre",
        profit: "$238 per acre",
        totalProfit: `$${Math.round(238 * acres).toLocaleString()}`,
        confidence: 72,
      },
    ]
  }
}

// helper fn to make some backup recommendations based on soil type
function generateFallbackRecommendations(soilData: SoilData, acres: number): CropRecommendation[] {
  // diff recommendations for each soil type
  const soilTypeRecommendations: { [key: string]: CropRecommendation[] } = {
    Loam: [
      {
        crop: "Corn",
        yield: "180 bushels per acre",
        marketPrice: "$5.20 per bushel",
        productionCost: "$580 per acre",
        profit: "$356 per acre",
        totalProfit: `$${Math.round(356 * acres).toLocaleString()}`,
        confidence: 90,
      },
      {
        crop: "Soybeans",
        yield: "55 bushels per acre",
        marketPrice: "$12.40 per bushel",
        productionCost: "$320 per acre",
        profit: "$362 per acre",
        totalProfit: `$${Math.round(362 * acres).toLocaleString()}`,
        confidence: 85,
      },
      {
        crop: "Alfalfa",
        yield: "5.5 tons per acre",
        marketPrice: "$240 per ton",
        productionCost: "$400 per acre",
        profit: "$920 per acre",
        totalProfit: `$${Math.round(920 * acres).toLocaleString()}`,
        confidence: 80,
      },
    ],
    Clay: [
      {
        crop: "Rice",
        yield: "7500 pounds per acre",
        marketPrice: "$0.20 per pound",
        productionCost: "$800 per acre",
        profit: "$700 per acre",
        totalProfit: `$${Math.round(700 * acres).toLocaleString()}`,
        confidence: 85,
      },
      {
        crop: "Cotton",
        yield: "1200 pounds per acre",
        marketPrice: "$0.85 per pound",
        productionCost: "$600 per acre",
        profit: "$420 per acre",
        totalProfit: `$${Math.round(420 * acres).toLocaleString()}`,
        confidence: 80,
      },
      {
        crop: "Soybeans",
        yield: "45 bushels per acre",
        marketPrice: "$12.40 per bushel",
        productionCost: "$320 per acre",
        profit: "$238 per acre",
        totalProfit: `$${Math.round(238 * acres).toLocaleString()}`,
        confidence: 75,
      },
    ],
    Sandy: [
      {
        crop: "Peanuts",
        yield: "4000 pounds per acre",
        marketPrice: "$0.25 per pound",
        productionCost: "$550 per acre",
        profit: "$450 per acre",
        totalProfit: `$${Math.round(450 * acres).toLocaleString()}`,
        confidence: 85,
      },
      {
        crop: "Sweet Potatoes",
        yield: "350 bushels per acre",
        marketPrice: "$16 per bushel",
        productionCost: "$3000 per acre",
        profit: "$2600 per acre",
        totalProfit: `$${Math.round(2600 * acres).toLocaleString()}`,
        confidence: 75,
      },
      {
        crop: "Watermelons",
        yield: "40000 pounds per acre",
        marketPrice: "$0.15 per pound",
        productionCost: "$3500 per acre",
        profit: "$2500 per acre",
        totalProfit: `$${Math.round(2500 * acres).toLocaleString()}`,
        confidence: 70,
      },
    ],
    Silt: [
      {
        crop: "Wheat",
        yield: "75 bushels per acre",
        marketPrice: "$6.50 per bushel",
        productionCost: "$350 per acre",
        profit: "$137.50 per acre",
        totalProfit: `$${Math.round(137.5 * acres).toLocaleString()}`,
        confidence: 85,
      },
      {
        crop: "Corn",
        yield: "170 bushels per acre",
        marketPrice: "$5.20 per bushel",
        productionCost: "$580 per acre",
        profit: "$304 per acre",
        totalProfit: `$${Math.round(304 * acres).toLocaleString()}`,
        confidence: 80,
      },
      {
        crop: "Soybeans",
        yield: "50 bushels per acre",
        marketPrice: "$12.40 per bushel",
        productionCost: "$320 per acre",
        profit: "$300 per acre",
        totalProfit: `$${Math.round(300 * acres).toLocaleString()}`,
        confidence: 75,
      },
    ],
  }

  // Determine which soil category to use
  let soilCategory = "Loam" // Default

  if (soilData.soilType.includes("Clay")) {
    soilCategory = "Clay"
  } else if (soilData.soilType.includes("Sand") || soilData.soilType.includes("Sandy")) {
    soilCategory = "Sandy"
  } else if (soilData.soilType.includes("Silt")) {
    soilCategory = "Silt"
  }

  return soilTypeRecommendations[soilCategory] || soilTypeRecommendations["Loam"]
}

// Get crop rotation plans using Gemini AI
export async function getCropRotationPlans(recommendations: CropRecommendation[], soilData: SoilData): Promise<any> {
  try {
    // Create a simplified prompt that's less likely to cause parsing issues
    const prompt = `
      As an agricultural expert, create optimal 3-year and 5-year crop rotation plans using these recommended crops and soil data.
      
      Recommended Crops:
      ${recommendations.map((r) => `- ${r.crop} (Confidence: ${r.confidence}%)`).join("\n")}
      
      Soil Data:
      - Type: ${soilData.soilType}
      - pH: ${soilData.ph}
      - Organic Carbon: ${soilData.organicCarbon}%
      - Nitrogen: ${soilData.nitrogen}%
      - Moisture: ${soilData.moisture}%
      - Texture: Clay ${soilData.texture.clay}%, Silt ${soilData.texture.silt}%, Sand ${soilData.texture.sand}%
      
      For each rotation plan:
      1. Provide a name (e.g., "Standard Rotation", "Soil Building Rotation")
      2. List crops for each year
      3. Explain benefits of this rotation
      
      Format your response ONLY as a JSON object with two arrays: threeYearPlans and fiveYearPlans.
      Each plan should have: name, years (array of crop names), and benefits (string).
      The JSON object should be the only content in your response.
      
      Example format:
      {
        "threeYearPlans": [
          {
            "name": "Plan Name",
            "years": ["Crop1", "Crop2", "Crop3"],
            "benefits": "Description of benefits"
          }
        ],
        "fiveYearPlans": [
          {
            "name": "Plan Name",
            "years": ["Crop1", "Crop2", "Crop3", "Crop4", "Crop5"],
            "benefits": "Description of benefits"
          }
        ]
      }
    `

    try {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${PUBLIC_GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.1, // Lower temperature for more deterministic output
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
            }),
          },
        )

        if (!geminiResponse.ok) {
          throw new Error(`Gemini API returned status: ${geminiResponse.status}`)
        }

        const geminiData = await geminiResponse.json()

        // Log the full response for debugging
        console.log("Gemini API rotation plans response:", JSON.stringify(geminiData))

        // Extract text from Gemini response
        if (
          geminiData &&
          geminiData.candidates &&
          geminiData.candidates[0] &&
          geminiData.candidates[0].content &&
          geminiData.candidates[0].content.parts &&
          geminiData.candidates[0].content.parts[0] &&
          geminiData.candidates[0].content.parts[0].text
        ) {
          let responseText = geminiData.candidates[0].content.parts[0].text
          console.log("Gemini rotation plans response text:", responseText)

          // Check if the response is wrapped in markdown code blocks
          if (responseText.startsWith("```json") && responseText.includes("```")) {
            // Extract the JSON content from the markdown code block
            responseText = responseText.replace(/```json\n|\n```/g, "")
          }

          // Try multiple approaches to extract JSON
          let rotationPlans

          // Approach 1: Try to parse the entire response as JSON
          try {
            rotationPlans = JSON.parse(responseText.trim())
            if (rotationPlans && rotationPlans.threeYearPlans && rotationPlans.fiveYearPlans) {
              return rotationPlans
            }
          } catch (parseError1) {
            console.log("First rotation plans parse attempt failed:", parseError1)
          }

          // Approach 2: Try to extract JSON using regex
          try {
            const jsonMatch = responseText.match(/\{\s*"threeYearPlans[\s\S]*\}\s*\}/)
            if (jsonMatch) {
              rotationPlans = JSON.parse(jsonMatch[0])
              if (rotationPlans && rotationPlans.threeYearPlans && rotationPlans.fiveYearPlans) {
                return rotationPlans
              }
            }
          } catch (parseError2) {
            console.log("Second rotation plans parse attempt failed:", parseError2)
          }

          // Approach 3: Try to extract JSON by finding the first '{' and last '}'
          try {
            const startIndex = responseText.indexOf("{")
            const endIndex = responseText.lastIndexOf("}")

            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
              const jsonString = responseText.substring(startIndex, endIndex + 1)
              rotationPlans = JSON.parse(jsonString)
              if (rotationPlans && rotationPlans.threeYearPlans && rotationPlans.fiveYearPlans) {
                return rotationPlans
              }
            }
          } catch (parseError3) {
            console.log("Third rotation plans parse attempt failed:", parseError3)
          }
        }

        // If all parsing attempts fail, use fallback data
        console.log("All JSON parsing attempts failed for rotation plans, using fallback data")
        return generateFallbackRotationPlans(recommendations)
      } catch (apiError) {
        console.error("Error calling Gemini API for rotation plans:", apiError)
        return generateFallbackRotationPlans(recommendations)
      }
    } catch (error) {
      console.error("Error getting crop rotation plans:", error)
      // Return fallback data
      return generateFallbackRotationPlans(recommendations)
    }
  } catch (error) {
    console.error("Error getting crop rotation plans:", error)
    // Return fallback data
    return generateFallbackRotationPlans(recommendations)
  }
}

// helper fn to make some backup rotation plans
function generateFallbackRotationPlans(recommendations: CropRecommendation[]): any {
  // grab crop names from recommendations
  const cropNames = recommendations.map((rec) => rec.crop)

  // add some common rotation crops if we need more
  const commonRotationCrops = ["Corn", "Soybeans", "Winter Wheat", "Alfalfa", "Barley", "Oats", "Rye", "Clover"]

  // make sure we got at least 5 crops for rotation
  while (cropNames.length < 5) {
    const cropToAdd = commonRotationCrops.find((crop) => !cropNames.includes(crop))
    if (cropToAdd) {
      cropNames.push(cropToAdd)
    } else {
      break // no more crops to add :(
    }
  }

  // make the rotation plans
  return {
    threeYearPlans: [
      {
        name: "Standard Rotation",
        years: cropNames.slice(0, 3),
        benefits:
          "This rotation helps break pest cycles and balances soil nutrients. It provides a good balance between soil health and economic returns.",
      },
      {
        name: "Soil Building Rotation",
        years: [
          cropNames.find((crop) => crop.includes("Alfalfa") || crop.includes("Clover")) || cropNames[0],
          cropNames.find((crop) => crop.includes("Wheat") || crop.includes("Barley") || crop.includes("Rye")) ||
            cropNames[1],
          cropNames.find((crop) => crop.includes("Soybean") || crop.includes("Corn")) || cropNames[2],
        ],
        benefits:
          "This rotation focuses on building soil organic matter and nitrogen fixation. It's ideal for improving soil health over time.",
      },
    ],
    fiveYearPlans: [
      {
        name: "Extended Rotation",
        years: cropNames.slice(0, 5),
        benefits:
          "This five-year rotation maximizes soil health and long-term sustainability. The extended rotation period helps break disease and pest cycles while building soil fertility.",
      },
    ],
  }
}

// Analyze area with all available data
export async function analyzeArea(lat: number, lng: number, acres: number, regionName: string): Promise<AnalysisData> {
  try {
    // Get location name
    let locationName
    try {
      locationName = await getLocationName(lat, lng)
    } catch (locationError) {
      console.error("Error getting location name:", locationError)
      locationName = "Unknown Location"
    }

    // Get weather data
    let weatherData
    try {
      weatherData = await getWeatherData(lat, lng)
    } catch (weatherError) {
      console.error("Error getting weather data:", weatherError)
      weatherData = {
        temperature: 72,
        humidity: 65,
        windSpeed: 5,
        rainfall: 0.0,
        forecast: [
          { date: new Date().toLocaleDateString(), temperature: 72, rainfall: 0 },
          { date: new Date(Date.now() + 86400000).toLocaleDateString(), temperature: 74, rainfall: 0.1 },
          { date: new Date(Date.now() + 172800000).toLocaleDateString(), temperature: 71, rainfall: 0.2 },
        ],
      }
    }

    // Get soil data
    let soilData
    try {
      soilData = await getSoilData(lat, lng)
    } catch (soilError) {
      console.error("Error getting soil data:", soilError)
      soilData = {
        soilType: "Loam",
        ph: 6.5,
        organicCarbon: 2.1,
        nitrogen: 0.15,
        moisture: 14.6,
        texture: {
          clay: 20,
          silt: 40,
          sand: 40,
        },
      }
    }

    // Get crop recommendations
    let recommendations
    try {
      recommendations = await getCropRecommendations(lat, lng, acres, soilData, weatherData)
    } catch (recommendationsError) {
      console.error("Error getting crop recommendations:", recommendationsError)
      recommendations = generateFallbackRecommendations(soilData, acres)
    }

    // Get crop rotation plans
    let rotationPlans
    try {
      rotationPlans = await getCropRotationPlans(recommendations, soilData)
    } catch (rotationError) {
      console.error("Error getting crop rotation plans:", rotationError)
      rotationPlans = generateFallbackRotationPlans(recommendations)
    }

    return {
      location: locationName,
      acres,
      regionName,
      weather: weatherData,
      soil: soilData,
      recommendations,
      rotationPlans,
    }
  } catch (error) {
    console.error("Error analyzing area:", error)
    // Return fallback data with the helper functions we created
    const fallbackSoilData = {
      soilType: "Loam",
      ph: 6.5,
      organicCarbon: 2.1,
      nitrogen: 0.15,
      moisture: 14.6,
      texture: {
        clay: 20,
        silt: 40,
        sand: 40,
      },
    }

    const fallbackRecommendations = generateFallbackRecommendations(fallbackSoilData, acres)

    return {
      location: "Fayette County, Kentucky",
      acres,
      regionName,
      weather: {
        temperature: 72,
        humidity: 65,
        windSpeed: 5,
        rainfall: 0.0,
        forecast: [
          { date: new Date().toLocaleDateString(), temperature: 72, rainfall: 0 },
          { date: new Date(Date.now() + 86400000).toLocaleDateString(), temperature: 74, rainfall: 0.1 },
          { date: new Date(Date.now() + 172800000).toLocaleDateString(), temperature: 71, rainfall: 0.2 },
        ],
      },
      soil: fallbackSoilData,
      recommendations: fallbackRecommendations,
      rotationPlans: generateFallbackRotationPlans(fallbackRecommendations),
    }
  }
}

