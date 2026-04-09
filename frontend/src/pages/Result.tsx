import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Result() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/quiz/result', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('team_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      setResult(data);
    })
    .catch(() => navigate('/login'))
    .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-cyber-bg flex items-center justify-center text-cyber-teal">CALCULATING_SCORE...</div>;
  if (!result) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#05080A] font-mono">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl"
      >
        {searchParams.get('reason') === 'cheat' && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded text-center mb-8">
            TEST AUTO-SUBMITTED DUE TO TAB SWITCHING PROTOCOL VIOLATION.
          </div>
        )}

        <div className="glass-panel p-8 md:p-12 text-center relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyber-teal to-cyber-gold"></div>
          
          <h1 className="text-3xl text-gray-400 mb-2">EVALUATION COMPLETE</h1>
          <h2 className="text-4xl text-cyber-teal font-bold mb-12 uppercase">{result.teamName}</h2>

          <div className="flex justify-center mb-10">
            <div className="relative">
              <Trophy size={80} className="text-cyber-gold relative z-10" />
              <div className="absolute inset-0 bg-cyber-gold blur-3xl opacity-20"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-black/50 p-4 rounded border border-cyber-border">
              <div className="text-gray-500 text-sm mb-1">SCORE</div>
              <div className="text-3xl text-white font-bold">{result.score}</div>
            </div>
            <div className="bg-black/50 p-4 rounded border border-cyber-border">
              <div className="text-gray-500 text-sm mb-1">RANK</div>
              <div className="text-3xl text-cyber-gold font-bold">#{result.rank}</div>
            </div>
            <div className="bg-black/50 p-4 rounded border border-cyber-border">
              <div className="text-gray-500 text-sm mb-1 flex justify-center items-center gap-1"><CheckCircle size={14}/> RIGHT</div>
              <div className="text-3xl text-cyber-green font-bold">{result.correctAnswers}</div>
            </div>
            <div className="bg-black/50 p-4 rounded border border-cyber-border">
              <div className="text-gray-500 text-sm mb-1 flex justify-center items-center gap-1"><XCircle size={14}/> WRONG</div>
              <div className="text-3xl text-cyber-red font-bold">{result.wrongAnswers}</div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 flex justify-center items-center gap-2">
            <Clock size={16}/> 
            Completed at {new Date(result.endTime).toLocaleTimeString()}
          </div>
        </div>

        <div className="mt-8 text-center">
            <button 
              onClick={() => {
                localStorage.removeItem('team_token');
                navigate('/');
              }}
              className="btn-secondary text-sm"
            >
              LOGOUT / RETURN TO TERMINAL
            </button>
        </div>
      </motion.div>
    </div>
  );
}
