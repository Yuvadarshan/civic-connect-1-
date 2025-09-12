// Geolocation utilities

import type { GeoLocation } from "../types"

export function calculateDistance(point1: GeoLocation, point2: GeoLocation): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat)
  const dLon = toRadians(point2.lng - point1.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function isWithinRadius(center: GeoLocation, point: GeoLocation, radiusKm: number): boolean {
  return calculateDistance(center, point) <= radiusKm
}

export function formatCoordinates(geo: GeoLocation): string {
  return `${geo.lat.toFixed(6)}, ${geo.lng.toFixed(6)}`
}

// Check if coordinates are within a geofence (simple radius check)
export function isInGeofence(currentLocation: GeoLocation, targetLocation: GeoLocation, radiusMeters = 100): boolean {
  const distanceKm = calculateDistance(currentLocation, targetLocation)
  return distanceKm <= radiusMeters / 1000
}
