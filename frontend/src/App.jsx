import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function NavBar() {
  const { user, logout, isAuthenticated } = useAuth();
  
  return (
    <nav className="fixed top-0 w-full border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
             <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AI Resume Analyzer</span>
        </Link>
        
        {isAuthenticated && (
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-slate-300">Welcome, {user}</span>
            <button onClick={logout} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">Log Out</button>
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 selection:bg-indigo-500/30">
          <NavBar />
          
          <main className="pt-24 pb-12 px-4">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
