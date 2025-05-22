import { Suspense } from "react";
import ExploreContent from "../../../components/explore-content";

export default function ExplorePage() {
  return (
    <div className="h-[calc(100vh-6rem)]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <ExploreContent />
      </Suspense>
    </div>
  );
}
