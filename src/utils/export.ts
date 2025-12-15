import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPoint } from "@/types/map";
import { saveAs } from "file-saver";
import { Feature } from "geojson";
import JSZip from "jszip";
import Papa from "papaparse";
import { toast } from "sonner";

const getFormattedTimestamp = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, -1);
  return localISOTime.replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
};

const generateCSVContent = (points: MapPoint[], features: Feature[]) => {
  const pointRows = points.map((point) => ({
    type: "Point",
    id: point.id,
    title: point.title,
    lat: point.lat,
    lng: point.lng,
    notes: point.notes || "",
    url: point.url || "",
    createdAt: point.createdAt,
    updatedAt: point.updatedAt || point.createdAt,
    properties: "",
    geometry: "",
  }));

  const featureRows = features.map((feature) => ({
    type: "Feature",
    id: "",
    title: "",
    lat: "",
    lng: "",
    notes: "",
    url: "",
    createdAt: "",
    updatedAt: "",
    properties: JSON.stringify(feature.properties || {}),
    geometry: JSON.stringify(feature.geometry),
  }));

  return Papa.unparse([...pointRows, ...featureRows]);
};

interface ExportData {
  points: MapPoint[];
  features: Feature[];
}

const getData = (data?: ExportData): ExportData => {
  if (data) return data;
  const state = useGeomarkStore.getState();
  return { points: state.points, features: state.features };
};

export function exportToCSV(data?: ExportData): void {
  const { points, features } = getData(data);
  const csv = generateCSVContent(points, features);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const timestamp = getFormattedTimestamp();

  saveAs(blob, `geomark-${timestamp}.csv`);
  toast.success(
    `Export CSV terminé : ${points.length} points et ${features.length} dessins`
  );
}

export function exportToJSON(data?: ExportData): void {
  const finalData = getData(data);
  const json = JSON.stringify(finalData, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const timestamp = getFormattedTimestamp();

  saveAs(blob, `geomark-${timestamp}.json`);
  toast.success(
    `Export JSON terminé : ${finalData.points.length} points et ${finalData.features.length} dessins`
  );
}

export async function exportToZIP(data?: ExportData): Promise<void> {
  const { points, features } = getData(data);
  const timestamp = getFormattedTimestamp();
  const zip = new JSZip();

  // Add CSV
  const csvContent = generateCSVContent(points, features);
  zip.file(`geomark-${timestamp}.csv`, csvContent);

  // Add JSON
  const jsonContent = JSON.stringify({ points, features }, null, 2);
  zip.file(`geomark-${timestamp}.json`, jsonContent);

  // Generate ZIP
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `geomark-${timestamp}.zip`);

  toast.success(
    `Export Archive ZIP terminé : ${points.length} points et ${features.length} dessins`
  );
}
