"use server";

import { getEmployersForCompaniesPage } from "@/lib/jobs";
import { MOCK_COMPANIES } from "./mock-companies";

export type CompanySearchMatch = { id: string; name: string };

/** Return company matches for search dropdown (id + display name). Includes mock companies so dropdown has content when DB has few. */
export async function searchCompaniesAction(
  query: string,
): Promise<CompanySearchMatch[]> {
  if (!query?.trim()) return [];
  const term = query.trim().toLowerCase();
  const companies = await getEmployersForCompaniesPage(term);
  const fromDb = companies.map((c) => ({
    id: c.id,
    name: (c.company_name ?? c.full_name ?? "Company").trim() || "Company",
  }));
  const mockMatches = MOCK_COMPANIES.filter((c) => {
    const name = (c.company_name ?? c.full_name ?? "").toLowerCase();
    return name.includes(term);
  }).map((c) => ({
    id: c.id,
    name: (c.company_name ?? c.full_name ?? "Company").trim() || "Company",
  }));
  const seen = new Set(fromDb.map((m) => m.id));
  const combined = [...fromDb];
  for (const m of mockMatches) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      combined.push(m);
    }
  }
  return combined;
}
