"use client"

import { useState } from "react"
import { useMap } from "react-leaflet"
import { Ruler } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function MeasurementTool() {
  const map = useMap()
  const [isActive, setIsActive] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [measurePoints, setMeasurePoints] = useState<any[]>([])
  const [measureLine, setMeasureLine] = useState<any>(null)
  const [measureMarkers, setMeasureMarkers] = useState<any[]>([])

  const toggleMeasurement = () => {
    if (typeof window === "undefined") return

    const L = window.L

    if (isActive) {
      if (measureLine) {
        map.removeLayer(measureLine)
        setMeasureLine(null)
      }

      measureMarkers.forEach((marker) => map.removeLayer(marker))
      setMeasureMarkers([])
      setMeasurePoints([])
      setDistance(null)

      map.off("click")
    } else {
      map.on("click", handleMapClick)
    }

    setIsActive(!isActive)
  }

  const handleMapClick = (e: any) => {
    if (typeof window === "undefined") return

    const L = window.L

    const newPoints = [...measurePoints, e.latlng]
    setMeasurePoints(newPoints)

    const marker = L.marker(e.latlng).addTo(map)
    setMeasureMarkers([...measureMarkers, marker])

    if (newPoints.length > 1) {
      if (measureLine) {
        measureLine.setLatLngs(newPoints)
      } else {
        const line = L.polyline(newPoints, {
          color: "#FF5722",
          weight: 3,
          dashArray: "5, 10",
        }).addTo(map)
        setMeasureLine(line)
      }

      let totalDistance = 0
      for (let i = 1; i < newPoints.length; i++) {
        totalDistance += newPoints[i - 1].distanceTo(newPoints[i])
      }

      const distanceInMiles = (totalDistance / 1609.34).toFixed(2)
      setDistance(Number.parseFloat(distanceInMiles))
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMeasurement}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-lg ${
          isActive ? "bg-primary text-primary-foreground" : "bg-black/30 backdrop-blur-md hover:bg-black/40 text-white"
        }`}
      >
        <Ruler className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {distance !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-md rounded-lg p-2 shadow-lg"
          >
            <p className="text-white text-sm">Distance: {distance} miles</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

