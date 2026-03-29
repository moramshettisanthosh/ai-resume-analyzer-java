import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, AlertCircle, Loader2, Clock, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/resumes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort newest first
      const sorted = res.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistory(sorted);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/results', { state: { result: response.data } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during upload.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const viewResult = (resumeRecord) => {
    navigate('/results', { state: { result: resumeRecord } });
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="glass-card p-10 select-none">
          <h1 className="text-3xl font-bold text-center mb-8">Analyze Your Resume</h1>
          
          <div 
            className="border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center hover:border-indigo-500 hover:bg-slate-800/80 transition-all cursor-pointer relative group"
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <File className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-lg">{file.name}</p>
                  <p className="text-sm text-slate-400">Ready to analyze</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-lg">Click or drag and drop to upload</p>
                  <p className="text-sm text-slate-400 mt-1">Supports PDF, DOCX (Max 10MB)</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mt-8">
            <button 
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                'Start Analysis'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="glass-card p-6 h-full">
          <div className="flex items-center gap-2 mb-6 text-slate-300">
            <Clock className="w-5 h-5" />
            <h2 className="font-bold text-lg">Your History</h2>
          </div>
          
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No resumes analyzed yet.</p>
            ) : (
              history.map((record) => {
                let parsed = { score: 0 };
                try {
                  parsed = JSON.parse(record.analysisResult);
                } catch(e) {}
                
                return (
                  <div 
                    key={record.id} 
                    onClick={() => viewResult(record)}
                    className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 hover:border-indigo-500/50 cursor-pointer transition-colors group"
                  >
                    <p className="text-sm font-medium mb-2 truncate group-hover:text-indigo-400 transition-colors" title={record.filename}>
                      {record.filename}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1 bg-indigo-500/20 px-2 py-1 rounded text-xs font-bold text-indigo-300">
                        <Star className="w-3 h-3" />
                        {parsed?.score || 0}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
