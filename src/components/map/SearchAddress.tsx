import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { primaryColor } from "@/constants/tailwindThemeColor";
import { generateId } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPoint } from "@/types/map";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Interface pour les résultats de l'API BAN
interface BanFeature {
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    label: string;
    context: string;
    city: string;
    postcode: string;
    type: string;
  };
}

export function SearchAddress() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BanFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { addPoint, setFlyToLocation, setHighlightedId } = useGeomarkStore();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce effect pour la recherche
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const res = await fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
              query
            )}&limit=5`
          );
          if (!res.ok) throw new Error("Erreur réseau");
          const data = await res.json();
          setResults(data.features || []);
          setIsOpen(true);
        } catch (error) {
          console.error("Erreur lors de la recherche d'adresse:", error);
          // On ne montre pas d'erreur à l'utilisateur pour une recherche instantanée
          // sauf si c'est critique, mais ici on échoue silencieusement
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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

  const handleSelect = (feature: BanFeature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const label = feature.properties.label;

    // Création du point
    const newPoint: MapPoint = {
      id: generateId(),
      lat,
      lng,
      title: label,
      notes: feature.properties.context, // ex: "80, Somme, Hauts-de-France"
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
      description: label,
    });

    // Reset
    setQuery("");
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full max-w-sm pointer-events-auto"
    >
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher une adresse..."
          className="pl-9 pr-8 bg-background/95 backdrop-blur shadow-md border-muted"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {loading && (
          <div className="absolute right-2.5 top-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Liste des résultats */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-background/95 backdrop-blur rounded-md border shadow-lg overflow-hidden z-50">
          <ul className="py-1">
            {results.map((feature, index) => (
              <li key={index}>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-start gap-2 transition-colors"
                  onClick={() => handleSelect(feature)}
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <div className="font-medium truncate">
                      {feature.properties.label}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {feature.properties.context}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Message si aucun résultat */}
      {isOpen && !loading && query.length > 2 && results.length === 0 && (
        <div className="absolute top-full mt-1 w-full bg-background/95 backdrop-blur rounded-md border shadow-lg p-3 text-sm text-muted-foreground text-center z-50">
          Aucune adresse trouvée
        </div>
      )}
    </div>
  );
}
