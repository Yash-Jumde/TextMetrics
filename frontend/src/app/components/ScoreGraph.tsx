'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useRouter } from 'next/navigation';

interface AnalysisData {
  id: number;
  text: string;
  emotion_label: string;
  emotion_confidence: number;
  gibberish_label: string;
  gibberish_score: number;
}


export default function AnalysisGraphs({ data }: { data: AnalysisData[] }) {
  const router = useRouter();
  
  if (!data || data.length === 0) return null;

  const processedData = data.slice(0, 8).map(item => ({
    id: item.id,
    text: item.text.length > 20 ? item.text.substring(0, 20) + '...' : item.text,
    emotionScore: item.emotion_confidence * 100,
    emotionLabel: item.emotion_label,
    gibberishScore: item.gibberish_score * 100,
    gibberishLabel: item.gibberish_label
  }));

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

  const getGibberishColor = (label: string) => {
    switch (label) {
      case 'clean': return '#4CAF50';
      case 'noise': return '#F44336';
      case 'mild gibberish': return '#E6E660';
      default: return '#FFFFFF';
    }
  };

  // Simplified click handlers that don't use the data parameter
  const handleEmotionBarClick = () => {
    router.push('/results/emotion');
  };

  const handleQualityBarClick = () => {
    router.push('/results/quality');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Emotion Analysis Graph */}
      <div className="w-full bg-gray-800 rounded-lg p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            Emotion Analysis
          </h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="text" 
                stroke="#9CA3AF"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Bar 
                dataKey="emotionScore" 
                name="Confidence"
                onClick={handleEmotionBarClick}
                cursor="pointer"
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getEmotionColor(entry.emotionLabel)}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gibberish Analysis Graph */}
      <div className="w-full bg-gray-800 rounded-lg p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            Gibberish Analysis
          </h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="text" 
                stroke="#9CA3AF"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Bar 
                dataKey="gibberishScore" 
                name="Score"
                onClick={handleQualityBarClick}
                cursor="pointer"
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getGibberishColor(entry.gibberishLabel)}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}