/**
 * Curated list of popular Indian cities across different states and union territories.
 * Used for instant suggestions, quick-selection chips, and zero-latency initial load.
 */
const INDIAN_CITIES = [
  {
    name: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lon: 73.8567,
    region: "West"
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    lat: 19.0760,
    lon: 72.8777,
    region: "West"
  },
  {
    name: "New Delhi",
    state: "Delhi",
    lat: 28.6139,
    lon: 77.2090,
    region: "North"
  },
  {
    name: "Bengaluru",
    state: "Karnataka",
    lat: 12.9716,
    lon: 77.5946,
    region: "South"
  },
  {
    name: "Hyderabad",
    state: "Telangana",
    lat: 17.3850,
    lon: 78.4867,
    region: "South"
  },
  {
    name: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0827,
    lon: 80.2707,
    region: "South"
  },
  {
    name: "Kolkata",
    state: "West Bengal",
    lat: 22.5726,
    lon: 88.3639,
    region: "East"
  },
  {
    name: "Ahmedabad",
    state: "Gujarat",
    lat: 23.0225,
    lon: 72.5714,
    region: "West"
  },
  {
    name: "Jaipur",
    state: "Rajasthan",
    lat: 26.9124,
    lon: 75.7873,
    region: "North"
  },
  {
    name: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8467,
    lon: 80.9462,
    region: "North"
  },
  {
    name: "Chandigarh",
    state: "Punjab / Haryana",
    lat: 30.7333,
    lon: 76.7794,
    region: "North"
  },
  {
    name: "Nagpur",
    state: "Maharashtra",
    lat: 21.1458,
    lon: 79.0882,
    region: "West"
  },
  {
    name: "Indore",
    state: "Madhya Pradesh",
    lat: 22.7196,
    lon: 75.8577,
    region: "Central"
  },
  {
    name: "Bhopal",
    state: "Madhya Pradesh",
    lat: 23.2599,
    lon: 77.4126,
    region: "Central"
  },
  {
    name: "Kochi",
    state: "Kerala",
    lat: 9.9312,
    lon: 76.2673,
    region: "South"
  },
  {
    name: "Goa (Panaji)",
    state: "Goa",
    lat: 15.4909,
    lon: 73.8278,
    region: "West"
  },
  {
    name: "Shimla",
    state: "Himachal Pradesh",
    lat: 31.1048,
    lon: 77.1734,
    region: "North"
  },
  {
    name: "Srinagar",
    state: "Jammu and Kashmir",
    lat: 34.0837,
    lon: 74.7973,
    region: "North"
  },
  {
    name: "Guwahati",
    state: "Assam",
    lat: 26.1445,
    lon: 91.7362,
    region: "Northeast"
  },
  {
    name: "Patna",
    state: "Bihar",
    lat: 25.5941,
    lon: 85.1376,
    region: "East"
  },
  {
    name: "Varanasi",
    state: "Uttar Pradesh",
    lat: 25.3176,
    lon: 82.9739,
    region: "North"
  },
  {
    name: "Amritsar",
    state: "Punjab",
    lat: 31.6340,
    lon: 74.8723,
    region: "North"
  },
  {
    name: "Visakhapatnam",
    state: "Andhra Pradesh",
    lat: 17.6868,
    lon: 83.2185,
    region: "South"
  },
  {
    name: "Dehradun",
    state: "Uttarakhand",
    lat: 30.3165,
    lon: 78.0322,
    region: "North"
  }
];

// Quick chips to show on top of the dashboard
const POPULAR_CHIPS = ["Pune", "Mumbai", "New Delhi", "Bengaluru", "Hyderabad", "Kolkata", "Jaipur", "Shimla"];
