import dynamic from "next/dynamic"

// Dynamically import the map component with no SSR
const MapClientNoSSR = dynamic(() => import("./map-client"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-lg font-medium text-gray-500">Loading map...</div>
    </div>
  ),
})

// Update the MapProps interface to include isAnalyzing
interface MapProps {
  onAreaSelected: (area: any) => void
  onAnalyze: () => void
  isAnalyzing: boolean
}

export default function Map({ onAreaSelected, onAnalyze, isAnalyzing }: MapProps) {
  return <MapClientNoSSR onAreaSelected={onAreaSelected} onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} />
}

