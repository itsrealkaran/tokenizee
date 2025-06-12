import { Sidebar } from "@/components/layout/sidebar";
import { RankingList } from "@/components/feed/ranking-card";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { AuthCheck } from "@/components/providers/auth-check";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex h-[calc(100vh-3.5rem)] md:h-screen">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Desktop Header */}
              <div className="">
                <DashboardHeader />
              </div>
              <main className="w-full overflow-y-auto max-w-2xl mx-auto p-4 pb-2 md:pb-4">
                {children}
              </main>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 p-4 hidden xl:block">
              <div className="sticky top-4">
                <h2 className="text-xl font-semibold mb-4 ml-2">Updates</h2>
                <RankingList />
              </div>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
