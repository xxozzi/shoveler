"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Map, Layers, Settings, Ruler, Pencil, Eraser, Download, Share2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Sidebar() {
  const [activeButton, setActiveButton] = useState<string | null>(null)

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(activeButton === buttonName ? null : buttonName)

    // Here you would implement the actual functionality for each button
    switch (buttonName) {
      case "draw":
        console.log("Draw tool activated")
        // You would trigger the draw mode on the map
        break
      case "erase":
        console.log("Erase tool activated")
        // You would trigger the erase mode on the map
        break
      case "measure":
        console.log("Measure tool activated")
        // You would trigger the measurement mode on the map
        break
      case "layers":
        console.log("Layers panel opened")
        // You would open a layers panel
        break
      case "basemap":
        console.log("Basemap selection opened")
        // You would open a basemap selection panel
        break
      case "download":
        console.log("Download options opened")
        // You would open download options
        break
      case "share":
        console.log("Share options opened")
        // You would open share options
        break
      case "settings":
        console.log("Settings opened")
        // You would open settings
        break
    }
  }

  return (
    <TooltipProvider>
      <div className="w-16 border-r bg-muted/40 flex flex-col items-center py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeButton === "draw" ? "default" : "ghost"}
              size="icon"
              className="rounded-full mb-4"
              onClick={() => handleButtonClick("draw")}
            >
              <Pencil className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Draw Area</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeButton === "erase" ? "default" : "ghost"}
              size="icon"
              className="rounded-full mb-4"
              onClick={() => handleButtonClick("erase")}
            >
              <Eraser className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Erase Area</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeButton === "measure" ? "default" : "ghost"}
              size="icon"
              className="rounded-full mb-4"
              onClick={() => handleButtonClick("measure")}
            >
              <Ruler className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Measure Distance</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeButton === "layers" ? "default" : "ghost"}
              size="icon"
              className="rounded-full mb-4"
              onClick={() => handleButtonClick("layers")}
            >
              <Layers className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Map Layers</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeButton === "basemap" ? "default" : "ghost"}
              size="icon"
              className="rounded-full mb-4"
              onClick={() => handleButtonClick("basemap")}
            >
              <Map className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Change Basemap</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex-1"></div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeButton === "download" ? "default" : "ghost"}
              size="icon"
              className="rounded-full mb-4"
              onClick={() => handleButtonClick("download")}
            >
              <Download className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Download Report</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeButton === "share" ? "default" : "ghost"}
              size="icon"
              className="rounded-full mb-4"
              onClick={() => handleButtonClick("share")}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Share Analysis</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeButton === "settings" ? "default" : "ghost"}
              size="icon"
              className="rounded-full"
              onClick={() => handleButtonClick("settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

