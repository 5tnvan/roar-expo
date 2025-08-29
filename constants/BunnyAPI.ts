const REGION = ""; // If German region, set this to an empty string: ''
const BASE_HOSTNAME = "storage.bunnycdn.com";
const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
const STORAGE_ZONE_NAME = "roar-ai-real-world";
const ACCESS_KEY = process.env.EXPO_PUBLIC_BUNNY_ACCESS_KEY;

export { ACCESS_KEY, HOSTNAME, STORAGE_ZONE_NAME };
