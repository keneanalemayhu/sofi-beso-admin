// @/lib/api/client.ts

import { appConfig } from "@/lib/config"

const API_BASE = appConfig.apiBaseUrl

export function getApiUrl(path: string) {
  return `${API_BASE}${path}`
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(getApiUrl(path), {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  })

  if (!res.ok) {
    let message = "Request failed"
    try {
      const errorJson = await res.json()
      message = errorJson.error || message
    } catch {}
    throw new Error(message)
  }

  // Some endpoints (DELETE) may return an empty body
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}