import { Suspense } from "react";
import ExploreContent from "./explore-content";

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
