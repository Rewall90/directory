"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_norwayLow from "@amcharts/amcharts5-geodata/norwayLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface Region {
  name: string; // Display name (e.g., "Oslo", "Innlandet")
  slug: string; // URL slug (e.g., "oslo", "innlandet")
  courseCount: number;
  polygonIds: string[]; // norwayLow polygon IDs (e.g., ["NO-03"] or ["NO-04", "NO-05"])
}

interface InteractiveMapProps {
  regions: Region[];
  onRegionClick?: (slug: string) => void;
  className?: string;
}

export function InteractiveMap({ regions, onRegionClick, className }: InteractiveMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<am5map.MapChart | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartRef.current) return;

    // Create root element
    const root = am5.Root.new(chartRef.current);

    // Hide default amCharts branding; attribution lives in the footer
    root._logo?.set("forceHidden", true);

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create map chart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
        homeZoomLevel: 1,
        homeGeoPoint: { longitude: 10, latitude: 65 }, // Center of Norway
      }),
    );

    // Store chart instance for home button
    chartInstanceRef.current = chart;

    // Add zoom control
    chart.set("zoomControl", am5map.ZoomControl.new(root, {}));

    // Create polygon series for Norway counties
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_norwayLow,
        valueField: "courseCount",
        calculateAggregates: true,
      }),
    );

    // Map polygon IDs to region data
    // For merged regions (Innlandet, Agder, Vestland), multiple polygons map to one region
    const polygonToRegionMap = new Map<string, Region>();
    regions.forEach((region) => {
      region.polygonIds.forEach((polygonId) => {
        polygonToRegionMap.set(polygonId, region);
      });
    });

    // Style polygons
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}: {courseCount} baner", // Norwegian: "courses" = "baner"
      interactive: true,
      fill: am5.color(0x047857), // Primary green #047857
      stroke: am5.color(0xbac8c0), // Border default color
      strokeWidth: 1,
    });

    // Hover state - golden color matching nearby courses cards
    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0xfacc15), // Golden yellow-400 color
    });

    // Set cursor style on hover
    polygonSeries.mapPolygons.template.events.on("pointerover", (ev) => {
      if (ev.target.dataItem) {
        const dataContext = ev.target.dataItem.dataContext as { id?: string };
        const polygonId = dataContext?.id;
        const region = polygonId ? polygonToRegionMap.get(polygonId) : undefined;
        if (region) {
          ev.target.set("cursorOverStyle", "pointer");
        }
      }
    });

    // Click handler
    polygonSeries.mapPolygons.template.events.on("click", (ev) => {
      const dataItem = ev.target.dataItem;
      if (dataItem) {
        const dataContext = dataItem.dataContext as { id?: string };
        const polygonId = dataContext?.id;
        const region = polygonId ? polygonToRegionMap.get(polygonId) : undefined;

        if (region && onRegionClick) {
          onRegionClick(region.slug);
        } else if (region) {
          // Default navigation to region page
          router.push(`/${region.slug}`);
        }
      }
    });

    // Set data on polygons (for course counts)
    // For merged regions, create a data entry for EACH polygon ID
    const polygonData = regions.flatMap((region) =>
      region.polygonIds.map((polygonId) => ({
        id: polygonId, // norwayLow polygon ID (e.g., "NO-04")
        name: region.name, // Display name (e.g., "Innlandet")
        courseCount: region.courseCount,
        slug: region.slug,
      })),
    );

    polygonSeries.data.setAll(polygonData);

    // Map is loaded
    setIsLoading(false);

    // Cleanup function
    return () => {
      root.dispose();
      chartInstanceRef.current = null;
    };
  }, [regions, onRegionClick, router]);

  return (
    <div className="relative w-full max-w-2xl">
      {isLoading && (
        <div className="bg-background-elevated absolute inset-0 flex items-center justify-center">
          <div className="text-text-tertiary">Laster kart...</div>
        </div>
      )}
      <div
        ref={chartRef}
        className={className || "h-[300px] w-full md:h-[400px] lg:h-[500px]"}
        style={{
          width: "100%",
          minWidth: "300px",
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        a[title*="Chart"],
        [aria-label*="Chart"],
        .am5-logo,
        .am5-branding {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `,
        }}
      />
    </div>
  );
}
