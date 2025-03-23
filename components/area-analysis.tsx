"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Sprout, Wind, Sun, Mountain, Droplet, Leaf } from "lucide-react"

interface AreaAnalysisProps {
  data: any
}

export function AreaAnalysis({ data }: AreaAnalysisProps) {
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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div variants={item} className="col-span-3">
        <Card className="overflow-hidden border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600/90 to-green-500/90 text-white">
            <CardTitle>{data.regionName} Rundown</CardTitle>
            <CardDescription className="text-white/80">
              Based on the selected area in {data.location}, which is approximately {data.acres} acres
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
              >
                <div className="text-gray-500 dark:text-gray-400 mb-2">Local Weather</div>
                <div className="flex items-center">
                  <Thermometer className="h-8 w-8 mr-3 text-orange-500" />
                  <span className="text-4xl font-bold">{data.weather.temperature}°F</span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
              >
                <div className="text-gray-500 dark:text-gray-400 mb-2">Humidity</div>
                <div className="flex items-center">
                  <Droplet className="h-8 w-8 mr-3 text-blue-500" />
                  <span className="text-4xl font-bold">{data.weather.humidity}%</span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
              >
                <div className="text-gray-500 dark:text-gray-400 mb-2">Soil Moisture</div>
                <div className="flex items-center">
                  <Sprout className="h-8 w-8 mr-3 text-green-500" />
                  <span className="text-4xl font-bold">{data.soil.moisture.toFixed(1)}%</span>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={item} className="space-y-4">
                <div className="flex items-center">
                  <Mountain className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold">Soil Analysis</h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Soil Type</p>
                      <p className="font-medium">{data.soil.soilType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">pH Level</p>
                      <p className="font-medium">{data.soil.ph.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Organic Carbon</p>
                      <p className="font-medium">{data.soil.organicCarbon.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nitrogen</p>
                      <p className="font-medium">{data.soil.nitrogen.toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Soil Texture</p>
                    <div className="flex items-center mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-blue-400 h-2.5 rounded-l-full"
                          style={{ width: `${data.soil.texture.clay}%` }}
                        ></div>
                        <div
                          className="bg-yellow-400 h-2.5"
                          style={{ width: `${data.soil.texture.silt}%`, marginTop: "-0.625rem" }}
                        ></div>
                        <div
                          className="bg-orange-400 h-2.5 rounded-r-full"
                          style={{ width: `${data.soil.texture.sand}%`, marginTop: "-0.625rem" }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span>Clay {data.soil.texture.clay}%</span>
                      <span>Silt {data.soil.texture.silt}%</span>
                      <span>Sand {data.soil.texture.sand}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-4">
                <div className="flex items-center">
                  <Sun className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold">Weather Forecast</h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 mr-1 text-orange-500" />
                        <span className="font-medium">{data.weather.temperature}°F</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Wind</p>
                      <div className="flex items-center">
                        <Wind className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="font-medium">{data.weather.windSpeed} mph</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rainfall</p>
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="font-medium">{data.weather.rainfall} in</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {data.weather.forecast.map((day: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{day.date}</span>
                        <div className="flex items-center">
                          <Thermometer className="h-4 w-4 mr-1 text-orange-500" />
                          <span className="text-sm font-medium">{day.temperature}°F</span>
                        </div>
                        <div className="flex items-center">
                          <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="text-sm font-medium">{day.rainfall} in</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-4">
                <div className="flex items-center">
                  <Wind className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold">Land Characteristics</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  The selected area has a {data.soil.soilType.toLowerCase()} soil composition with good drainage
                  properties, making it suitable for a variety of crops. The soil pH of {data.soil.ph.toFixed(1)} is{" "}
                  {data.soil.ph > 7 ? "slightly alkaline" : "slightly acidic"}, which is{" "}
                  {data.soil.ph > 5.5 && data.soil.ph < 7.5 ? "ideal" : "challenging"} for most crops.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  With {data.soil.organicCarbon.toFixed(1)}% organic carbon content, the soil has{" "}
                  {data.soil.organicCarbon > 2 ? "good" : "moderate"} fertility. The nitrogen level of{" "}
                  {data.soil.nitrogen.toFixed(2)}% indicates{" "}
                  {data.soil.nitrogen > 0.15 ? "sufficient" : "potentially insufficient"} nutrients for optimal plant
                  growth.
                </p>
              </motion.div>

              <motion.div variants={item} className="space-y-4">
                <div className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold">Growing Conditions</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Current weather conditions show a temperature of {data.weather.temperature}°F with{" "}
                  {data.weather.humidity}% humidity. The soil moisture level is at {data.soil.moisture.toFixed(1)}%,
                  which is{" "}
                  {data.soil.moisture > 10 && data.soil.moisture < 30
                    ? "optimal"
                    : data.soil.moisture <= 10
                      ? "low"
                      : "high"}{" "}
                  for most crops.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Based on the soil composition and current conditions, this land is particularly suitable for{" "}
                  {data.recommendations[0].crop.toLowerCase()}, which shows the highest profit potential at $
                  {data.recommendations[0].profit} per acre.
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

