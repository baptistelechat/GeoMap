import { Button } from "@/components/ui/button";
import { primaryColor } from "@/constants/tailwindThemeColor";
import { generateId } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPoint } from "@/types/map";
import { Loader2, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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

export function SearchAddress() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompletionResult[]>([]);
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
          // Utilisation de l'API Autocompletion de la Géoplateforme IGN
          // https://geoservices.ign.fr/documentation/services/services-geoplateforme/autocompletion
          const res = await fetch(
            `https://data.geopf.fr/geocodage/completion/?text=${encodeURIComponent(
              query
            )}&maximumResponses=5`
          );
          if (!res.ok) throw new Error("Erreur réseau");
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        } catch (error) {
          console.error("Erreur lors de la recherche d'adresse:", error);
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

  const handleSelect = (result: CompletionResult) => {
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
      <Command
        shouldFilter={false}
        className="overflow-visible bg-transparent [&_[data-slot=command-input-wrapper]]:bg-background/95 [&_[data-slot=command-input-wrapper]]:backdrop-blur [&_[data-slot=command-input-wrapper]]:shadow-md [&_[data-slot=command-input-wrapper]]:border [&_[data-slot=command-input-wrapper]]:border-muted [&_[data-slot=command-input-wrapper]]:rounded-md [&_[data-slot=command-input-wrapper]]:px-3"
      >
        <div className="relative">
          <CommandInput
            placeholder="Rechercher une adresse..."
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
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isOpen && results.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-background/95 backdrop-blur rounded-md border shadow-lg overflow-hidden z-50">
            <CommandList>
              <CommandGroup>
                {results.map((result) => (
                  <CommandItem
                    key={result.fulltext}
                    value={result.fulltext}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 mr-2 text-primary shrink-0" />
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
            </CommandList>
          </div>
        )}

        {/* Message si aucun résultat */}
        {isOpen && !loading && query.length > 2 && results.length === 0 && (
          <div className="absolute top-full mt-1 w-full bg-background/95 backdrop-blur rounded-md border shadow-lg p-3 text-sm text-muted-foreground text-center z-50">
            Aucune adresse trouvée
          </div>
        )}
      </Command>
    </div>
  );
}
