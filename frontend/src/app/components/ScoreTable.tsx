// frontend/src/app/components/ScoreTable.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
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

export default function ScoreTable({ data }: { data: AnalysisData[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check if we're on the table page
  const isTablePage = pathname === '/table';

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg pg-6">
        <div className="text-center text-gray-400">No entries found</div>
      </div>
    );
  }

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

      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete entry. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Use all data for table page, only first 8 for dashboard
  const displayData = isTablePage ? data : data.slice(0, 8);

  return (
    <div className={`w-full ${isTablePage ? 'min-h-[calc(100vh-120px)]' : 'h-full'} p-4 sm:p-6 bg-gray-800 rounded-lg`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">
          {isTablePage ? 'All Analyses' : 'Recent Analyses'}
        </h2>
        {!isTablePage && (
          <Link 
            href="/table" 
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            View All Entries
          </Link>
        )}
      </div>

      {deleteError && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          {deleteError}
        </div>
      )}

      <div className={`${isTablePage ? 'min-h-[calc(100vh-240px)]' : 'h-[calc(100%-4rem)]'} w-full overflow-auto`}>
        <table className="w-full text-left text-gray-200">
          <thead className="text-gray-400 uppercase bg-gray-700 sticky top-0">
            <tr>
              <th className="px-4 sm:px-6 py-4 rounded-tl-lg">ID</th>
              <th className="px-4 sm:px-6 py-4">Text</th>
              <th className="px-4 sm:px-6 py-4">Emotion</th>
              <th className="px-4 sm:px-6 py-4">Confidence</th>
              <th className="px-4 sm:px-6 py-4">Gibberish Label</th>
              <th className="px-4 sm:px-6 py-4">Gibberish Score</th>
              <th className="px-4 sm:px-6 py-4 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {displayData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 sm:px-6 py-4">{item.id}</td>
                <td className="px-4 sm:px-6 py-4 max-w-md">
                  <div className="truncate">
                    {item.text || 'No text available'}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4">{item.emotion_label || 'N/A'}</td>
                <td className="px-4 sm:px-6 py-4">
                  {typeof item.emotion_confidence === 'number'
                    ? `${(item.emotion_confidence * 100).toFixed(1)}%`
                    : 'N/A'}
                </td>
                <td className="px-4 sm:px-6 py-4">{item.gibberish_label || 'N/A'}</td>
                <td className="px-4 sm:px-6 py-4">
                  {typeof item.gibberish_score === 'number'
                    ? `${(item.gibberish_score * 100).toFixed(1)}%`
                    : 'N/A'}
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
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
  );
}