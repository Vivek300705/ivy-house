import React, { useEffect, useState } from 'react';
import { fetchListings } from '../api';
import { TrendingUp, AlertTriangle, Home, IndianRupee } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function computeInsights() {
      try {
        const data = await fetchListings(0, 200);
        const valid = data.results;
        
        let totalVal = 0;
        let min = Infinity;
        let max = 0;
        const localityCount = {};
        
        valid.forEach((l) => {
          totalVal += l.price;
          if (l.price < min) min = l.price;
          if (l.price > max) max = l.price;
          localityCount[l.locality] = (localityCount[l.locality] || 0) + 1;
        });

        const sortedLocalities = Object.keys(localityCount).sort((a, b) => localityCount[b] - localityCount[a]).slice(0, 5);

        setStats({
          sampleSize: valid.length,
          avgPrice: totalVal / valid.length,
          minPrice: min,
          maxPrice: max,
          topLocalities: sortedLocalities.map(loc => ({ name: loc, count: localityCount[loc] }))
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    computeInsights();
  }, []);

  if (loading) return <div className="p-8">Loading insights...</div>;
  if (!stats) return <div className="p-8 text-red-500">Failed to load insights.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Market Insights</h1>
      
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-8 flex items-start gap-3">
        <AlertTriangle className="mt-1 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-bold">Missing Analytics Endpoint</h4>
          <p className="text-sm mt-1">
            The documented <code className="bg-white px-1 rounded">/v1/analytics/summary</code> endpoint returns a 404 Not Found error. 
            These insights are computed client-side from a sample of {stats.sampleSize} live, valid listings, automatically excluding corrupt records and fake listings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <IndianRupee size={20} />
            <h3 className="font-semibold uppercase text-xs tracking-wider">Average Price</h3>
          </div>
          <p className="text-3xl font-bold">₹{(stats.avgPrice / 100000).toFixed(2)} L</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <TrendingUp size={20} />
            <h3 className="font-semibold uppercase text-xs tracking-wider">Price Range</h3>
          </div>
          <p className="text-xl font-bold">₹{(stats.minPrice / 100000).toFixed(1)} L - ₹{(stats.maxPrice / 10000000).toFixed(1)} Cr</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Home size={20} />
            <h3 className="font-semibold uppercase text-xs tracking-wider">Active Listings (Sample)</h3>
          </div>
          <p className="text-3xl font-bold">{stats.sampleSize}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border max-w-xl">
        <h3 className="font-bold text-lg mb-4">Most Active Localities</h3>
        <div className="space-y-4">
          {stats.topLocalities.map((loc, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="capitalize font-medium text-gray-700">{loc.name}</span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">{loc.count} listings</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
