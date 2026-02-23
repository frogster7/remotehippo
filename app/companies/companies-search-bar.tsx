"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchCompaniesAction, type CompanySearchMatch } from "./actions";

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 1;

export function CompaniesSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(q);
  const [matches, setMatches] = useState<CompanySearchMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setDropdownOpen(false);
      const value = inputValue.trim();
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.push(`/companies${params.toString() ? `?${params}` : ""}`);
    },
    [inputValue, router, searchParams],
  );

  // Debounced search for dropdown
  useEffect(() => {
    const term = inputValue.trim();
    if (term.length < MIN_QUERY_LENGTH) {
      setMatches([]);
      setDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchCompaniesAction(term);
        setMatches(results);
        setDropdownOpen(results.length > 0);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = dropdownOpen && (matches.length > 0 || loading);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="overflow-hidden rounded-2xl border border-primary/50 bg-card shadow-sm">
        <form
          className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-0 sm:p-4"
          onSubmit={handleSubmit}
        >
          <div className="relative flex min-h-11 min-w-0 flex-1">
            <Search
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="text"
              placeholder="Company name or keyword"
              autoComplete="off"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => {
                if (matches.length > 0 && inputValue.trim().length >= MIN_QUERY_LENGTH) {
                  setDropdownOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.form?.requestSubmit();
              }}
              className="h-11 w-full border-0 bg-transparent pl-10 pr-9 shadow-none focus-visible:ring-0"
              aria-label="Search companies"
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              role="combobox"
              aria-controls="companies-search-listbox"
              id="companies-search-input"
            />
            {inputValue.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  setMatches([]);
                  setDropdownOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-2 h-11 gap-2 rounded-xl px-6 font-semibold shadow-sm sm:mt-0 sm:ml-4"
          >
            <Search className="h-5 w-5" aria-hidden />
            Search
          </Button>
        </form>
      </div>

      {/* Dropdown: found matches */}
      {showDropdown && (
        <div
          id="companies-search-listbox"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-72 overflow-auto rounded-xl border border-border/80 bg-card py-1 shadow-lg"
        >
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Searching…
            </div>
          ) : (
            <ul className="py-1">
              {matches.map((company) => (
                <li key={company.id} role="option">
                  <Link
                    href={`/employer/${company.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/80"
                  >
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium text-foreground">{company.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
