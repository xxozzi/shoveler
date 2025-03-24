"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Send, User } from "lucide-react"

interface AskAIProps {
  data: any
}

export function AskAI({ data }: AskAIProps) {
  const [question, setQuestion] = useState("")
  const [conversation, setConversation] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content: `Hello! I'm your agricultural advisor AI. I can answer questions about your ${data.acres}-acre land in ${data.location}. What would you like to know about crop selection, farming practices, or market conditions?`,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setConversation([...conversation, { role: "user", content: question }])

    setIsLoading(true)

    try {
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY"

      const context = `
        Location: ${data.location}
        Area: ${data.acres} acres
        Soil Type: ${data.soil.soilType}
        Soil pH: ${data.soil.ph}
        Soil Moisture: ${data.soil.moisture}%
        Current Temperature: ${data.weather.temperature}°F
        Humidity: ${data.weather.humidity}%
        Recent Rainfall: ${data.weather.rainfall} inches
        
        Top Recommended Crops:
        ${data.recommendations
          .map(
            (crop: any, index: number) =>
              `${index + 1}. ${crop.crop} - Profit: ${crop.profit}, Confidence: ${crop.confidence}%`,
          )
          .join("\n")}
      `

      const history = conversation.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }))

      history.push({
        role: "user",
        parts: [{ text: question }],
      })

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are an agricultural advisor AI. You have access to the following data about a farm:
                    
                    ${context}
                    
                    Please answer the following question based on this data. Be helpful, concise, and specific.
                    
                    Question: ${question}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        },
      )

      const responseData = await response.json()
      console.log("Gemini API response:", JSON.stringify(responseData))

      let aiResponse = "I'm sorry, I couldn't generate a response. Please try again."

      if (
        responseData &&
        responseData.candidates &&
        responseData.candidates.length > 0 &&
        responseData.candidates[0].content &&
        responseData.candidates[0].content.parts &&
        responseData.candidates[0].content.parts.length > 0
      ) {
        let responseText = responseData.candidates[0].content.parts[0].text || aiResponse

        if (responseText.startsWith("```") && responseText.endsWith("```")) {
          const lines = responseText.split("\n")
          lines.shift()
          lines.pop()
          responseText = lines.join("\n")
        }

        aiResponse = responseText
      }

      setConversation([
        ...conversation,
        { role: "user", content: question },
        { role: "assistant", content: aiResponse },
      ])
    } catch (error) {
      console.error("Error getting AI response:", error)

      const fallbackResponses = [
        `Based on your soil moisture level of ${data.soil.moisture.toFixed(1)}% and the current temperature of ${data.weather.temperature}°F in ${data.location}, I recommend planting your ${data.recommendations[0].crop} in early spring. This will give you the best chance for the projected yield of ${data.recommendations[0].yield}.`,
        `For crop rotation after ${data.recommendations[0].crop}, I would suggest following with ${data.recommendations[1].crop} next season. This will help maintain soil health and nutrient balance while still providing good profitability.`,
        `Given the current market conditions, ${data.recommendations[0].crop} offers the best return on investment at ${data.recommendations[0].profit}. However, if you're concerned about market volatility, diversifying with some acreage of ${data.recommendations[2].crop} could provide risk mitigation.`,
        `The soil composition in your selected area is well-suited for ${data.recommendations[0].crop}. To maximize yields, consider applying a balanced fertilizer with emphasis on phosphorus and potassium before planting.`,
      ]

      setConversation([
        ...conversation,
        { role: "user", content: question },
        { role: "assistant", content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)] },
      ])
    } finally {
      setIsLoading(false)
      setQuestion("")
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="h-full flex flex-col border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600/90 to-green-500/90 text-white">
          <CardTitle>Ask AI Assistant</CardTitle>
          <CardDescription className="text-white/80">
            Get personalized advice about your land and agricultural practices
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            <AnimatePresence>
              {conversation.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`flex items-start gap-3 max-w-[80%] rounded-2xl p-4 ${
                      message.role === "assistant" ? "bg-gray-100 dark:bg-gray-800" : "bg-green-600 text-white"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    <div className="flex-1">{message.content}</div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-3 max-w-[80%] bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 bg-green-600 dark:bg-green-400 rounded-full animate-bounce"></div>
                      <div className="h-3 w-3 bg-green-600 dark:bg-green-400 rounded-full animate-bounce delay-75"></div>
                      <div className="h-3 w-3 bg-green-600 dark:bg-green-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="w-full flex gap-2">
            <Textarea
              placeholder="Ask about crop selection, farming practices, or market conditions..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 min-h-[60px] max-h-[120px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
            />
            <Button
              type="submit"
              size="icon"
              className="h-auto aspect-square bg-green-600 hover:bg-green-700 rounded-xl"
              disabled={isLoading || !question.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

