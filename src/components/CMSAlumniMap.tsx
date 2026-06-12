"use client";

import React, { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "/indonesia-geo.json";

interface Props {
  data: Array<{ province: string; count: number }>;
}

export default function CMSAlumniMap({ data }: Props) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    value: number | string;
  } | null>(null);

  const dataMap = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((d) => {
      map[d.province] = d.count;
    });
    return map;
  }, [data]);

  const maxAlumni = useMemo(
    () => Math.max(...data.map((d) => d.count), 1),
    [data],
  );

  function getColor(value: number | undefined) {
    if (value === undefined) return "#e2e8f0";
    const ratio = value / maxAlumni;
    if (ratio > 0.75) return "#4f46e5";
    if (ratio > 0.5) return "#818cf8";
    if (ratio > 0.25) return "#c7d2fe";
    return "#e0e7ff";
  }

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [118, -2], scale: 1100 }}
        width={800}
        height={400}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name: string = geo.properties.Propinsi || "";
              const value = dataMap[name];

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    setTooltip({
                      name,
                      value: value !== undefined ? value : 0,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    default: {
                      fill: getColor(value),
                      stroke: "#FFFFFF",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "#4f46e5",
                      stroke: "#FFFFFF",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#3730a3",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div className="absolute top-2 left-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm shadow-md pointer-events-none z-10">
          <p className="font-semibold text-slate-800">{tooltip.name}</p>
          <p className="text-slate-500">
            Alumni:{" "}
            <span className="font-medium text-primary-600">{tooltip.value}</span>
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-2 justify-center text-xs text-slate-400">
        <span>Sedikit</span>
        <div className="flex gap-0.5">
          <div className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: "#e0e7ff" }} />
          <div className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: "#c7d2fe" }} />
          <div className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: "#818cf8" }} />
          <div className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: "#4f46e5" }} />
        </div>
        <span>Banyak</span>
      </div>
    </div>
  );
}
