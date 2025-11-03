"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SearchResult } from "./SearchResult";

interface Course {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string;
  municipality: string;
  holes: number;
  par: number | null;
}

interface CourseSearchProps {
  placeholder?: string;
  className?: string;
}

export function CourseSearch({
  placeholder = "Søk etter golfbane, sted...",
  className = "",
}: CourseSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/courses?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.courses);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300); // 300ms debounce
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          const course = results[activeIndex];
          window.location.href = `/${course.region.toLowerCase().replace(/\s+/g, "-")}/${course.slug}`;
        }
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-background-surface px-4 py-3 pl-11 pr-4 text-text-primary placeholder-text-tertiary shadow-sm transition-all focus:outline-none"
          style={{
            border: 'solid 2px hsl(72, 80%, 20%)',
            borderRadius: '4px'
          }}
          aria-label="Søk etter golfbaner"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={isOpen}
        />
        {/* Search Icon */}
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {/* Loading Spinner */}
        {isLoading && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border-subtle border-t-primary"></div>
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div
          id="search-results"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-border-default bg-background-surface shadow-lg"
          role="listbox"
        >
          {results.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {results.map((course, index) => (
                <div key={course.id} role="option" aria-selected={index === activeIndex}>
                  <SearchResult
                    name={course.name}
                    city={course.city}
                    region={course.region}
                    holes={course.holes}
                    par={course.par}
                    slug={course.slug}
                    isActive={index === activeIndex}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-text-tertiary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto mb-2 h-8 w-8 text-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">Ingen resultater funnet</p>
              <p className="mt-1 text-xs text-text-tertiary">
                Prøv et annet søkeord
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
