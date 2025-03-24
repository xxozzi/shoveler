"use client"

import { useState } from "react"
import { useMap } from "react-leaflet"
import { Layers } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function MapTypeSelector() {
  const map = useMap()
  const [isOpen, setIsOpen] = useState(false)
  const [activeMapType, setActiveMapType] = useState<string>("satellite")

  const mapTypes = [
    {
      id: "satellite",
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    },
    {
      id: "topo",
      name: "Topographic",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    },
    {
      id: "street",
      name: "Street",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    },
  ]

  const changeMapType = (mapType: any) => {
    if (typeof window === "undefined") return

    const L = window.L
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    L.tileLayer(mapType.url, {
      attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
    }).addTo(map)

    setActiveMapType(mapType.id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md hover:bg-black/40 transition-all shadow-lg"
      >
        <Layers className="w-5 h-5 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-md rounded-lg p-2 shadow-lg w-40"
          >
            {mapTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => changeMapType(type)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                  activeMapType === type.id ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"
                }`}
              >
                {type.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

