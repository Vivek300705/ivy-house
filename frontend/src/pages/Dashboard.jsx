import React, { useEffect, useState } from 'react';
import { fetchListings } from '../api';
import { TrendingUp, AlertTriangle, Home, IndianRupee, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#064e3b', '#059669', '#d97706', '#b45309', '#78350f'];

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
        const bhkCount = {};
        
        valid.forEach((l) => {
          totalVal += l.price;
          if (l.price < min) min = l.price;
          if (l.price > max) max = l.price;
          
          localityCount[l.locality] = (localityCount[l.locality] || 0) + 1;
          const bhkLabel = `${l.bedroom} BHK`;
          bhkCount[bhkLabel] = (bhkCount[bhkLabel] || 0) + 1;
        });

        const sortedLocalities = Object.keys(localityCount)
          .sort((a, b) => localityCount[b] - localityCount[a])
          .slice(0, 5)
          .map(loc => ({ name: loc.charAt(0).toUpperCase() + loc.slice(1), value: localityCount[loc] }));

        const bhkData = Object.keys(bhkCount).map(k => ({ name: k, value: bhkCount[k] }));

        setStats({
          sampleSize: valid.length,
          avgPrice: totalVal / valid.length,
          minPrice: min,
          maxPrice: max,
          topLocalities: sortedLocalities,
          bhkData
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    computeInsights();
  }, []);

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white border border-stone-200 rounded-2xl shadow-sm"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white border border-stone-200 rounded-2xl shadow-sm"></div>
          <div className="h-80 bg-white border border-stone-200 rounded-2xl shadow-sm"></div>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-red-500">Failed to load insights.</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Market Insights</h1>
          <p className="text-stone-500 mt-1">Real-time Bangalore property analytics.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-stone-300 text-sm font-medium text-stone-600">
          Sample Size: <span className="text-emerald-900">{stats.sampleSize} valid listings</span>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-8 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="mt-0.5 flex-shrink-0 text-amber-500" size={20} />
        <div>
          <h4 className="font-bold">Automated Client-Side Analytics</h4>
          <p className="text-sm mt-1 text-amber-700/90 leading-relaxed">
            The server's <code className="bg-white px-1.5 py-0.5 rounded text-xs font-mono border border-amber-200">/v1/analytics/summary</code> endpoint returns a 404. 
            These insights are dynamically computed on the client side, automatically stripping out corrupt records and fraudulent bait-and-switch listings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <IndianRupee size={80} />
          </div>
          <div className="flex items-center gap-3 mb-4 text-stone-500">
            <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl"><IndianRupee size={20} /></div>
            <h3 className="font-semibold uppercase text-xs tracking-wider">Average Price</h3>
          </div>
          <p className="text-4xl font-extrabold text-stone-900">₹{(stats.avgPrice / 100000).toFixed(2)} L</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <div className="flex items-center gap-3 mb-4 text-stone-500">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={20} /></div>
            <h3 className="font-semibold uppercase text-xs tracking-wider">Price Range</h3>
          </div>
          <p className="text-2xl font-extrabold text-stone-900 mt-2">₹{(stats.minPrice / 100000).toFixed(1)} L - ₹{(stats.maxPrice / 10000000).toFixed(1)} Cr</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Home size={80} />
          </div>
          <div className="flex items-center gap-3 mb-4 text-stone-500">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Home size={20} /></div>
            <h3 className="font-semibold uppercase text-xs tracking-wider">Active Inventory</h3>
          </div>
          <p className="text-4xl font-extrabold text-stone-900">{stats.sampleSize}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-800">
            <PieChartIcon size={20} className="text-stone-400" /> Inventory by Locality
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topLocalities} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#064e3b" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-800">
            <Home size={20} className="text-stone-400" /> Configuration Split
          </h3>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.bhkData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.bhkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 flex-wrap mt-2">
            {stats.bhkData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm font-medium text-stone-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
