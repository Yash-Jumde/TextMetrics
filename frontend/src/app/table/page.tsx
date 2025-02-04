'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
// import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AnalysisData {
  id: number;
  text: string;
  emotion_label: string;
  emotion_confidence: number;
  gibberish_score: number;
  gibberish_label: string;
}

async function getScores(): Promise<AnalysisData[]> {
  try {
    const res = await fetch('/api/score', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching scores:', error);
    return [];
  }
}

export default function TablePage() {
  // const router = useRouter();
  const [data, setData] = useState<AnalysisData[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useState(() => {
    getScores().then(setData);
  });

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/score?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete entry');
      }

      const newData = await getScores();
      setData(newData);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete entry. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 px-2">
        <Link href="/" className="text-blue-500 hover:text-blue-400 transition-colors">
          ← Back to Dashboard
        </Link>
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <div className="text-center text-gray-400">No entries found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-2 py-4">
        <Link href="/" className="text-blue-500 hover:text-blue-400 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="px-2">
        {deleteError && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {deleteError}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg">
          <table className="w-full text-gray-200">
            <thead className="text-gray-400 uppercase bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left w-16">ID</th>
                <th className="px-4 py-3 text-left w-1/3">TEXT</th>
                <th className="px-4 py-3 text-center">EMOTION</th>
                <th className="px-4 py-3 text-center">CONFIDENCE</th>
                <th className="px-4 py-3 text-center">GIBBERISH LABEL</th>
                <th className="px-4 py-3 text-center">GIBBERISH SCORE</th>
                <th className="px-4 py-3 text-center w-24">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-left">{item.id}</td>
                  <td className="px-4 py-3 text-left">
                    <div>{item.text || 'No text available'}</div>
                  </td>
                  <td className="px-4 py-3 text-center">{item.emotion_label || 'N/A'}</td>
                  <td className="px-4 py-3 text-center">
                    {typeof item.emotion_confidence === 'number'
                      ? `${(item.emotion_confidence * 100).toFixed(1)}%`
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center">{item.gibberish_label || 'N/A'}</td>
                  <td className="px-4 py-3 text-center">
                    {typeof item.gibberish_score === 'number'
                      ? `${(item.gibberish_score * 100).toFixed(1)}%`
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="inline-flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                          disabled={isDeleting}
                        >
                          <Trash2 size={18} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Entry</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete this entry? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 text-white hover:bg-red-500"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}