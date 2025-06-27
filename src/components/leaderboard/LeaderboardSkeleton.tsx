
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const LeaderboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center">
        <div className="h-12 bg-slate-700 rounded w-64 mx-auto mb-4"></div>
        <div className="h-6 bg-slate-800 rounded w-96 mx-auto"></div>
      </div>

      {/* Sort Controls Skeleton */}
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 bg-slate-700 rounded w-32"></div>
        ))}
      </div>

      {/* Top 3 Podium Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center pb-3 pt-8">
              <div className="w-20 h-20 bg-slate-700 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-slate-700 rounded w-32 mx-auto mb-2"></div>
            </CardHeader>
            <CardContent className="text-center space-y-4 pb-6">
              <div className="h-10 bg-slate-700 rounded w-16 mx-auto"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-700/50 rounded-lg p-3 h-16"></div>
                <div className="bg-slate-700/50 rounded-lg p-3 h-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List Skeleton */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="h-8 bg-slate-700 rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 h-20"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardSkeleton;
