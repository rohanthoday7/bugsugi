import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('admin_token', data.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#05080A]">
      <div className="absolute top-4 left-4">
        <button onClick={() => navigate('/')} className="text-cyber-gold flex items-center gap-2 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-8 rounded-xl border border-cyber-gold/30 shadow-[0_0_30px_rgba(195,161,101,0.1)]"
      >
        <div className="flex justify-center mb-6">
          <ShieldAlert size={48} className="text-cyber-gold" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-cyber-gold mb-8 uppercase tracking-widest font-mono">System Override</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Admin ID"
              className="w-full bg-black/50 border-b-2 border-cyber-gray focus:border-cyber-gold py-3 pl-2 pr-4 text-white focus:outline-none transition-colors font-mono"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="relative mb-8">
            <Lock className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input 
              type="password" 
              placeholder="Passphrase"
              className="w-full bg-black/50 border-b-2 border-cyber-gray focus:border-cyber-gold py-3 pl-2 pr-4 text-white focus:outline-none transition-colors font-mono"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-transparent border-2 border-cyber-gold text-cyber-gold font-bold py-3 uppercase tracking-widest hover:bg-cyber-gold hover:text-black transition-all duration-300">
            Initialize
          </button>
        </form>
      </motion.div>
    </div>
  );
}
