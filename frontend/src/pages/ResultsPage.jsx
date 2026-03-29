import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, Target, Lightbulb } from 'lucide-react';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const resultData = location.state?.result;

  if (!resultData) {
    return <Navigate to="/" replace />;
  }

  // Parse the AI result (it's stored as JSON string in the DB)
  let aiData = null;
  try {
    aiData = JSON.parse(resultData.analysisResult);
  } catch (e) {
    console.error("Failed to parse AI response", e);
  }

  const score = aiData?.score || 0;
  const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = score >= 80 ? 'bg-green-400/10 border-green-400/20' : score >= 60 ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-red-400/10 border-red-400/20';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group mb-6"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Analyze another resume
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Score Card */}
        <div className={`glass-card p-8 flex flex-col items-center justify-center text-center border-2 ${scoreBg} md:col-span-1`}>
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-700" />
              <circle 
                cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="none" 
                strokeDasharray="377" strokeDashoffset={377 - (377 * score) / 100}
                className={`${scoreColor} transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
              <span className="text-xs text-slate-400 mt-1">/ 100</span>
            </div>
          </div>
          <h2 className="text-xl font-bold mt-6">Overall Score</h2>
          <p className="text-sm text-slate-400 mt-2">Based on industry standards</p>
        </div>

        {/* Details Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Skills Card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Star className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold">Extracted Skills</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {aiData?.skills?.length > 0 ? aiData.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-full text-sm font-medium">
                  {skill}
                </span>
              )) : (
                <span className="text-slate-400 text-sm">No skills explicitly detected.</span>
              )}
            </div>
          </div>

          {/* Suggestions Card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold">Suggestions for Improvement</h3>
            </div>
            
            <ul className="space-y-3">
              {aiData?.suggestions?.length > 0 ? aiData.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{suggestion}</span>
                </li>
              )) : (
                <li className="text-slate-400 text-sm">Looking good! No specific suggestions right now.</li>
              )}
            </ul>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
