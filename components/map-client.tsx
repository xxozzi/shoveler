"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Square, Pencil, Trash2, Check, Edit2, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { useMap } from "react-leaflet"
import { Input } from "@/components/ui/input"

declare global {
  interface Window {
    mapInstance: any
    showLocationMarker: (location: any) => void
    searchMarker: any
  }
}

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const FeatureGroup = dynamic(() => import("react-leaflet").then((mod) => mod.FeatureGroup), { ssr: false })

const MapResizer = () => {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    const handleResize = () => {
      map.invalidateSize()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [map])

  return null
}

const CustomStyles = () => {
  useEffect(() => {
    // Add custom CSS for styling
    const style = document.createElement("style")
    style.innerHTML = `
    /* Style the drawn shapes */
    .leaflet-interactive {
      stroke: #3FB911 !important;
      fill: #3FB911 !important;
      fill-opacity: 0.2 !important;
    }
    
    /* Hide default zoom control */
    .leaflet-control-zoom {
      display: none !important;
    }
    
    .leaflet-control-attribution {
      background-color: rgba(0, 0, 0, 0.3) !important;
      backdrop-filter: blur(8px) !important;
      color: white !important;
      border-radius: 8px !important;
      padding: 4px 8px !important;
      margin: 10px !important;
    }
    
    .leaflet-control-attribution a {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    /* Animation for polygon fill */
    @keyframes fillAnimation {
      0% {
        fill-opacity: 0;
      }
      100% {
        fill-opacity: 0.2;
      }
    }
    
    .fill-animation {
      animation: fillAnimation 0.5s ease-out forwards;
    }
    
    /* Region label styles */
    .region-label {
      background: transparent;
      border: none;
      box-shadow: none;
      text-align: center;
    }

    .region-label div {
      display: inline-block;
      text-align: center;
      font-weight: 500;
      white-space: nowrap;
      transform: translateX(-50%);
    }
    
    /* Vertex marker styles */
    .vertex-marker {
      border-radius: 50%;
      border: 2px solid #3FB911;
      background-color: white;
    }
    
    /* Vertex edit marker styles */
    .vertex-edit-marker {
      background: transparent;
      border: none;
      box-shadow: none;
    }
    
    .vertex-edit-marker div {
      cursor: move;
      box-shadow: 0 0 4px rgba(0,0,0,0.4);
    }
    
    /* Search results styles */
    .search-results {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .search-result-item {
      transition: all 0.2s ease;
    }
    
    .search-result-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .location-marker {
      z-index: 1000 !important;
    }
    
    .location-marker div {
      transform: scale(1);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
      }
      
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
      }
      
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
      }
    }

    /* Custom marker styles */
    .custom-marker {
      z-index: 1000 !important;
      pointer-events: none;
    }

    .custom-marker div {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      }
      
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
      }
      
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
      }
    }

    .animate-pulse {
      animation: pulse 2s infinite;
    }
  `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}



// ngl not necessary 
const LeafletDrawFix = () => {
  useEffect(() => {
    if (!window.L) return

    if (!window.L.GeometryUtil) {
      window.L.GeometryUtil = {
        geodesicArea: (latLngs: any[]) => {
          let area = 0
          const d2r = Math.PI / 180
          let p1, p2

          if (!latLngs || latLngs.length < 3) {
            return area
          }

          for (let i = 0; i < latLngs.length; i++) {
            p1 = latLngs[i]
            p2 = latLngs[(i + 1) % latLngs.length]
            area += (p2.lng - p1.lng) * d2r * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r))
          }
          area = (area * 6378137.0 * 6378137.0) / 2.0
          return Math.abs(area)
        },
      }
    }

    const style = document.createElement("style")
    style.innerHTML = `
      .leaflet-container button svg {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }
      
      .leaflet-container button {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}

const sampleLocations = [
  {
    id: 1,
    name: "Fayette County Farm",
    location: "Kentucky",
    acres: 121,
    lat: 38.0406,
    lng: -84.5037,
    image: "/placeholder.svg?height=60&width=80",
  },
  {
    id: 2,
    name: "Blue Ridge Vineyard",
    location: "Virginia",
    acres: 45,
    lat: 37.3719,
    lng: -80.1514,
    image: "/placeholder.svg?height=60&width=80",
  },
  {
    id: 3,
    name: "Sunset Valley Orchard",
    location: "California",
    acres: 78,
    lat: 38.5816,
    lng: -122.9601,
    image: "/placeholder.svg?height=60&width=80",
  },
  {
    id: 4,
    name: "Green Meadows",
    location: "Iowa",
    acres: 210,
    lat: 41.878,
    lng: -93.0977,
    image: "/placeholder.svg?height=60&width=80",
  },
  {
    id: 5,
    name: "Highland Ranch",
    location: "Montana",
    acres: 350,
    lat: 46.8797,
    lng: -110.3626,
    image: "/placeholder.svg?height=60&width=80",
  },
]

interface Selection {
  id: string
  shape: any
  type: "rectangle" | "polygon"
  area: string
  name: string
  coordinates: any[]
  label?: any
}

interface MapClientProps {
  onAreaSelected: (area: any) => void
  onAnalyze: () => void
  isAnalyzing: boolean
}

export default function MapClient({ onAreaSelected, onAnalyze, isAnalyzing }: MapClientProps) {
  const [selections, setSelections] = useState<Selection[]>([])
  const [activeSelection, setActiveSelection] = useState<Selection | null>(null)
  const [activeDrawTool, setActiveDrawTool] = useState<string | null>(null)
  const [isNaming, setIsNaming] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState("")
  const [isAnalyzeActive, setIsAnalyzeActive] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const featureGroupRef = useRef<any>(null)
  const mapRef = useRef<any>(null)

  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [locationMarker, setLocationMarker] = useState<any>(null)
  const [locationInfoVisible, setLocationInfoVisible] = useState(false)

  useEffect(() => {
    if (!window.L) return

    delete (window.L.Icon.Default.prototype as any)._getIconUrl

    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)

    if (value.length > 1) {
      const results = sampleLocations.filter(
        (location) =>
          location.name.toLowerCase().includes(value.toLowerCase()) ||
          location.location.toLowerCase().includes(value.toLowerCase()),
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleResultClick = (result: any) => {
    setSearchValue(result.name)
    setSearchResults([])

    if (mapRef.current) {
      mapRef.current.flyTo([result.lat, result.lng], 14, {
        animate: true,
        duration: 1.5,
      })
    }
  }

  const MapControls = () => {
    const map = useMap()

    useEffect(() => {
      if (map) {
        mapRef.current = map
      }
    }, [map])

    useEffect(() => {
      if (map) {
        window.mapInstance = map
        window.showLocationMarker = (location) => {
          if (locationMarker) {
            map.removeLayer(locationMarker)
          }
          const marker = window.L.marker([location.lat, location.lng], {
            icon: window.L.divIcon({
              className: "location-marker",
              html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div class="w-2 h-2 bg-white rounded-full"></div>
                    </div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
          }).addTo(map)

          setLocationMarker(marker)
          setSelectedLocation(location)
          setLocationInfoVisible(true)
        }
      }

      return () => {
        window.mapInstance = undefined
        window.showLocationMarker = undefined
      }
    }, [map, locationMarker])

    const clearEditMarkers = () => {
      if (!map) return

      map.eachLayer((layer) => {
        if (layer._isEditMarker) {
          map.removeLayer(layer)
        }
      })
    }

    const clearSelection = (id?: string) => {
      if (!map) return

      clearEditMarkers()

      if (id) {
        const selection = selections.find((s) => s.id === id)
        if (selection && featureGroupRef.current) {
          featureGroupRef.current.removeLayer(selection.shape)

          if (selection.label) {
            map.removeLayer(selection.label)
          }

          setSelections((prev) => prev.filter((s) => s.id !== id))

          if (activeSelection?.id === id) {
            setActiveSelection(null)
            setIsAnalyzeActive(false)
          }
        }
      } else if (activeSelection) {
        if (featureGroupRef.current) {
          featureGroupRef.current.removeLayer(activeSelection.shape)

          if (activeSelection.label) {
            map.removeLayer(activeSelection.label)
          }

          setSelections((prev) => prev.filter((s) => s.id !== activeSelection.id))
          setActiveSelection(null)
          setIsAnalyzeActive(false)
        }
      }
    }

    const createVertexMarker = (latlng: any, isDraggable = false) => {
      if (isDraggable) {
        return window.L.marker(latlng, {
          draggable: true,
          icon: window.L.divIcon({
            className: "vertex-edit-marker",
            html: `<div class="w-3 h-3 bg-white border-2 border-green-600 rounded-full"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          }),
        })
      } else {
        return window.L.circleMarker(latlng, {
          radius: 4,
          color: "#3FB911",
          fillColor: "#FFFFFF",
          fillOpacity: 1,
          weight: 2,
          className: "vertex-marker",
        })
      }
    }

    const isPointNearPoint = (point1: any, point2: any, pixelDistance = 15) => {
      const p1Pixel = map.latLngToContainerPoint(point1)
      const p2Pixel = map.latLngToContainerPoint(point2)
      return p1Pixel.distanceTo(p2Pixel) < pixelDistance
    }

    const drawRectangle = () => {
      if (!window.L || !map) return

      if (activeDrawTool === "polygon") {
        map.off("click")
        map.off("dblclick")
      }

      setActiveDrawTool("rectangle")

      let startPoint: any = null
      let rectangle: any = null
      let vertexMarkers: any[] = []

      const onMouseDown = (e: any) => {
        e.originalEvent.stopPropagation()
        e.originalEvent.preventDefault()

        startPoint = e.latlng

        const startMarker = createVertexMarker(startPoint)
        startMarker.addTo(map)
        vertexMarkers.push(startMarker)

        map.dragging.disable()
        map.on("mousemove", onMouseMove)
        map.on("mouseup", onMouseUp)

        document.addEventListener("mouseup", onMouseUp)
      }

      const onMouseMove = (e: any) => {
        if (startPoint) {
          const bounds = window.L.latLngBounds(startPoint, e.latlng)

          if (rectangle) {
            rectangle.setBounds(bounds)
          } else {
            rectangle = window.L.rectangle(bounds, {
              color: "#3FB911",
              weight: 2,
              fillOpacity: 0,
            }).addTo(map)
          }
          if (vertexMarkers.length === 1) {
            const corners = [bounds.getNorthEast(), bounds.getSouthEast(), bounds.getSouthWest()]

            corners.forEach((corner) => {
              const marker = createVertexMarker(corner)
              marker.addTo(map)
              vertexMarkers.push(marker)
            })
          } else if (vertexMarkers.length === 4) {
            const corners = [bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthEast(), bounds.getSouthWest()]

            vertexMarkers.forEach((marker, index) => {
              marker.setLatLng(corners[index])
            })
          }
        }
      }

      const onMouseUp = (e: any) => {
        if (startPoint && rectangle) {
          map.off("mousemove", onMouseMove)
          map.off("mouseup", onMouseUp)
          document.removeEventListener("mouseup", onMouseUp)

          map.dragging.enable()
          vertexMarkers.forEach((marker) => map.removeLayer(marker))
          vertexMarkers = []

          const bounds = rectangle.getBounds()
          const corners = [bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthEast(), bounds.getSouthWest()]

          const areaInSqMeters = window.L.GeometryUtil.geodesicArea(corners)
          const areaInAcres = areaInSqMeters * 0.000247105

          const id = `rect-${Date.now()}`
          const name = `Region ${selections.length + 1}`

          const path = rectangle.getElement()
          if (path) {
            path.classList.add("fill-animation")
          }

          const newSelection: Selection = {
            id,
            shape: rectangle,
            type: "rectangle",
            area: areaInAcres.toFixed(2),
            name,
            coordinates: corners,
          }

          if (featureGroupRef.current) {
            featureGroupRef.current.addLayer(rectangle)

            rectangle.on("click", (e: any) => {
              window.L.DomEvent.stopPropagation(e)

              selectRegion(newSelection)
            })
          }
          const center = bounds.getCenter()

          const icon = window.L.divIcon({
            className: "region-label",
            html: `<div class="bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap text-center">${name}</div>`,
            iconSize: [null, 20], // Allow width to grow with content
            iconAnchor: [null, 10], 
          })

          const label = window.L.marker(center, {
            icon: icon,
            interactive: false,
            zIndexOffset: 1000,
          }).addTo(map)

          newSelection.label = label
          setSelections((prev) => [...prev, newSelection])

          setTimeout(() => {
            setActiveSelection(newSelection)
            setIsAnalyzeActive(true)

            onAreaSelected({
              type: newSelection.type,
              coordinates: newSelection.coordinates,
              area: newSelection.area,
              name: newSelection.name,
            })

            showVerticesForSelection(newSelection)
          }, 0)

          map.off("mousedown", onMouseDown)
          setActiveDrawTool(null)
        }
      }

      map.on("mousedown", onMouseDown)
    }

    const drawPolygon = () => {
      if (!window.L || !map) return

      if (activeDrawTool === "rectangle") {
        map.off("mousedown")
      }

      setActiveDrawTool("polygon")

      const points: any[] = []
      let polyline: any = null
      const markers: any[] = []
      const SNAP_DISTANCE = 15 // pixels

      const onClick = (e: any) => {
        e.originalEvent.stopPropagation()

        let pointToAdd = e.latlng

        // Check if we're closing the polygon by clicking near the first point
        if (points.length > 2 && isPointNearPoint(pointToAdd, points[0], SNAP_DISTANCE)) {
          finishPolygon()
          return
        }

        for (let i = 0; i < points.length; i++) {
          if (isPointNearPoint(pointToAdd, points[i], SNAP_DISTANCE)) {
            pointToAdd = points[i]
            break
          }
        }

        points.push(pointToAdd)

        const marker = createVertexMarker(pointToAdd)
        marker.addTo(map)
        markers.push(marker)

        if (polyline) {
          polyline.setLatLngs(points)
        } else {
          polyline = window.L.polyline(points, {
            color: "#3FB911",
            weight: 2,
          }).addTo(map)
        }
      }

      const onDblClick = (e: any) => {
        e.originalEvent.stopPropagation()

        if (points.length >= 3) {
          finishPolygon()
        }
      }

      const finishPolygon = () => {
        if (points.length >= 3) {
          map.off("click", onClick)
          map.off("dblclick", onDblClick)

          if (polyline) {
            map.removeLayer(polyline)
          }

          const polygon = window.L.polygon(points, {
            color: "#3FB911",
            weight: 2,
            fillOpacity: 0.2,
          }).addTo(map)

          const path = polygon.getElement()
          if (path) {
            path.classList.add("fill-animation")
          }

          const id = `poly-${Date.now()}`
          const name = `Region ${selections.length + 1}`

          const areaInSqMeters = window.L.GeometryUtil.geodesicArea(points)
          const areaInAcres = areaInSqMeters * 0.000247105

          let lat = 0,
            lng = 0
          for (let i = 0; i < points.length; i++) {
            lat += points[i].lat
            lng += points[i].lng
          }
          const center = window.L.latLng(lat / points.length, lng / points.length)

          const newSelection: Selection = {
            id,
            shape: polygon,
            type: "polygon",
            area: areaInAcres.toFixed(2),
            name,
            coordinates: points,
          }

          if (featureGroupRef.current) {
            featureGroupRef.current.addLayer(polygon)

            polygon.on("click", (e: any) => {
              window.L.DomEvent.stopPropagation(e)

              selectRegion(newSelection)
            })
          }

          const icon = window.L.divIcon({
            className: "region-label",
            html: `<div class="bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap text-center">${name}</div>`,
            iconSize: [null, 20], 
            iconAnchor: [null, 10],
          })

          const label = window.L.marker(center, {
            icon: icon,
            interactive: false,
            zIndexOffset: 1000,
          }).addTo(map)

          newSelection.label = label

          markers.forEach((marker) => map.removeLayer(marker))

          setSelections((prev) => [...prev, newSelection])

          setTimeout(() => {
            setActiveSelection(newSelection)
            setIsAnalyzeActive(true)

            onAreaSelected({
              type: newSelection.type,
              coordinates: newSelection.coordinates,
              area: newSelection.area,
              name: newSelection.name,
            })

            showVerticesForSelection(newSelection)
          }, 0)

          setActiveDrawTool(null)
        }
      }

      map.on("click", onClick)
      map.on("dblclick", onDblClick)
    }

    const handleAnalyze = () => {
      if (activeSelection) {
        onAreaSelected({
          type: activeSelection.type,
          coordinates: activeSelection.coordinates,
          area: activeSelection.area,
          name: activeSelection.name,
        })

        onAnalyze()
      }
    }

    const handleNameSave = () => {
      if (isNaming && nameInput.trim()) {
        setSelections((prev) =>
          prev.map((s) => {
            if (s.id === isNaming) {
              const updated = { ...s, name: nameInput.trim() }

              if (updated.label) {
                map.removeLayer(updated.label)

                let center
                if (updated.type === "rectangle") {
                  center = updated.shape.getBounds().getCenter()
                } else {
                  const latLngs = updated.shape.getLatLngs()[0]
                  let lat = 0,
                    lng = 0
                  for (let i = 0; i < latLngs.length; i++) {
                    lat += latLngs[i].lat
                    lng += latLngs[i].lng
                  }
                  center = window.L.latLng(lat / latLngs.length, lng / latLngs.length)
                }

                const icon = window.L.divIcon({
                  className: "region-label",
                  html: `<div class="bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap text-center">${nameInput.trim()}</div>`,
                  iconSize: [null, 20],
                  iconAnchor: [null, 10],
                })

                const label = window.L.marker(center, {
                  icon: icon,
                  interactive: false,
                  zIndexOffset: 1000,
                }).addTo(map)

                updated.label = label
              }

              return updated
            }
            return s
          }),
        )

        if (activeSelection && activeSelection.id === isNaming) {
          const updated = {
            ...activeSelection,
            name: nameInput.trim(),
          }
          setActiveSelection(updated)

          onAreaSelected({
            type: updated.type,
            coordinates: updated.coordinates,
            area: updated.area,
            name: updated.name,
          })
        }

        setIsNaming(null)
        setNameInput("")
      }
    }

    const showVerticesForSelection = (selection: Selection) => {
      clearEditMarkers()

      if (!selection) return

      const vertexMarkers: any[] = []

      if (selection.type === "rectangle") {
        const bounds = selection.shape.getBounds()
        const corners = [bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthEast(), bounds.getSouthWest()]

        corners.forEach((corner, index) => {
          const marker = createVertexMarker(corner, true)
          marker.addTo(map)

          marker._isEditMarker = true

          marker.on("drag", (e) => {
            const newPos = e.target.getLatLng()

            const newCorners = [...corners]

            newCorners[index] = newPos

            if (index === 0) {
              // NorthWest
              newCorners[1] = window.L.latLng(newPos.lat, newCorners[1].lng) // NorthEast - same latitude
              newCorners[3] = window.L.latLng(newCorners[3].lat, newPos.lng) // SouthWest - same longitude
            } else if (index === 1) {
              // NorthEast
              newCorners[0] = window.L.latLng(newPos.lat, newCorners[0].lng) // NorthWest - same latitude
              newCorners[2] = window.L.latLng(newCorners[2].lat, newPos.lng) // SouthEast - same longitude
            } else if (index === 2) {
              // SouthEast
              newCorners[3] = window.L.latLng(newPos.lat, newCorners[3].lng) // SouthWest - same latitude
              newCorners[1] = window.L.latLng(newCorners[1].lat, newPos.lng) // NorthEast - same longitude
            } else if (index === 3) {
              // SouthWest
              newCorners[2] = window.L.latLng(newPos.lat, newCorners[2].lng) // SouthEast - same latitude
              newCorners[0] = window.L.latLng(newCorners[0].lat, newPos.lng) // NorthWest - same longitude
            }

            vertexMarkers.forEach((m, i) => {
              if (i !== index) {
                // Don't update the one being dragged
                m.setLatLng(newCorners[i])
              }
            })

            selection.shape.setBounds(window.L.latLngBounds(newCorners[0], newCorners[2]))

            const areaInSqMeters = window.L.GeometryUtil.geodesicArea(newCorners)
            const areaInAcres = areaInSqMeters * 0.000247105
            selection.area = areaInAcres.toFixed(2)

            selection.coordinates = newCorners

            if (selection.label) {
              const center = selection.shape.getBounds().getCenter()
              selection.label.setLatLng(center)
            }
          })

          marker.on("dragend", () => {
            onAreaSelected({
              type: selection.type,
              coordinates: selection.coordinates,
              area: selection.area,
              name: selection.name,
            })
          })

          vertexMarkers.push(marker)
        })
      } else if (selection.type === "polygon") {
        const latLngs = selection.shape.getLatLngs()[0]

        latLngs.forEach((point, index) => {
          const marker = createVertexMarker(point, true)
          marker.addTo(map)

          marker._isEditMarker = true

          marker.on("drag", (e) => {
            latLngs[index] = e.target.getLatLng()
            selection.shape.setLatLngs(latLngs)

            const areaInSqMeters = window.L.GeometryUtil.geodesicArea(latLngs)
            const areaInAcres = areaInSqMeters * 0.000247105
            selection.area = areaInAcres.toFixed(2)

            selection.coordinates = latLngs

            if (selection.label) {
              let lat = 0,
                lng = 0
              for (let i = 0; i < latLngs.length; i++) {
                lat += latLngs[i].lat
                lng += latLngs[i].lng
              }
              const center = window.L.latLng(lat / latLngs.length, lng / latLngs.length)
              selection.label.setLatLng(center)
            }
          })

          marker.on("dragend", () => {
            onAreaSelected({
              type: selection.type,
              coordinates: selection.coordinates,
              area: selection.area,
              name: selection.name,
            })
          })

          vertexMarkers.push(marker)
        })
      }
    }

    const selectRegion = (selection: Selection) => {
      const currentSelection = selections.find((s) => s.id === selection.id) || selection

      setActiveSelection(currentSelection)
      setIsAnalyzeActive(true)

      showVerticesForSelection(currentSelection)

      onAreaSelected({
        type: currentSelection.type,
        coordinates: currentSelection.coordinates,
        area: currentSelection.area,
        name: currentSelection.name,
      })
    }

    return (
      <>
        <div className="absolute bottom-6 left-0 right-0 z-[1000] flex justify-center">
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-full px-3 py-2 space-x-2 shadow-lg">
            <button
              className={`w-10 h-10 flex items-center justify-center rounded-full ${activeDrawTool === "rectangle" ? "bg-white/20" : "bg-transparent"} hover:bg-white/10 transition-all`}
              onClick={(e) => {
                e.stopPropagation()
                if (activeDrawTool === "rectangle") {
                  setActiveDrawTool(null)
                  map.off("mousedown")
                } else {
                  drawRectangle()
                }
              }}
            >
              <Square className="w-5 h-5 text-white" />
            </button>
            <button
              className={`w-10 h-10 flex items-center justify-center rounded-full ${activeDrawTool === "polygon" ? "bg-white/20" : "bg-transparent"} hover:bg-white/10 transition-all`}
              onClick={(e) => {
                e.stopPropagation()
                if (activeDrawTool === "polygon") {
                  setActiveDrawTool(null)
                  map.off("click")
                  map.off("dblclick")
                } else {
                  drawPolygon()
                }
              }}
            >
              <Pencil className="w-5 h-5 text-white" />
            </button>
            <button
              className={`w-10 h-10 flex items-center justify-center rounded-full ${!activeSelection ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"} transition-all`}
              onClick={(e) => {
                e.stopPropagation()
                if (activeSelection) {
                  clearSelection()
                }
              }}
              disabled={!activeSelection}
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
            <div className="w-px h-8 bg-white/20"></div>
            {activeSelection ? (
              <button
                className={`px-4 py-2 rounded-full font-medium ${
                  isAnalyzing
                    ? "bg-primary/70 text-primary-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                } transition-all flex items-center`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleAnalyze()
                }}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <div className="flex flex-row gap-2">
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  "Analyze"
                )}
              </button>
            ) : (
              <button
                className="px-4 py-2 rounded-full font-medium bg-gray-500/50 text-gray-300 cursor-not-allowed transition-all"
                disabled={true}
              >
                Analyze
              </button>
            )}
          </div>
        </div>

        {activeSelection && (
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-[1000] bg-black/30 backdrop-blur-md rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              {isNaming === activeSelection.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleNameSave()
                  }}
                  className="flex items-center space-x-2"
                >
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="h-8 bg-black/20 border-white/20 text-white w-40"
                    placeholder="Enter region name"
                    autoFocus
                  />
                  <button type="submit" className="p-1 rounded-full bg-green-500/80 hover:bg-green-500">
                    <Check className="h-4 w-4 text-white" />
                  </button>
                </form>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsNaming(activeSelection.id)
                      setNameInput(activeSelection.name)
                    }}
                    className="text-white font-medium hover:underline flex items-center"
                  >
                    {activeSelection.name} 
                    <Edit2 className="h-3 w-3 ml-2 text-white/70" />
                  </button>
                  <span className="text-white/70 text-sm">({activeSelection.area} acres)</span>
                </>
              )}
            </div>
          </div>
        )}
      </>
    )
  }

  // yo, gotta make a wrapper for the map controls
  const MapControlsWrapper = () => {
    // just making sure we only show controls when map's rdy
    return (
      <>
        <MapResizer />
        <CustomStyles />
        <LeafletDrawFix />
        <MapControls />
      </>
    )
  }

  const handleMapClick = () => {
    // When clicking on the map (not on a polygon), deselect any active selection
    setActiveSelection(null)
    setIsAnalyzeActive(false)
  }

  return (
    <div className="w-full h-full absolute inset-0">
      <MapContainer
        center={[39.8283, -98.5795]} // Center of the US
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        zoomControl={false} // Hide default zoom control
        onClick={handleMapClick}
      >
        {/* Satellite imagery from ESRI */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        <FeatureGroup ref={featureGroupRef} />
        <MapControlsWrapper />
      </MapContainer>
    </div>
  )
}

