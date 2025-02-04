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

export default function EmotionPage() {
  const [data, setData] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const emotionLabels: { [key: string]: string } = {
    admiration: 'Admiration',
    amusement: 'Amusement',
    anger: 'Anger',
    annoyance: 'Annoyance',
    approval: 'Approval',
    caring: 'Caring',
    confusion: 'Confusion',
    curiosity: 'Curiosity',
    desire: 'Desire',
    disappointment: 'Disappointment',
    disapproval: 'Disapproval',
    disgust: 'Disgust',
    embarrassment: 'Embarrassment',
    excitement: 'Excitement',
    fear: 'Fear',
    gratitude: 'Gratitude',
    grief: 'Grief',
    joy: 'Joy',
    love: 'Love',
    nervousness: 'Nervousness',
    optimism: 'Optimism',
    pride: 'Pride',
    realization: 'Realization',
    relief: 'Relief',
    remorse: 'Remorse',
    sadness: 'Sadness',
    surprise: 'Surprise',
    neutral: 'Neutral'
  };

  const getEmotionColor = (label: string) => {
    const colors: { [key: string]: string } = {
      admiration: '#FFD700',
      amusement: '#FFEB3B',
      anger: '#F44336',
      annoyance: '#FF5722',
      approval: '#8BC34A',
      caring: '#FF69B4',
      confusion: '#9E9E9E',
      curiosity: '#03A9F4',
      desire: '#E91E63',
      disappointment: '#607D8B',
      disapproval: '#795548',
      disgust: '#4E342E',
      embarrassment: '#F06292',
      excitement: '#FF9800',
      fear: '#9C27B0',
      gratitude: '#00BCD4',
      grief: '#1A237E',
      joy: '#4CAF50',
      love: '#D50000',
      nervousness: '#673AB7',
      optimism: '#CDDC39',
      pride: '#3F51B5',
      realization: '#00E676',
      relief: '#76FF03',
      remorse: '#FF1744',
      sadness: '#2196F3',
      surprise: '#FF9800',
      neutral: '#757575',
      default: '#757575'
    };
    return colors[label.toLowerCase()] || colors.default;
  };

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
    emotionScore: item.emotion_confidence * 100,
    emotionLabel: item.emotion_label
  }));

  return (
    <div className="container mx-auto p-8">
      <Card className="w-full bg-gray-800 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Detailed Emotion Analysis</h1>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Back to Dashboard
            </button>
          </div>
          <p className="text-gray-400 mt-2">
            Emotional distribution across messages with confidence scores
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
                  value: 'Confidence Score (%)', 
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
                dataKey="emotionScore" 
                name="Confidence"
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getEmotionColor(entry.emotionLabel)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-48 overflow-y-auto p-4">
          {Object.entries(emotionLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: getEmotionColor(key) }}
              />
              <span className="text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}