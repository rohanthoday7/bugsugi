import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Instructions from './pages/Instructions';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import AdminDashboard from './pages/AdminDashboard';
import SecurityWrapper from './components/SecurityWrapper';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />
        
        {/* Anti-cheat enabled routes */}
        <Route path="/instructions" element={
          <SecurityWrapper>
            <Instructions />
          </SecurityWrapper>
        } />
        <Route path="/quiz" element={
          <SecurityWrapper>
            <Quiz />
          </SecurityWrapper>
        } />
        
        <Route path="/result" element={<Result />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
