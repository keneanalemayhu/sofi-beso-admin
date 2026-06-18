// @/lib/config.ts

export const appConfig = {
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
}