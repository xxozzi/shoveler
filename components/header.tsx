"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Map, FileText, User, Menu, X, Plus, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sample data for search results with more Google Maps-like data
  const sampleLocations = [
    {
      id: 1,
      name: "Fayette County Farm",
      address: "1600 Man o' War Boulevard, Lexington, KY",
      location: "Kentucky",
      acres: 121,
      lat: 38.0406,
      lng: -84.5037,
      image: "/placeholder.svg?height=60&width=80",
      type: "Farm",
    },
    {
      id: 2,
      name: "Blue Ridge Vineyard",
      address: "1600 Man o' War Drive, Del Valle, TX",
      location: "Virginia",
      acres: 45,
      lat: 37.3719,
      lng: -80.1514,
      image: "/placeholder.svg?height=60&width=80",
      type: "Vineyard",
    },
    {
      id: 3,
      name: "Sunset Valley Orchard",
      address: "1600 Man o' War Place, Lexington, KY",
      location: "California",
      acres: 78,
      lat: 38.5816,
      lng: -122.9601,
      image: "/placeholder.svg?height=60&width=80",
      type: "Orchard",
    },
    {
      id: 4,
      name: "Green Meadows",
      address: "1600 Man o' War Drive, Harker Heights, TX",
      location: "Iowa",
      acres: 210,
      lat: 41.878,
      lng: -93.0977,
      image: "/placeholder.svg?height=60&width=80",
      type: "Meadow",
    },
    {
      id: 5,
      name: "Highland Ranch",
      address: "1600 Man-O-War Drive, Harrodsburg, KY",
      location: "Montana",
      acres: 350,
      lat: 46.8797,
      lng: -110.3626,
      image: "/placeholder.svg?height=60&width=80",
      type: "Ranch",
    },
  ]

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle search with TomTom API
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.length > 1) {
      // Add a small delay to avoid making too many API calls while typing
      searchTimeoutRef.current = setTimeout(() => {
        // Use TomTom's Fuzzy Search API for autocomplete
        const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "YOUR_TOMTOM_API_KEY"
        const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(value)}.json?key=${apiKey}&limit=5&countrySet=US&idxSet=Geo,PAD,Str,Addr`

        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            if (data.results && data.results.length > 0) {
              // Transform TomTom results to our format
              const results = data.results.map((result: any) => ({
                id: result.id,
                name: result.poi ? result.poi.name : result.address.freeformAddress,
                address: result.address.freeformAddress,
                location: result.address.countrySubdivision || result.address.country,
                position: result.position,
                lat: result.position.lat,
                lng: result.position.lon,
              }))
              setSearchResults(results)
            } else {
              setSearchResults([])
            }
          })
          .catch((error) => {
            console.error("Error fetching search results:", error)

            // Fallback to sample data if API fails
            const results = sampleLocations.filter(
              (location) =>
                location.name.toLowerCase().includes(value.toLowerCase()) ||
                location.location.toLowerCase().includes(value.toLowerCase()) ||
                location.address?.toLowerCase().includes(value.toLowerCase()),
            )
            setSearchResults(results)
          })
      }, 300)
    } else {
      setSearchResults([])
    }
  }

  const handleResultClick = (result: any) => {
    setSearchValue(result.address || result.name)
    setSearchResults([])

    // Check if we have coordinates from TomTom
    if (result.lat && result.lng) {
      // Fly to location
      if (window.mapInstance) {
        // Add a marker at the location
        addMarkerToLocation(result.lat, result.lng, result.name || result.address)

        window.mapInstance.flyTo([result.lat, result.lng], 16, {
          animate: true,
          duration: 1.5,
        })
      }
    } else {
      // Fallback to geocoding if needed
      const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "YOUR_TOMTOM_API_KEY"
      const geocodeUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(result.address)}.json?key=${apiKey}`

      fetch(geocodeUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.results && data.results.length > 0) {
            const position = data.results[0].position
            if (window.mapInstance) {
              // Add a marker at the location
              addMarkerToLocation(position.lat, position.lon, result.name || result.address)

              window.mapInstance.flyTo([position.lat, position.lon], 16, {
                animate: true,
                duration: 1.5,
              })
            }
          }
        })
        .catch((error) => {
          console.error("Error geocoding address:", error)
        })
    }
  }

  // fn to add a marker at a location
  const addMarkerToLocation = (lat: number, lng: number, title: string) => {
    if (!window.mapInstance) return

    // clear any markers from prev searches
    if (window.searchMarker) {
      window.mapInstance.removeLayer(window.searchMarker)
    }

    // make a cool custom marker icon
    const customIcon = window.L.divIcon({
      className: "custom-marker",
      html: `
        <div class="relative">
          <div class="w-6 h-6 bg-primary rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            ${title}
          </div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 6],
    })

    // Create and add the marker
    const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(window.mapInstance)

    // Store the marker reference globally so we can remove it later
    window.searchMarker = marker
  }

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}
      >
        <div className="container mx-auto px-4">
          <div className="bg-black/30 backdrop-blur-md rounded-full shadow-lg px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="font-bold text-xl text-white mr-6"
              >
                Shoveler
              </motion.div>

              <div className="hidden md:block relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    type="search"
                    placeholder="Search for land..."
                    value={searchValue}
                    onChange={handleSearch}
                    className="w-64 pl-10 bg-white/10 border-transparent focus:border-white/30 text-white placeholder:text-white/60 rounded-full"
                  />
                </div>

                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-black/40 backdrop-blur-md rounded-lg overflow-hidden shadow-lg z-50"
                    >
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center border-b border-white/10 last:border-0"
                        >
                          <div className="flex-shrink-0 mr-3">
                            <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center">
                              <Search className="h-4 w-4 text-white/70" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-white">{result.name}</div>
                            <div className="text-sm text-white/70">
                              {result.address !== result.name ? result.address : result.location}
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <nav className="hidden md:flex items-center space-x-1">
                <Button variant="ghost" className="text-white rounded-full">
                  <Map className="h-4 w-4 mr-2" />
                  My Lands
                </Button>
                <Button variant="ghost" className="text-white rounded-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </Button>
                <Button variant="primary" size="sm" className="rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </nav>

              <div className="relative ml-2">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black/30"
                >
                  <Avatar>
                    <AvatarImage src="https://github.com/gigachad-dev.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-black/40 backdrop-blur-md rounded-lg overflow-hidden shadow-lg z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="text-white font-medium">John Doe</div>
                        <div className="text-white/70 text-sm">john@example.com</div>
                      </div>
                      <button className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-white flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-white flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden ml-2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-black/40 backdrop-blur-md p-4 shadow-lg"
          >
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  type="search"
                  placeholder="Search for land..."
                  value={searchValue}
                  onChange={handleSearch}
                  className="w-full pl-10 bg-white/10 border-transparent focus:border-white/30 text-white placeholder:text-white/60 rounded-lg"
                />
              </div>

              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-4 right-4 mt-2 bg-black/40 backdrop-blur-md rounded-lg overflow-hidden shadow-lg z-50"
                  >
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center border-b border-white/10 last:border-0"
                      >
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center">
                            <Search className="h-4 w-4 text-white/70" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-white">{result.name}</div>
                          <div className="text-sm text-white/70">
                            {result.address !== result.name ? result.address : result.location}
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <nav className="flex flex-col space-y-2">
              <Button variant="ghost" className="text-white justify-start rounded-lg">
                <Map className="h-4 w-4 mr-2" />
                My Lands
              </Button>
              <Button variant="ghost" className="text-white justify-start rounded-lg">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button variant="primary" className="justify-start rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

