// frontend/src/app/page.tsx
import TextInputForm from './components/TextInputForm';
import AnalysisGraphs from './components/ScoreGraph';
import ScoreTable from './components/ScoreTable';

async function getScores() {
  const res = await fetch('http://localhost:3000/api/score', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const data = await getScores();

  return (
    <main className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Text Analysis Dashboard
        </h1>
        
        <TextInputForm />
        
        {data.length > 0 && (
          <div className="space-y-8">
            <ScoreTable data={data} />
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Analysis Trends</h2>
              <AnalysisGraphs data={data} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}