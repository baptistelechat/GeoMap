import { MarkerIcon } from "@/components/map/MarkerIcon";
import { Button } from "@/components/ui/button";
import { primaryColor } from "@/constants/tailwindThemeColor";
import { getFeatureBounds, SHAPE_NAMES } from "@/lib/map";
import { generateId } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPoint } from "@/types/map";
import type { Feature } from "geojson";
import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FeatureIconDisplay } from "../shared/FeatureIconDisplay";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

// Interface pour les résultats de l'API Geoplateforme Autocompletion
interface CompletionResult {
  x: number;
  y: number;
  fulltext: string;
  city: string;
  zipcode: string;
  street?: string;
  kind?: string;
}

type LocalSearchResult =
  | { type: "point"; data: MapPoint }
  | { type: "feature"; data: Feature };

export function SearchAddress() {
  const [query, setQuery] = useState("");
  const [apiResults, setApiResults] = useState<CompletionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const {
    addPoint,
    setFlyToLocation,
    setFlyToBounds,
    setHighlightedId,
    points,
    features,
  } = useGeomarkStore();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Recherche locale (Points et Formes)
  const localResults = useMemo(() => {
    if (query.length < 2) return [];
    const lowerQuery = query.toLowerCase();

    const matchedPoints = points
      .filter((p) => p.title.toLowerCase().includes(lowerQuery))
      .map((p) => ({ type: "point" as const, data: p }));

    const matchedFeatures = features
      .filter((f) => f.properties?.name?.toLowerCase().includes(lowerQuery))
      .map((f) => ({ type: "feature" as const, data: f }));

    return [...matchedPoints, ...matchedFeatures].slice(0, 10);
  }, [query, points, features]);

  // Debounce effect pour la recherche API
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          // Utilisation de l'API Autocompletion de la Géoplateforme IGN
          // https://geoservices.ign.fr/documentation/services/services-geoplateforme/autocompletion
          const res = await fetch(
            `https://data.geopf.fr/geocodage/completion/?text=${encodeURIComponent(
              query
            )}&maximumResponses=10`
          );
          if (!res.ok) throw new Error("Erreur réseau");
          const data = await res.json();
          setApiResults(data.results || []);
          setIsOpen(true);
        } catch (error) {
          console.error("Erreur lors de la recherche d'adresse:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setApiResults([]);
        if (localResults.length === 0) setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, localResults.length]);

  // Ouvrir si des résultats locaux existent lors de la frappe
  useEffect(() => {
    if (localResults.length > 0 && query.length > 1) {
      setIsOpen(true);
    }
  }, [localResults, query]);

  // Fermer les résultats si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApiSelect = (result: CompletionResult) => {
    const { x: lng, y: lat, fulltext } = result;

    // Construction du contexte (Code postal + Ville)
    const context = `${result.zipcode} ${result.city}`;

    // Création du point
    const newPoint: MapPoint = {
      id: generateId(),
      lat,
      lng,
      title: fulltext,
      notes: context,
      color: primaryColor,
      icon: "map-pin",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Ajout au store
    addPoint(newPoint);

    // Zoom sur le point
    setFlyToLocation({ lat, lng, zoom: 18 });

    // Mettre en évidence
    setHighlightedId(newPoint.id);

    toast.success("Point créé avec succès", {
      description: fulltext,
    });

    closeAndClear();
  };

  const handleLocalSelect = (result: LocalSearchResult) => {
    if (result.type === "point") {
      setFlyToLocation({
        lat: result.data.lat,
        lng: result.data.lng,
        zoom: 18,
      });
      setHighlightedId(result.data.id);
    } else {
      const boundsData = getFeatureBounds(result.data);
      if (boundsData) {
        setFlyToBounds(boundsData);
        setHighlightedId(result.data.properties?.id);
      }
    }
    closeAndClear();
  };

  const closeAndClear = () => {
    setQuery("");
    setApiResults([]);
    setIsOpen(false);
  };

  const hasResults = localResults.length > 0 || apiResults.length > 0;

  return (
    <div
      id="onboarding-search-address"
      ref={wrapperRef}
      className="relative w-full max-w-sm pointer-events-auto"
    >
      <Command
        shouldFilter={false}
        className="overflow-visible bg-transparent [&_[data-slot=command-input-wrapper]]:bg-background/95 [&_[data-slot=command-input-wrapper]]:backdrop-blur [&_[data-slot=command-input-wrapper]]:shadow-md [&_[data-slot=command-input-wrapper]]:border [&_[data-slot=command-input-wrapper]]:border-muted [&_[data-slot=command-input-wrapper]]:rounded-md [&_[data-slot=command-input-wrapper]]:px-3"
      >
        <div className="relative">
          <CommandInput
            placeholder="Rechercher une adresse, un point..."
            value={query}
            onValueChange={setQuery}
            className="h-10"
          />
          {loading && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={closeAndClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isOpen && hasResults && (
          <div className="absolute top-full mt-1 w-full bg-background/95 backdrop-blur rounded-md border shadow-lg overflow-hidden z-50">
            <CommandList>
              {localResults.length > 0 && (
                <CommandGroup heading="Suggestions">
                  {localResults.map((result) => {
                    // Logic pour les formes
                    const isFeature = result.type === "feature";
                    const feature = isFeature ? result.data : null;

                    return (
                      <CommandItem
                        key={
                          result.type === "point"
                            ? result.data.id
                            : result.data.properties?.id
                        }
                        value={
                          result.type === "point"
                            ? result.data.title
                            : result.data.properties?.name
                        }
                        onSelect={() => handleLocalSelect(result)}
                        className="cursor-pointer"
                      >
                        {result.type === "point" ? (
                          <MarkerIcon
                            iconName={result.data.icon}
                            color={result.data.color}
                            className="w-8 h-8 shrink-0 mr-3"
                          />
                        ) : (
                          <FeatureIconDisplay
                            shape={feature?.properties?.shape}
                            color={feature?.properties?.color}
                            className="size-8 mr-3"
                            iconClassName="size-4"
                          />
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium truncate block">
                            {result.type === "point"
                              ? result.data.title
                              : result.data.properties?.name ||
                                "Forme sans nom"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate block">
                            {result.type === "point"
                              ? `${result.data.lat.toFixed(
                                  4
                                )}, ${result.data.lng.toFixed(4)}`
                              : SHAPE_NAMES[
                                  result.data.properties?.shape as string
                                ] || result.data.geometry.type}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {apiResults.length > 0 && (
                <CommandGroup heading="Adresses">
                  {apiResults.map((result) => (
                    <CommandItem
                      key={result.fulltext}
                      value={result.fulltext}
                      onSelect={() => handleApiSelect(result)}
                      className="cursor-pointer"
                    >
                      <MarkerIcon
                        iconName="pin"
                        color={primaryColor}
                        className="w-8 h-8 shrink-0 mr-3"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium truncate block">
                          {result.fulltext}
                        </span>
                        <span className="text-xs text-muted-foreground truncate block">
                          {result.zipcode} {result.city}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </div>
        )}

        {/* Message si aucun résultat */}
        {isOpen && !loading && query.length > 2 && !hasResults && (
          <div className="absolute top-full mt-1 w-full bg-background/95 backdrop-blur rounded-md border shadow-lg p-3 text-sm text-muted-foreground text-center z-50">
            Aucun résultat trouvé
          </div>
        )}
      </Command>
    </div>
  );
}
