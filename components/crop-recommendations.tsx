"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Leaf, Wheat, BarcodeIcon as Barley } from "lucide-react"

interface CropRecommendationsProps {
  data: any
}

export function CropRecommendations({ data }: CropRecommendationsProps) {
  // Calculate the highest profit for scaling
  const highestProfit = Math.max(
    ...data.recommendations.map((rec: any) => Number.parseFloat(rec.profit.replace("$", "").replace(" per acre", ""))),
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  // Icons for different crops
  const cropIcons: any = {
    Alfalfa: Leaf,
    "Winter Wheat": Wheat,
    Barley: Barley,
    Corn: Wheat,
    Soybeans: Leaf,
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-6">
      <motion.div variants={item}>
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600/90 to-green-500/90 text-white">
            <CardTitle>Recommended Crops</CardTitle>
            <CardDescription className="text-white/80">
              Based on soil conditions, climate, and market prices for {data.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {data.recommendations.map((crop: any, index: number) => {
                const profitValue = Number.parseFloat(crop.profit.replace("$", "").replace(" per acre", ""))
                const profitPercentage = (profitValue / highestProfit) * 100
                const CropIcon = cropIcons[crop.crop] || Leaf

                return (
                  <motion.div
                    key={index}
                    variants={item}
                    whileHover={{ y: -5 }}
                    className="rounded-xl p-6 bg-gray-50 dark:bg-gray-800 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
                          <CropIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{crop.crop}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Yield: {crop.yield}</p>
                        </div>
                      </div>
                      <Badge
                        variant={index === 0 ? "default" : "outline"}
                        className={index === 0 ? "bg-green-600" : ""}
                      >
                        {index === 0 ? "Best Option" : index === 1 ? "Good Option" : "Alternative"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-white dark:bg-gray-700/50">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Market Price</p>
                        <p className="font-medium text-lg">{crop.marketPrice}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-gray-700/50">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Production Cost</p>
                        <p className="font-medium text-lg">{crop.productionCost}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Profit Potential</span>
                        <span className="text-sm font-medium">{crop.profit}</span>
                      </div>
                      <Progress value={profitPercentage} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Confidence</span>
                        <span className="text-xs font-medium">{crop.confidence}%</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Estimated Profit</span>
                        <span className="font-bold text-xl text-green-600 dark:text-green-400">{crop.totalProfit}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

