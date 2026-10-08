// @/lib/api/analytics.ts

import { apiJson } from "@/lib/api/client";
import type { Overview } from "@/types";

export async function getOverview(
  period: number,
  selectedDate: string
): Promise<Overview> {
  const params = new URLSearchParams({
    period: String(period),
    date: selectedDate,
  });

  return apiJson<Overview>(
    `/analytics/overview?${params.toString()}`
  );
}