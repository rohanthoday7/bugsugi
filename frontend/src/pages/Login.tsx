import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage as fallback (though HttpOnly cookie is set)
      localStorage.setItem('team_token', data.token);
      
      if (data.team.status === 'COMPLETED') {
        navigate('/result');
      } else if (data.team.status === 'IN_PROGRESS') {
        navigate('/quiz');
      } else {
        navigate('/instructions');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cyber-bg">
      <div className="absolute top-4 left-4">
        <button onClick={() => navigate('/')} className="text-cyber-teal flex items-center gap-2 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-8 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-teal to-cyber-gold"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-widest text-shadow-[0_0_10px_rgba(25,197,180,0.5)]">TEAM AUTH</h2>
          <p className="text-gray-400 text-sm">Enter your designated credentials to proceed.</p>
        </div>

        {error && (
          <div className="bg-cyber-red bg-opacity-20 border border-cyber-red text-red-400 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Team Username"
                required
                className="w-full bg-[#0a0f12] border border-cyber-gray rounded pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyber-teal focus:ring-1 focus:ring-cyber-teal transition-all"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                placeholder="Access Code"
                required
                className="w-full bg-[#0a0f12] border border-cyber-gray rounded pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyber-teal focus:ring-1 focus:ring-cyber-teal transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary bg-cyber-teal font-bold uppercase tracking-wider relative overflow-hidden group">
            <span className="relative z-10">Authenticate</span>
            <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300"></div>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
