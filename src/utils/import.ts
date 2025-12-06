import { generateId } from "@/lib/utils";
import { MapPoint } from "@/types/map";
import type { Feature } from "geojson";
import Papa from "papaparse";

export interface ImportResult {
  points: MapPoint[];
  features: Feature[];
}

interface CSVRow {
  type: string;
  id?: string;
  title?: string;
  lat?: string;
  lng?: string;
  notes?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  geometry?: string;
  properties?: string;
}

export const parseJSON = (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (!json.points && !json.features) {
          reject(
            new Error("Format JSON invalide : 'points' ou 'features' manquants")
          );
          return;
        }

        const features = (
          Array.isArray(json.features) ? json.features : []
        ).map((f: Feature) => {
          if (!f.properties) f.properties = {};
          if (!f.properties.id) f.properties.id = generateId();
          return f;
        });

        resolve({
          points: Array.isArray(json.points) ? json.points : [],
          features,
        });
      } catch {
        reject(new Error("Erreur lors du parsing JSON"));
      }
    };
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
    reader.readAsText(file);
  });
};

export const parseCSV = (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const points: MapPoint[] = [];
        const features: Feature[] = [];

        try {
          const data = results.data as CSVRow[];
          data.forEach((row) => {
            if (row.type === "Point") {
              // Ensure required fields are present and valid
              if (row.lat && row.lng) {
                points.push({
                  id: row.id || generateId(),
                  title: row.title || "Point importé",
                  lat: parseFloat(row.lat),
                  lng: parseFloat(row.lng),
                  notes: row.notes || "",
                  url: row.url || "",
                  createdAt: row.createdAt
                    ? parseInt(row.createdAt, 10)
                    : Date.now(),
                  updatedAt: row.updatedAt
                    ? parseInt(row.updatedAt, 10)
                    : Date.now(),
                });
              }
            } else if (row.type === "Feature") {
              try {
                const geometry = row.geometry ? JSON.parse(row.geometry) : null;
                const properties = row.properties
                  ? JSON.parse(row.properties)
                  : {};

                if (geometry) {
                  if (!properties.id) {
                    properties.id = generateId();
                  }
                  features.push({
                    type: "Feature",
                    geometry,
                    properties,
                  });
                }
              } catch (e) {
                console.warn("Failed to parse feature row", row, e);
              }
            }
          });
          resolve({ points, features });
        } catch {
          reject(new Error("Erreur lors du parsing CSV"));
        }
      },
      error: (error) => reject(error),
    });
  });
};
