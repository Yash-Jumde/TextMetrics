'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface AnalysisData {
  id: number;
  text: string;
  emotion_label: string;
  emotion_confidence: number;
  gibberish_label: string;
  gibberish_score: number;
}

export default function QualityPage() {
  const [data, setData] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/score');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-screen">
        <Card className="p-6 bg-gray-800">
          <p className="text-white">{error || 'No data available'}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </Card>
      </div>
    );
  }

  const processedData = data.map(item => ({
    id: item.id,
    text: item.text.length > 30 ? item.text.substring(0, 30) + '...' : item.text,
    gibberishScore: item.gibberish_score * 100,
    gibberishLabel: item.gibberish_label.toLowerCase()
  }));

  const getGibberishColor = (label: string) => {
    switch (label) {
      case 'clean': return '#4CAF50'; // Green
      case 'noise': return '#F44336'; // Red
      case 'mild gibberish': return '#E6E660'; // Yellow
      default: return '#FFFFFF';
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="w-full bg-gray-800 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Detailed Text Analysis</h1>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Back to Dashboard
            </button>
          </div>
          <p className="text-gray-400 mt-2">
            Text quality assessment showing gibberish detection scores
          </p>
        </div>
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="text" 
                stroke="#9CA3AF"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Quality Score (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#9CA3AF' }
                }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Bar 
                dataKey="gibberishScore" 
                name="Score"
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getGibberishColor(entry.gibberishLabel)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex gap-4 justify-center">
          {[ 
            { label: 'Clean Text', color: '#008000' },
            { label: 'Mild Gibberish', color: '#FFFF00' },
            { label: 'Gibberish', color: '#FF0000' },
            { label: 'Word Salad', color: '#FFFFFF' }
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
