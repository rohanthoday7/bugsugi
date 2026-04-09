import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function SecurityWrapper({ children }: { children: React.ReactNode }) {
  const [warningVisible, setWarningVisible] = useState(false);
  const [switchCount, setSwitchCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            // Auto submit if switched too many times
            // Here we would ideally call the API to submit
            // For now, we will navigate to result with a warning param
            // The actual auto-submission will happen in the Quiz component or via API
            navigate('/result?reason=cheat');
          }
          return newCount;
        });
        setWarningVisible(true);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm"
          >
            <div className="glass-panel p-8 max-w-md text-center rounded-xl border-cyber-red border">
              <div className="text-cyber-red text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-4">Warning: Tab Switch Detected</h2>
              <p className="text-gray-300 mb-6">
                You have switched tabs or minimized the browser {switchCount} time(s). 
                After 3 times, your quiz will be automatically submitted.
              </p>
              <button 
                onClick={() => setWarningVisible(false)}
                className="bg-cyber-red text-white px-6 py-2 rounded font-bold hover:bg-red-600 transition-colors"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
