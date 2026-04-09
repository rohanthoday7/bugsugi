import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Clock, ShieldAlert, Cpu } from 'lucide-react';

export default function Instructions() {
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('team_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.team?.status === 'COMPLETED') navigate('/result');
      if (data.team?.status === 'IN_PROGRESS') navigate('/quiz');
      if (data.durationMinutes) setDuration(data.durationMinutes);
    })
    .catch(() => navigate('/login'));
  }, [navigate]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/quiz/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('team_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        navigate('/quiz');
      } else {
        alert('Failed to start quiz');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cyber-bg p-6 flex flex-col items-center justify-center font-mono">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl glass-panel p-8 md:p-12 border-l-4 border-cyber-teal"
      >
        <div className="flex items-center gap-4 mb-8 border-b border-cyber-gray pb-4">
          <Terminal size={32} className="text-cyber-teal" />
          <h1 className="text-3xl tracking-wider text-white">SYSTEM PROTOCOLS</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
            <h3 className="text-cyber-gold text-xl flex items-center gap-2"><Cpu size={20}/> Technical Specs</h3>
            <ul className="space-y-2 text-gray-300 list-disc pl-5">
              <li>You have <strong>120 multiple choice questions</strong> to answer.</li>
              <li>Questions are presented one at a time.</li>
              <li>Answers are automatically saved to our servers upon selection.</li>
              <li>You can navigate between questions using the palette.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-cyber-red text-xl flex items-center gap-2"><ShieldAlert size={20}/> Security Rules</h3>
            <ul className="space-y-2 text-gray-300 list-disc pl-5">
              <li>Do not refresh the page unnecessarily.</li>
              <li>Right-click has been disabled.</li>
              <li><strong>TAB SWITCHING IS MONITORED.</strong> If you switch tabs or minimize the browser 3 times, your test will be auto-submitted.</li>
            </ul>
          </div>
        </div>

        <div className="bg-black/40 p-6 flex items-center justify-between mb-8 rounded">
          <div className="flex items-center gap-3">
            <Clock className="text-cyber-teal" size={24} />
            <span className="text-xl text-white">Total Time Allowed: <strong>{duration} Minutes</strong></span>
          </div>
          <div className="text-cyber-gray hidden md:block">
            Timer starts exactly when you press the button below.
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={startQuiz}
            disabled={loading}
            className="btn-primary flex items-center gap-2 tracking-widest uppercase font-bold"
          >
            {loading ? 'INITIALIZING...' : 'ACKNOWLEDGE & BEGIN'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
