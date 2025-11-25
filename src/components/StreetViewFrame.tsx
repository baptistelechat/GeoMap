import { useState } from 'react';

interface StreetViewFrameProps {
  url: string;
  title: string;
}

export function StreetViewFrame({ url, title }: StreetViewFrameProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-sm text-gray-500">Chargement...</div>
        </div>
      )}
      <iframe
        src={url}
        title={`Street View - ${title}`}
        className="w-full h-full border-0"
        onLoad={() => setIsLoading(false)}
        allowFullScreen
      />
    </div>
  );
}