import { Step } from "react-joyride";

export const getOnboardingSteps = (
  sidebarState: "expanded" | "collapsed"
): Step[] => [
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Bienvenue sur GeoMapy ! 👋</h3>
        <p>
          Découvrez comment créer et gérer vos points et formes géographiques en
          quelques étapes.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: "#onboarding-sidebar",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold">Zone de gestion</h3>
        <p>
          C'est ici que vous pourrez ajouter des points, voir vos listes et
          accéder aux outils d'import/export.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: "#onboarding-map",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold">La Carte</h3>
        <p>
          Le cœur de l'application. Naviguez, zoomez et visualisez vos données
          géographiques.
        </p>
      </div>
    ),
    placement: "center",
    spotlightClicks: true, // Permettre l'interaction avec la carte
    disableOverlayClose: true,
    disableOverlay: true,
  },
  {
    target: "#onboarding-toolbar",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold">Barre d'outils</h3>
        <p>
          Utilisez ces outils pour dessiner des formes (lignes, polygones,
          cercles) directement sur la carte.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: "#onboarding-search-address",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold">Barre de recherche</h3>
        <p>
          Recherchez une adresse pour vous déplacer rapidement sur la carte.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target:
      sidebarState === "collapsed"
        ? "#onboarding-sidebar-trigger"
        : "#onboarding-add-point",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold">Créer un point</h3>
        <p>
          Pour la démonstration, copiez ce lien Google Maps ci-dessous et
          collez-le dans le champ "URL" du formulaire :
        </p>
        <div className="p-2 bg-muted rounded border text-xs font-mono break-all select-all">
          https://www.google.fr/maps/@48.8583701,2.2944813,17z
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {sidebarState === "collapsed"
            ? "Ouvrez la sidebar pour accéder au formulaire."
            : "Remplissez le formulaire et validez."}
        </p>
      </div>
    ),
    placement: "right",
    spotlightClicks: true,
    disableOverlayClose: true,
    data: { expectedAction: "POINT_ADDED" },
  },
  {
    target: "#onboarding-points-list",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold">Liste des points</h3>
        <p>
          Votre point apparaît ici. Vous pouvez cliquer dessus pour le voir sur
          la carte ou le modifier.
        </p>
      </div>
    ),
    placement: "right",
    spotlightClicks: true,
    disableOverlayClose: true,
  },
  {
    // Cible la toolbar personnalisée (DrawControl)
    target: "#onboarding-toolbar",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold">Créer une forme</h3>
        <p>
          Sélectionnez un outil de dessin (ex: Polygone) et dessinez sur la
          carte. Double-cliquez pour terminer la forme.
        </p>
      </div>
    ),
    placement: "right",
    spotlightClicks: true,
    disableOverlayClose: true,
    disableOverlay: true,
    // On attend que l'utilisateur ait fini de dessiner et validé le dialogue
    data: { expectedAction: "FEATURE_ADDED" },
  },
  {
    target: "#onboarding-features-list",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold">Liste des formes</h3>
        <p>
          Vos formes dessinées apparaissent ici. Vous pouvez les gérer comme les
          points.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: "#onboarding-search-address",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold">Astuce recherche</h3>
        <p>
          La barre de recherche est optimisée pour trouver facilement des
          adresses en <strong>France</strong> uniquement.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Félicitations ! 🎉</h3>
        <p>Vous maîtrisez maintenant les bases de GeoMapy.</p>
        <p className="text-sm text-muted-foreground">
          Vous pouvez relancer ce tutoriel à tout moment depuis le menu ou les
          paramètres.
        </p>
      </div>
    ),
    placement: "center",
  },
];
