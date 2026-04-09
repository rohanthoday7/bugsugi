import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface QuestionSeq {
  id: string;
  orderIndex: number;
  selectedOption: string | null;
  question: {
    id: string;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
  };
}

export default function Quiz() {
  const [questions, setQuestions] = useState<QuestionSeq[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user status and time
    const init = async () => {
      try {
        const token = localStorage.getItem('team_token');
        const [meRes, qRes] = await Promise.all([
          fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/quiz/questions', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const meData = await meRes.json();
        const qData = await qRes.json();

        if (meData.team?.status === 'COMPLETED') {
          navigate('/result');
          return;
        }

        setQuestions(qData);
        
        // Calculate remaining time
        if (meData.team?.startTime) {
           const start = new Date(meData.team.startTime).getTime();
           const now = new Date().getTime();
           const durMs = (meData.durationMinutes || 60) * 60 * 1000;
           const remaining = Math.floor((durMs - (now - start)) / 1000);
           setTimeLeft(remaining > 0 ? remaining : 0);
        }
      } catch (err) {
        navigate('/login');
      }
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, [timeLeft]);

  const handleSelect = async (option: string | null) => {
    const q = questions[currentIndex];
    
    // Optimistic update
    const updated = [...questions];
    updated[currentIndex].selectedOption = option;
    setQuestions(updated);

    // Save to DB
    try {
      await fetch('http://localhost:5000/api/quiz/save-answer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('team_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sequenceId: q.id, selectedOption: option })
      });
    } catch (e) {
      console.error('Failed to save answer');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/quiz/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('team_token')}` }
      });
      if (res.ok) {
        navigate('/result');
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) return <div className="min-h-screen bg-cyber-bg flex items-center justify-center text-cyber-teal font-mono">LOADING SYS_FILES...</div>;

  const q = questions[currentIndex];
  const answeredCount = questions.filter(q => q.selectedOption).length;
  const unansweredCount = questions.length - answeredCount;

  const getStatusColor = (idx: number) => {
    if (idx === currentIndex) return 'bg-cyber-gold text-black';
    if (questions[idx].selectedOption) return 'bg-cyber-green text-white';
    return 'bg-cyber-gray text-white hover:bg-gray-600';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05080A]">

      {/* ── Confirm Submit Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-panel rounded-lg p-8 max-w-md w-full mx-4 border border-cyber-gold/40">
            <h2 className="text-2xl font-bold text-cyber-gold font-mono mb-2 tracking-widest">CONFIRM SUBMIT?</h2>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              You are about to lock your answers. This action is <span className="text-cyber-red font-bold">irreversible</span>.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm font-mono">
              <div className="bg-[#0a1a15] border border-cyber-green/30 rounded p-3 text-center">
                <div className="text-2xl font-bold text-cyber-green">{answeredCount}</div>
                <div className="text-gray-400 text-xs mt-1">Answered</div>
              </div>
              <div className="bg-[#1a0a0a] border border-cyber-red/30 rounded p-3 text-center">
                <div className="text-2xl font-bold text-cyber-red">{unansweredCount}</div>
                <div className="text-gray-400 text-xs mt-1">Unanswered</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border border-cyber-border text-gray-300 rounded hover:bg-white/5 transition font-mono text-sm"
              >
                CANCEL
              </button>
              <button
                onClick={() => { setShowConfirmModal(false); handleSubmit(); }}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-cyber-red text-white rounded hover:bg-red-600 transition font-bold font-mono text-sm"
              >
                {isSubmitting ? 'SUBMITTING...' : 'LOCK & SUBMIT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="h-16 border-b border-cyber-border bg-[#0B1114] flex items-center justify-between px-6 shrink-0">
        <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-teal to-cyber-gold">BUGSUGI</div>
        <div className="flex items-center gap-3">
          <Clock className={timeLeft && timeLeft < 300 ? "text-cyber-red animate-pulse" : "text-cyber-teal"} size={20} />
          <span className={`font-mono text-xl ${timeLeft && timeLeft < 300 ? "text-cyber-red font-bold" : "text-white"}`}>
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Quiz Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex justify-between items-center text-gray-400 font-mono">
              <span>QUESTION {currentIndex + 1} OF {questions.length}</span>
              {q.selectedOption && <span className="text-cyber-green flex items-center gap-1"><Check size={16}/> Saved</span>}
            </div>

            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl text-white leading-relaxed mb-8">{q.question.text}</h2>
              
              <div className="space-y-4">
                {['A', 'B', 'C', 'D'].map((optKey) => {
                  const optText = q.question[`option${optKey}` as keyof typeof q.question];
                  const isSelected = q.selectedOption === optKey;
                  return (
                    <button
                      key={optKey}
                      onClick={() => handleSelect(optKey)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center ${
                        isSelected 
                        ? 'border-cyber-teal bg-[rgba(25,197,180,0.1)]' 
                        : 'border-cyber-gray bg-[#0a0f12] hover:border-gray-500'
                      }`}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded font-bold mr-4 shrink-0 ${
                        isSelected ? 'bg-cyber-teal text-black' : 'bg-cyber-gray text-white'
                      }`}>
                        {optKey}
                      </div>
                      <span className="text-gray-200">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Clear Answer Button */}
              {q.selectedOption && (
                <button
                  onClick={() => handleSelect(null)}
                  className="mt-4 text-xs text-gray-500 hover:text-cyber-red transition-colors font-mono flex items-center gap-1 underline underline-offset-2"
                >
                  ✕ Clear Selection
                </button>
              )}
            </motion.div>

            {/* Nav Buttons */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-cyber-border">
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="btn-secondary disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-2"
              >
                <ChevronLeft size={20} /> Prev
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isSubmitting}
                  className="bg-cyber-red text-white font-bold py-3 px-6 rounded-md hover:bg-red-600 transition-all font-mono tracking-widest text-sm"
                >
                  FINISH EXAM
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="btn-primary flex items-center gap-2"
                >
                  Next <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Palette */}
        <div className="w-64 md:w-80 border-l border-cyber-border bg-[#0B1114] flex flex-col">
          <div className="p-4 border-b border-cyber-border shrink-0">
             <h3 className="text-white font-bold tracking-widest text-sm mb-4">QUESTION PALETTE</h3>
             <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-cyber-green rounded-sm"></div> Answered <span className="ml-auto font-bold text-cyber-green">{answeredCount}</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-cyber-gray rounded-sm"></div> Unanswered <span className="ml-auto font-bold text-gray-400">{unansweredCount}</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-cyber-gold rounded-sm"></div> Current</div>
             </div>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 text-sm font-mono rounded flex items-center justify-center transition-colors ${getStatusColor(idx)}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Submit from sidebar too */}
          <div className="p-4 border-t border-cyber-border">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-3 bg-cyber-red text-white font-bold rounded hover:bg-red-600 transition font-mono text-sm tracking-widest"
            >
              FINISH EXAM
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
