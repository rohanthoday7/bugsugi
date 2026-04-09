import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileQuestion, Trophy, Settings, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('LEADERBOARD');
  const [teams, setTeams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [timerDuration, setTimerDuration] = useState('60');
  
  const [newTeam, setNewTeam] = useState({ username: '', password: '' });
  const [newQ, setNewQ] = useState({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' });

  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [activeTab, token]);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      if (activeTab === 'TEAMS') {
        const r = await fetch('http://localhost:5000/api/admin/teams', { headers });
        setTeams(await r.json());
      } else if (activeTab === 'QUESTIONS') {
        const r = await fetch('http://localhost:5000/api/admin/questions', { headers });
        setQuestions(await r.json());
      } else if (activeTab === 'LEADERBOARD') {
        const r = await fetch('http://localhost:5000/api/admin/leaderboard', { headers });
        setLeaderboard(await r.json());
      } else if (activeTab === 'SETTINGS') {
        const r = await fetch('http://localhost:5000/api/admin/settings', { headers });
        const s = await r.json();
        const tSetting = s.find((x: any) => x.key === 'TIMER_DURATION_MINUTES');
        if (tSetting) setTimerDuration(tSetting.value);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/admin/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newTeam)
    });
    setNewTeam({ username: '', password: '' });
    fetchData();
  };

  const handleDeleteTeam = async (id: string) => {
    if(confirm('Delete team? This wipes all their answers!')) {
      await fetch(`http://localhost:5000/api/admin/teams/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newQ)
    });
    setNewQ({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' });
    fetchData();
  };

  const handleDeleteQuestion = async (id: string) => {
    await fetch(`http://localhost:5000/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleSaveSettings = async () => {
    await fetch('http://localhost:5000/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ key: 'TIMER_DURATION_MINUTES', value: timerDuration })
    });
    alert('Settings Saved');
  };

  return (
    <div className="min-h-screen bg-[#05080A] text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0a0f12] border-r border-cyber-border flex flex-col">
        <div className="p-6 border-b border-cyber-border">
          <h1 className="text-2xl font-bold text-cyber-gold tracking-widest font-mono">SYS_ADMIN</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'LEADERBOARD', icon: Trophy, label: 'Leaderboard' },
            { id: 'TEAMS', icon: Users, label: 'Team Accounts' },
            { id: 'QUESTIONS', icon: FileQuestion, label: 'Question Bank' },
            { id: 'SETTINGS', icon: Settings, label: 'Settings' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 p-3 rounded text-left transition-colors font-mono uppercase text-sm ${
                activeTab === t.id ? 'bg-cyber-teal bg-opacity-20 border-l-2 border-cyber-teal text-white' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-cyber-border">
          <button 
           onClick={() => { localStorage.removeItem('admin_token'); navigate('/'); }}
           className="w-full flex items-center gap-2 text-cyber-red p-2 hover:bg-white/5 rounded"
          >
            <LogOut size={18}/> Exfiltrate
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <h2 className="text-3xl font-mono mb-8 border-b-2 border-cyber-border pb-4 inline-block">{activeTab}</h2>

        {activeTab === 'LEADERBOARD' && (
          <div className="bg-[#0a0f12] rounded border border-cyber-border overflow-hidden">
             <table className="w-full text-left font-mono text-sm">
               <thead className="bg-[#10191d] text-cyber-gold">
                 <tr>
                   <th className="p-4">Rank</th>
                   <th className="p-4">Team</th>
                   <th className="p-4">Score</th>
                   <th className="p-4">Right/Wrong</th>
                 </tr>
               </thead>
               <tbody>
                 {leaderboard.map((t, idx) => (
                   <tr key={t.id} className="border-t border-cyber-border">
                     <td className="p-4 font-bold">#{idx + 1}</td>
                     <td className="p-4 text-cyber-teal">{t.username}</td>
                     <td className="p-4">{t.score}</td>
                     <td className="p-4 text-gray-400"><span className="text-cyber-green">{t.correctAnswers}</span> / <span className="text-cyber-red">{t.wrongAnswers}</span></td>
                   </tr>
                 ))}
                 {leaderboard.length === 0 && (
                   <tr><td colSpan={4} className="p-8 text-center text-gray-500">No teams have completed the test yet.</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === 'TEAMS' && (
          <div className="space-y-8">
            <div className="glass-panel p-6 rounded">
              <h3 className="text-lg text-cyber-gold mb-4 font-mono">Add New Team</h3>
              <form onSubmit={handleAddTeam} className="flex gap-4">
                <input required placeholder="Username" className="bg-black/50 border border-cyber-border p-2 rounded text-white flex-1" value={newTeam.username} onChange={e=>setNewTeam({...newTeam, username: e.target.value})} />
                <input required placeholder="Password" type="password" className="bg-black/50 border border-cyber-border p-2 rounded text-white flex-1" value={newTeam.password} onChange={e=>setNewTeam({...newTeam, password: e.target.value})} />
                <button type="submit" className="bg-cyber-teal text-black px-6 rounded font-bold hover:bg-cyber-teal-hover">ADD</button>
              </form>
            </div>
            <div className="bg-[#0a0f12] rounded border border-cyber-border overflow-hidden">
             <table className="w-full text-left font-mono text-sm">
               <thead className="bg-[#10191d] text-cyber-gold">
                 <tr><th>Team</th><th>Status</th><th>Score</th><th>Action</th></tr>
               </thead>
               <tbody>
                 {teams.map(t => (
                   <tr key={t.id} className="border-t border-cyber-border">
                     <td className="p-3">{t.username}</td>
                     <td className="p-3 text-xs">{t.status}</td>
                     <td className="p-3">{t.score}</td>
                     <td className="p-3 text-cyber-red cursor-pointer hover:underline" onClick={() => handleDeleteTeam(t.id)}>Delete</td>
                   </tr>
                 ))}
               </tbody>
             </table>
            </div>
          </div>
        )}

        {activeTab === 'QUESTIONS' && (
          <div className="space-y-8">
            <div className="glass-panel p-6 rounded">
              <h3 className="text-lg text-cyber-gold mb-4 font-mono">Add Question ({questions.length}/120)</h3>
              <form onSubmit={handleAddQuestion} className="space-y-4 text-sm font-mono text-gray-300">
                <textarea required placeholder="Question text..." className="w-full bg-black/50 border border-cyber-border p-3 rounded" rows={3} value={newQ.text} onChange={e=>setNewQ({...newQ, text: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Opt A" className="bg-black/50 border border-cyber-border p-2" value={newQ.optionA} onChange={e=>setNewQ({...newQ, optionA: e.target.value})} />
                  <input required placeholder="Opt B" className="bg-black/50 border border-cyber-border p-2" value={newQ.optionB} onChange={e=>setNewQ({...newQ, optionB: e.target.value})} />
                  <input required placeholder="Opt C" className="bg-black/50 border border-cyber-border p-2" value={newQ.optionC} onChange={e=>setNewQ({...newQ, optionC: e.target.value})} />
                  <input required placeholder="Opt D" className="bg-black/50 border border-cyber-border p-2" value={newQ.optionD} onChange={e=>setNewQ({...newQ, optionD: e.target.value})} />
                </div>
                <div className="flex gap-4 items-center">
                  <label>Correct Answer:</label>
                  <select className="bg-black/50 border border-cyber-border p-2 w-32" value={newQ.correctOption} onChange={e=>setNewQ({...newQ, correctOption: e.target.value})}>
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                  </select>
                  <div className="flex-1"></div>
                  <button type="submit" className="bg-cyber-teal text-black px-6 py-2 rounded font-bold uppercase tracking-widest">Inject Base</button>
                </div>
              </form>
            </div>
            
            <div className="space-y-4">
               {questions.map((q, i) => (
                 <div key={q.id} className="bg-[#0a0f12] p-4 text-sm font-mono border border-cyber-border flex">
                   <div className="w-8 text-gray-500">{i+1}.</div>
                   <div className="flex-1">
                     <p className="mb-2 text-white">{q.text}</p>
                     <p className="text-gray-400">Answer: <span className="text-cyber-green">{q.correctOption}</span></p>
                   </div>
                   <button onClick={() => handleDeleteQuestion(q.id)} className="text-cyber-red ml-4 self-start">Del</button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="glass-panel p-6 rounded max-w-md">
            <h3 className="text-lg text-cyber-gold mb-6 font-mono">Timer Configuration</h3>
            <div className="mb-6">
              <label className="block text-gray-400 mb-2 font-mono text-sm">Duration (Minutes)</label>
              <select 
                value={timerDuration} 
                onChange={(e) => setTimerDuration(e.target.value)}
                className="w-full bg-black/50 border border-cyber-border p-3 text-white focus:outline-none"
              >
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes (1 Hour)</option>
                <option value="120">120 Minutes (2 Hours)</option>
              </select>
            </div>
            <button onClick={handleSaveSettings} className="w-full btn-primary font-mono text-sm">UPDATE CONFIG</button>
          </div>
        )}
      </div>
    </div>
  );
}
