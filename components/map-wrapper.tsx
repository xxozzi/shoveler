"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const MapClientNoSSR = dynamic(() => import("./map-client"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-lg font-medium text-gray-500">Loading map...</div>
    </div>
  ),
})

interface MapWrapperProps {
  onAreaSelected: (area: any) => void
  onAnalyze: () => void
  isAnalyzing: boolean
  shouldRemount: boolean
  analyzedRegionId?: string | number
}

export default function MapWrapper({ 
  onAreaSelected, 
  onAnalyze, 
  isAnalyzing, 
  shouldRemount, 
  analyzedRegionId 
}: MapWrapperProps) {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    if (shouldRemount) {
      const timeoutId = setTimeout(() => {
        setMountKey(prev => prev + 1)
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [shouldRemount])

  return (
    <div className="w-full h-full">
      <MapClientNoSSR
        key={mountKey}
        onAreaSelected={onAreaSelected}
        onAnalyze={onAnalyze}
        isAnalyzing={isAnalyzing}
        analyzedRegionId={analyzedRegionId}
      />
    </div>
  )
}
