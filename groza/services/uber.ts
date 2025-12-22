// Uber API integration for delivery cost calculation
// This is a placeholder service - replace with actual Uber API integration

interface DeliveryCostRequest {
  vendorLocation: { latitude: number; longitude: number };
  customerLocation: { latitude: number; longitude: number };
}

interface DeliveryCostResponse {
  cost: number;
  estimatedTime: number; // in minutes
  distance: number; // in kilometers
}

// Placeholder function - replace with actual Uber API call
export const calculateDeliveryCost = async (
  vendorLocation: { latitude: number; longitude: number },
  customerLocation: { latitude: number; longitude: number }
): Promise<DeliveryCostResponse> => {
  // Calculate distance using Haversine formula (placeholder)
  const R = 6371; // Earth's radius in km
  const dLat = (customerLocation.latitude - vendorLocation.latitude) * Math.PI / 180;
  const dLon = (customerLocation.longitude - vendorLocation.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(vendorLocation.latitude * Math.PI / 180) * Math.cos(customerLocation.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  // Placeholder: Calculate cost based on distance (replace with Uber API)
  // Uber typically charges around R5-15 per km for bike delivery
  const baseCost = 10; // Base fee
  const perKmCost = 8; // Cost per km
  const cost = baseCost + (distance * perKmCost);

  // Estimated time: ~5 minutes base + ~2 minutes per km
  const estimatedTime = Math.round(5 + (distance * 2));

  return {
    cost: Math.round(cost * 100) / 100, // Round to 2 decimal places
    estimatedTime,
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
  };
};

// Generate mock bike courier locations (for map display)
// Replace with actual Uber API call to get real-time courier locations
export const getBikeCourierLocations = (
  centerLocation: { latitude: number; longitude: number },
  count: number = 5
): Array<{ latitude: number; longitude: number; id: string }> => {
  const couriers = [];
  for (let i = 0; i < count; i++) {
    // Generate random locations within ~2km radius
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const radius = 0.01 + Math.random() * 0.02; // ~1-3km
    couriers.push({
      id: `courier-${i}`,
      latitude: centerLocation.latitude + (radius * Math.cos(angle)),
      longitude: centerLocation.longitude + (radius * Math.sin(angle)),
    });
  }
  return couriers;
};

