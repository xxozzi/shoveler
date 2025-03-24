"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Map, Layers, Settings, Ruler, Pencil, Eraser, Download, Share2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Sidebar() {
  const [activeButton, setActiveButton] = useState<string | null>(null)

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(activeButton === buttonName ? null : buttonName)

    switch (buttonName) {
      case "draw":
        console.log("Draw tool activated")
        break
      case "erase":
        console.log("Erase tool activated")
        break
      case "measure":
        console.log("Measure tool activated")
        break
      case "layers":
        console.log("Layers panel opened")
        break
      case "basemap":
        console.log("Basemap selection opened")
        break
      case "download":
        console.log("Download options opened")
        break
      case "share":
        console.log("Share options opened")
        break
      case "settings":
        console.log("Settings opened")
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
