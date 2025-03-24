"use client"

import React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight } from "lucide-react"

interface CropRotationProps {
  data: any
}

export function CropRotation({ data }: CropRotationProps) {
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

  const cropColors: any = {
    Alfalfa: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400" },
    "Winter Wheat": { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
    Soybeans: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
    Corn: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400" },
    Barley: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-600 dark:text-yellow-400" },
  }

  const defaultColor = { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-6">
      <motion.div variants={item}>
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600/90 to-green-500/90 text-white">
            <CardTitle>Crop Rotation Plans</CardTitle>
            <CardDescription className="text-white/80">
              Optimize soil health and yields with these rotation strategies
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="three-year">
              <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 mb-6">
                <TabsTrigger value="three-year" className="rounded-full">
                  3-Year Plan
                </TabsTrigger>
                <TabsTrigger value="five-year" className="rounded-full">
                  5-Year Plan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="three-year">
                <div className="space-y-8">
                  {data.rotationPlans.threeYearPlans.map((plan: any, planIndex: number) => (
                    <motion.div
                      key={planIndex}
                      variants={item}
                      whileHover={{ y: -5 }}
                      className="rounded-xl p-6 bg-gray-50 dark:bg-gray-800 shadow-sm"
                    >
                      <h3 className="text-xl font-semibold mb-6">{plan.name}</h3>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {plan.years.map((crop: string, yearIndex: number) => (
                          <React.Fragment key={yearIndex}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className={`text-center p-6 rounded-xl ${cropColors[crop]?.bg || defaultColor.bg} w-full md:w-1/4 shadow-sm`}
                            >
                              <div className="font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Year {yearIndex + 1}
                              </div>
                              <div className={`text-xl font-semibold ${cropColors[crop]?.text || defaultColor.text}`}>
                                {crop}
                              </div>
                            </motion.div>
                            {yearIndex < plan.years.length - 1 && (
                              <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 md:rotate-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="mt-6 p-4 rounded-lg bg-white dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                        <p>{plan.benefits}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="five-year">
                <div className="space-y-8">
                  {data.rotationPlans.fiveYearPlans.map((plan: any, planIndex: number) => (
                    <motion.div
                      key={planIndex}
                      variants={item}
                      whileHover={{ y: -5 }}
                      className="rounded-xl p-6 bg-gray-50 dark:bg-gray-800 shadow-sm"
                    >
                      <h3 className="text-xl font-semibold mb-6">{plan.name}</h3>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        {plan.years.map((crop: string, yearIndex: number) => (
                          <React.Fragment key={yearIndex}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className={`text-center p-4 rounded-xl ${cropColors[crop]?.bg || defaultColor.bg} w-full md:w-[18%] shadow-sm`}
                            >
                              <div className="font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Year {yearIndex + 1}
                              </div>
                              <div className={`text-lg font-semibold ${cropColors[crop]?.text || defaultColor.text}`}>
                                {crop}
                              </div>
                            </motion.div>
                            {yearIndex < plan.years.length - 1 && (
                              <ArrowRight className="h-5 w-5 text-gray-400 hidden md:block" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="mt-6 p-4 rounded-lg bg-white dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                        <p>{plan.benefits}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

