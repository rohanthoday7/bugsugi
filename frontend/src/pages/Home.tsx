import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Cpu, Play } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-cyber-bg">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyber-teal rounded-full blur-[150px] opacity-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyber-gold rounded-full blur-[150px] opacity-5"></div>
      
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 relative"
        >
          {/* Logo / Title */}
          <h1 className="text-7xl md:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-cyber-gold to-yellow-600 drop-shadow-[0_0_10px_rgba(195,161,101,0.5)]">
            BUGSUGI
          </h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.6, duration: 1 }}
            className="h-1 bg-gradient-to-r from-transparent via-cyber-teal to-transparent mt-2"
          />
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-2xl md:text-3xl font-light text-gray-300 mb-12 tracking-wide font-mono"
        >
          Round 1 <span className="text-cyber-teal">MCQ</span> Challenge
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col md:flex-row gap-6 w-full max-w-md md:max-w-xl mx-auto"
        >
          <button 
            onClick={() => navigate('/login')}
            className="flex-1 btn-primary flex items-center justify-center gap-2 text-lg"
          >
            <Play size={20} />
            Start Quiz
          </button>
          
          <button 
            onClick={() => navigate('/admin')}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-lg"
          >
            <Shield size={20} />
            Admin Login
          </button>
        </motion.div>
      </div>

      {/* Futuristic Footer Stats/Icons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="w-full glass-panel py-6 px-12 flex justify-between items-center text-sm text-gray-400 font-mono z-10"
      >
        <div className="flex items-center gap-2"><Terminal size={16} className="text-cyber-teal"/> V 1.0.0_STABLE</div>
        <div className="flex items-center gap-2"><Cpu size={16} className="text-cyber-gold"/> SECURE_CON_ESTABLISHED</div>
        <div className="hidden md:block flex items-center gap-2"><Shield size={16} className="text-cyber-green"/> ALL_SYSTEMS_NOMINAL</div>
      </motion.div>
    </div>
  );
}
