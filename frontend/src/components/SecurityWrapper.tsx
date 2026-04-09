import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function SecurityWrapper({ children }: { children: React.ReactNode }) {
  const [warningVisible, setWarningVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [switchCount, setSwitchCount] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Submit quiz via API then redirect
  const autoSubmit = async () => {
    try {
      const token = localStorage.getItem('team_token');
      await fetch('http://localhost:5000/api/quiz/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (_) {}
    navigate('/result?reason=cheat');
  };

  const startCountdown = () => {
    let seconds = 5;
    setCountdown(seconds);
    countdownRef.current = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);
      if (seconds <= 0) {
        clearInterval(countdownRef.current!);
        autoSubmit();
      }
    }, 1000);
  };

  const handleStayInExam = () => {
    clearInterval(countdownRef.current!);
    setWarningVisible(false);
    setCountdown(5);
  };

  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    // Warn on browser close/refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    // Tab switch / minimize detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            // 3rd offense → immediate auto-submit
            autoSubmit();
          } else {
            // 1st or 2nd → show warning with countdown
            setWarningVisible(true);
            startCountdown();
          }
          return newCount;
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(countdownRef.current!);
    };
  }, [navigate]);

  return (
    <>
      <AnimatePresence>
        {warningVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <div className="glass-panel p-8 max-w-md w-full mx-4 text-center rounded-xl border-2 border-cyber-red">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-cyber-red mb-2 font-mono tracking-wider">TAB SWITCH DETECTED</h2>
              <p className="text-gray-300 mb-2 text-sm">
                You left the exam window. This is violation <span className="text-cyber-red font-bold">#{switchCount} of 3</span>.
              </p>
              <p className="text-gray-400 mb-6 text-sm">
                Your exam will be <span className="text-cyber-red font-bold">automatically submitted</span> in:
              </p>
              <div className="text-6xl font-mono font-bold text-cyber-red mb-6 animate-pulse">
                {countdown}
              </div>
              <button
                onClick={handleStayInExam}
                className="w-full bg-cyber-teal text-black font-bold py-3 rounded hover:bg-cyber-teal-hover transition font-mono tracking-widest"
              >
                RETURN TO EXAM
              </button>
              {switchCount < 3 && (
                <p className="text-gray-600 text-xs mt-3 font-mono">
                  {3 - switchCount} violation(s) remaining before auto-submit
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
