"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaAnalysis } from "@/components/area-analysis"
import { CropRecommendations } from "@/components/crop-recommendations"
import { CropRotation } from "@/components/crop-rotation"
import { AskAI } from "@/components/ask-ai"
import { Header } from "@/components/header"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { analyzeArea } from "@/services/api-service"

const MapWithNoSSR = dynamic(() => import("@/components/map"), {
  ssr: false,
})

export default function Home() {
  const [selectedArea, setSelectedArea] = useState<any>(null)
  const [areaData, setAreaData] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("analysis")
  const [pendingAnalysis, setPendingAnalysis] = useState(false)

  const handleAreaSelected = (area: any) => {
    if (!selectedArea || selectedArea.name !== area.name || selectedArea.area !== area.area) {
      setSelectedArea(area)

      if (pendingAnalysis) {
        analyzeAreaData(area)
        setPendingAnalysis(false)
      }
    }
  }

  const analyzeAreaData = async (areaToAnalyze = null) => {
    const area = areaToAnalyze || selectedArea

    if (!area) {
      setPendingAnalysis(true)
      return
    }

    setIsAnalyzing(true)

    try {
      let lat, lng

      if (area.type === "rectangle") {
        const bounds = area.coordinates
        lat = (bounds[0].lat + bounds[2].lat) / 2
        lng = (bounds[0].lng + bounds[2].lng) / 2
      } else {
        let sumLat = 0,
          sumLng = 0
        area.coordinates.forEach((coord: any) => {
          sumLat += coord.lat
          sumLng += coord.lng
        })
        lat = sumLat / area.coordinates.length
        lng = sumLng / area.coordinates.length
      }

      try {
        const analysisData = await analyzeArea(lat, lng, Number.parseFloat(area.area), area.name)

        setAreaData(analysisData)
      } catch (apiError) {
        console.error("Error analyzing area:", apiError)
        // Use fallback data in case of API error
        setAreaData(getFallbackData(area))
      }
    } catch (error) {
      console.error("Error analyzing area:", error)
      // Fallback to mock data in case of error
      setAreaData(getFallbackData(area))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getFallbackData = (area: any) => {
    return {
      location: "Fayette County, Kentucky",
      acres: area.area,
      regionName: area.name,
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
      soil: {
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
      },
      recommendations: [
        {
          crop: "Alfalfa",
          yield: "5.2 tons per acre",
          marketPrice: "$237 per ton",
          productionCost: "$400 per acre",
          profit: "$832 per acre",
          totalProfit: "$100,672",
          confidence: 85,
        },
        {
          crop: "Winter Wheat",
          yield: "68.2 bushels per acre",
          marketPrice: "$6.50 per bushel",
          productionCost: "$350 per acre",
          profit: "$93 per acre",
          totalProfit: "$11,253",
          confidence: 78,
        },
        {
          crop: "Barley",
          yield: "55 bushels per acre",
          marketPrice: "$5.20 per bushel",
          productionCost: "$320 per acre",
          profit: "$41 per acre",
          totalProfit: "$4,961",
          confidence: 72,
        },
      ],
      rotationPlans: {
        threeYearPlans: [
          {
            name: "Standard Rotation",
            years: ["Alfalfa", "Winter Wheat", "Soybeans"],
            benefits:
              "This rotation helps break pest cycles and balances soil nutrients. Alfalfa adds nitrogen, wheat uses moderate nutrients, and soybeans replenish nitrogen.",
          },
          {
            name: "Alternative Rotation",
            years: ["Winter Wheat", "Corn", "Soybeans"],
            benefits:
              "This rotation is ideal for maximizing market opportunities. Winter wheat followed by corn utilizes different soil depths, and soybeans help restore nitrogen.",
          },
        ],
        fiveYearPlans: [
          {
            name: "Extended Rotation",
            years: ["Alfalfa", "Alfalfa", "Winter Wheat", "Corn", "Soybeans"],
            benefits:
              "This five-year rotation maximizes soil health and long-term sustainability. The extended alfalfa period builds significant soil organic matter and nitrogen reserves.",
          },
        ],
      },
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 relative">
          <MapWithNoSSR onAreaSelected={handleAreaSelected} onAnalyze={analyzeAreaData} isAnalyzing={isAnalyzing} />
        </div>

        <AnimatePresence>
          {areaData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            >
              <motion.div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[80vh] overflow-hidden flex flex-col"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                exit={{ y: 20 }}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-semibold">{areaData.regionName} Analysis</h2>
                  <Button variant="ghost" size="icon" onClick={() => setAreaData(null)} className="rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 pt-2">
                    <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                      <TabsTrigger value="analysis" className="rounded-full">
                        Area Analysis
                      </TabsTrigger>
                      <TabsTrigger value="recommendations" className="rounded-full">
                        Crop Recommendations
                      </TabsTrigger>
                      <TabsTrigger value="rotation" className="rounded-full">
                        Crop Rotation
                      </TabsTrigger>
                      <TabsTrigger value="ask" className="rounded-full">
                        Ask AI
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    <TabsContent value="analysis" className="mt-0 h-full">
                      <AreaAnalysis data={areaData} />
                    </TabsContent>
                    <TabsContent value="recommendations" className="mt-0 h-full">
                      <CropRecommendations data={areaData} />
                    </TabsContent>
                    <TabsContent value="rotation" className="mt-0 h-full">
                      <CropRotation data={areaData} />
                    </TabsContent>
                    <TabsContent value="ask" className="mt-0 h-full">
                      <AskAI data={areaData} />
                    </TabsContent>
                  </div>
                </Tabs>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

