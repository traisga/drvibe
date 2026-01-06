import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  FileCode, 
  Stethoscope, 
  Zap, 
  Thermometer, 
  Search, 
  ArrowRight,
  ShieldAlert,
  Terminal,
  Cpu,
  XCircle,
  Coffee
} from 'lucide-react';

/**
 * VIBE DOCTOR - The Code Health Clinic
 * NOW LIVE: Connected to GitHub API + Monetization Ready
 */

const SCANNER_LOGS = [
  "Connecting to GitHub Satellite...",
  "Authorizing bio-scan...",
  "Fetching repository skeleton...",
  "Palpating the file tree...",
  "Checking for documentation pulses...",
  "Analyzing technical debt density...",
  "Consulting the Chief Surgeon...",
  "Generating final prognosis..."
];

export default function VibeDoctor() {
  const [view, setView] = useState('waiting'); // waiting, scanning, dashboard, error
  const [repoUrl, setRepoUrl] = useState('');
  const [scanLogIndex, setScanLogIndex] = useState(0);
  const [vibeScore, setVibeScore] = useState(0);
  const [diagnosis, setDiagnosis] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // --- Real Analysis Engine ---

  const analyzeRepo = async (url) => {
    try {
      // 1. Parse URL to get Owner/Repo
      const cleanUrl = url.replace('https://', '').replace('github.com/', '');
      const parts = cleanUrl.split('/').filter(p => p);
      
      if (parts.length < 2) {
        throw new Error("Invalid format. Please use 'owner/repo' or a full URL.");
      }
      
      const [owner, repo] = parts;

      // 2. Fetch Repo Details
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!repoRes.ok) {
        if (repoRes.status === 404) throw new Error("Repository not found (or private).");
        if (repoRes.status === 403) throw new Error("Rate limit exceeded. Try again later.");
        throw new Error("Connection failed.");
      }
      const repoData = await repoRes.json();
      const defaultBranch = repoData.default_branch;

      // 3. Fetch File Tree
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
      const treeData = await treeRes.json();
      
      if (treeData.message === "Not Found") throw new Error("Could not access file tree.");

      // 4. THE VIBE ALGORITHM
      const files = treeData.tree || [];
      const fileCount = files.length;
      
      const hasReadme = files.some(f => f.path.toLowerCase() === 'readme.md');
      const hasEnv = files.some(f => f.path.toLowerCase().includes('.env') && !f.path.includes('example')); 
      const hasLockFile = files.some(f => f.path.includes('lock'));
      const isTypeScript = files.some(f => f.path.endsWith('.ts') || f.path.endsWith('.tsx'));

      let score = 100;
      let prescriptions = [];
      let summary = "";

      // Rule 1: Bloat Check
      if (fileCount > 50) {
        score -= 15;
        prescriptions.push({
          id: 'bloat',
          severity: 'warning',
          title: 'Project Bloatware',
          diagnosis: `Detected ${fileCount} files. The project is carrying excess weight.`,
          treatment: "Review file structure. Modularization recommended.",
          time: "30-minute procedure"
        });
      } else if (fileCount < 3) {
        score -= 10;
        prescriptions.push({
          id: 'ghost',
          severity: 'info',
          title: 'Ghost Town Syndrome',
          diagnosis: "Repository is extremely sparse.",
          treatment: "Start building features.",
          time: "Ongoing"
        });
      }

      // Rule 2: Documentation
      if (!hasReadme) {
        score -= 35;
        summary = "Patient is undocumented and anonymous.";
        prescriptions.push({
          id: 'no-readme',
          severity: 'critical',
          title: 'Documentation Cardiac Arrest',
          diagnosis: "No README.md found. New developers will flatline.",
          treatment: "Inject a standard README.md immediately.",
          time: "10-minute procedure"
        });
      }

      // Rule 3: Security
      if (hasEnv) {
        score -= 40;
        prescriptions.push({
          id: 'env-leak',
          severity: 'critical',
          title: 'Security Hemorrhage',
          diagnosis: "A .env file is committed. Secrets are leaking.",
          treatment: "Remove .env, rotate keys, add to .gitignore.",
          time: "EMERGENCY SURGERY"
        });
      }

      // Rule 4: Hygiene
      if (!hasLockFile && fileCount > 10) {
        score -= 10;
        prescriptions.push({
          id: 'no-lock',
          severity: 'warning',
          title: 'Dependency Instability',
          diagnosis: "No lock file found.",
          treatment: "Run install to generate lockfile.",
          time: "2-minute fix"
        });
      }

      if (isTypeScript) {
        // Neutral/Good
      } else if (fileCount > 20) {
        prescriptions.push({
          id: 'type-safety',
          severity: 'info',
          title: 'Loose Typing Detected',
          diagnosis: "Pure JavaScript in a growing project.",
          treatment: "Consider migration to TypeScript.",
          time: "Elective Surgery"
        });
      }

      score = Math.max(0, Math.min(100, score));

      let status = "Peak Performance";
      let color = "text-emerald-400";
      let bg = "bg-emerald-400";

      if (score < 50) {
        status = "Critical Condition";
        color = "text-rose-500";
        bg = "bg-rose-500";
      } else if (score < 80) {
        status = "Stable but Fragile";
        color = "text-amber-400";
        bg = "bg-amber-400";
      }

      if (prescriptions.length === 0) {
        prescriptions.push({
          id: 'clean',
          severity: 'info',
          title: 'Clean Bill of Health',
          diagnosis: "No obvious pathologies detected.",
          treatment: "Continue current regimen.",
          time: "N/A"
        });
        summary = "Patient is in excellent shape.";
      } else if (!summary) {
        summary = "Patient is showing signs of structural stress.";
      }

      const displayFiles = files.slice(0, 5).map(f => ({
        name: f.path.length > 30 ? '...'+f.path.slice(-25) : f.path,
        health: f.path.includes('.env') ? 'critical' : 'healthy',
        risk: f.path.includes('.env') ? 99 : Math.floor(Math.random() * 20)
      }));

      return {
        score,
        status,
        color,
        bg,
        summary,
        files: displayFiles,
        prescriptions
      };

    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // --- Handlers ---

  const startDiagnosis = (e) => {
    e.preventDefault();
    if (!repoUrl) return;
    setErrorMessage('');
    setScanLogIndex(0);
    setView('scanning');
  };

  useEffect(() => {
    let isMounted = true;
    const runScan = async () => {
      if (view !== 'scanning') return;
      const logInterval = setInterval(() => {
        setScanLogIndex((prev) => (prev < SCANNER_LOGS.length - 1 ? prev + 1 : prev));
      }, 600);
      try {
        const result = await analyzeRepo(repoUrl);
        setTimeout(() => {
          if (isMounted) {
            setDiagnosis(result);
            clearInterval(logInterval);
            setView('dashboard');
          }
        }, 2500);
      } catch (err) {
        setTimeout(() => {
          if (isMounted) {
            setErrorMessage(err.message);
            clearInterval(logInterval);
            setView('waiting');
          }
        }, 2000);
      }
    };
    runScan();
    return () => { isMounted = false; };
  }, [view, repoUrl]);

  useEffect(() => {
    if (view === 'dashboard' && diagnosis) {
      let start = 0;
      const end = diagnosis.score;
      if (end === 0) return;
      const timer = setInterval(() => {
        start += 1;
        setVibeScore(start);
        if (start >= end) clearInterval(timer);
      }, 20);
      return () => clearInterval(timer);
    }
  }, [view, diagnosis]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      
      {/* Background Ambient Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-20"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col">
        
        {/* Header */}
        <header className="flex justify-between items-center py-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setView('waiting')}>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 group-hover:border-emerald-500/50 transition-colors">
              <Activity className="w-5 h-5 text-emerald-400 group-hover:animate-pulse" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-200">
              Vibe<span className="text-emerald-400">Doctor</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API Connected
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col justify-center items-center w-full max-w-5xl mx-auto">
          
          {/* VIEW: WAITING ROOM */}
          {view === 'waiting' && (
            <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-emerald-400 mb-4">
                  <SparklesIcon className="w-3 h-3" />
                  <span>Real-time GitHub Analysis</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                  Is your code <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">healthy?</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-lg mx-auto">
                  Paste your public GitHub repository URL below. Our AI Chief Surgeon will diagnose technical debt, security leaks, and documentation failures.
                </p>
              </div>

              <form onSubmit={startDiagnosis} className="relative group max-w-lg mx-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>
                <div className="relative flex items-center bg-slate-900 rounded-xl p-1.5 border border-slate-800 shadow-2xl">
                  <div className="pl-4 text-slate-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="owner/repo (e.g. facebook/react)"
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 px-4 py-3 outline-none"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Diagnose <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
              
              {errorMessage && (
                 <div className="flex items-center justify-center gap-2 text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-900/50 animate-in slide-in-from-top-2">
                    <XCircle className="w-4 h-4" /> {errorMessage}
                 </div>
              )}

              <div className="pt-8 flex justify-center gap-8 text-slate-600 text-sm">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Public Repos Only
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Live Fetch
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SCANNER */}
          {view === 'scanning' && (
            <div className="w-full max-w-xl bg-black/50 border border-slate-800 rounded-lg p-8 font-mono relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
              
              <div className="space-y-4 relative z-30">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-emerald-500 font-bold tracking-widest uppercase">Analyzing {repoUrl}...</span>
                  </div>
                  <Cpu className="w-5 h-5 text-slate-500 animate-spin-slow" />
                </div>

                <div className="h-48 flex flex-col justify-end space-y-2">
                  {SCANNER_LOGS.map((log, index) => (
                    <div 
                      key={index} 
                      className={`transition-all duration-300 flex items-center gap-3 ${
                        index === scanLogIndex 
                          ? 'text-emerald-400 opacity-100 scale-105 origin-left' 
                          : index < scanLogIndex 
                            ? 'text-slate-600 opacity-40' 
                            : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <span className="text-xs opacity-50">[{new Date().toLocaleTimeString()}]</span>
                      {index < scanLogIndex && <CheckCircle className="w-3 h-3 text-emerald-500/50" />}
                      {index === scanLogIndex && <div className="w-3 h-3 border-2 border-t-transparent border-emerald-400 rounded-full animate-spin"></div>}
                      {log}
                    </div>
                  ))}
                </div>
                
                <div className="w-full bg-slate-900 h-1 mt-6 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${((scanLogIndex + 1) / SCANNER_LOGS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: DASHBOARD */}
          {view === 'dashboard' && diagnosis && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
              
              {/* Left Column */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Vibe Score Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-24 h-24 text-slate-400" />
                  </div>
                  <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" /> Overall Vitality
                  </h3>
                  
                  <div className="flex flex-col items-center justify-center py-4">
                     <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
                          <circle 
                            cx="80" cy="80" r="70" 
                            stroke="currentColor" 
                            strokeWidth="10" 
                            fill="transparent" 
                            strokeDasharray={440} 
                            strokeDashoffset={440 - (440 * vibeScore) / 100} 
                            className={`transition-all duration-1000 ease-out ${diagnosis.color}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-5xl font-bold ${diagnosis.color}`}>{vibeScore}</span>
                          <span className="text-xs text-slate-500 mt-1">/ 100</span>
                        </div>
                     </div>
                     <div className={`mt-4 px-4 py-1 rounded-full text-sm font-bold bg-opacity-10 border ${diagnosis.color.replace('text', 'border')} ${diagnosis.color.replace('text', 'bg')}`}>
                        {diagnosis.status}
                     </div>
                  </div>
                </div>

                {/* File Body Scan */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                   <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400" /> File Sample
                  </h3>
                  <div className="space-y-3">
                    {diagnosis.files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-800/50 transition-colors cursor-default group">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${file.health === 'healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : file.health === 'warning' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}></div>
                           <span className={`font-mono ${file.health === 'critical' ? 'text-rose-200' : 'text-slate-400'}`}>{file.name}</span>
                        </div>
                        <span className="text-xs text-slate-600 group-hover:text-slate-400">{file.risk}% Risk</span>
                      </div>
                    ))}
                    {diagnosis.files.length === 0 && <span className="text-slate-500 italic text-sm">No files accessible.</span>}
                  </div>
                </div>

              </div>

              {/* Right Column: Prescriptions */}
              <div className="lg:col-span-8">
                 <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <Stethoscope className="w-6 h-6 text-emerald-400" /> 
                          The Prescription
                        </h2>
                        <p className="text-slate-400 mt-1">{diagnosis.summary}</p>
                      </div>
                      <button 
                        onClick={() => setView('waiting')}
                        className="text-xs text-slate-500 hover:text-white transition-colors"
                      >
                        New Patient
                      </button>
                    </div>

                    <div className="space-y-4 flex-1">
                      {diagnosis.prescriptions.map((rx) => (
                        <div 
                          key={rx.id} 
                          className={`
                            relative border rounded-xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg
                            ${rx.severity === 'critical' ? 'bg-rose-950/10 border-rose-900/50 hover:border-rose-700/50' : 
                              rx.severity === 'warning' ? 'bg-amber-950/10 border-amber-900/50 hover:border-amber-700/50' : 
                              'bg-slate-800/20 border-slate-700/50 hover:border-emerald-700/30'}
                          `}
                        >
                          <div className="flex items-start justify-between">
                             <div className="flex gap-4">
                                <div className={`mt-1 p-2 rounded-lg ${
                                  rx.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 
                                  rx.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                   {rx.severity === 'critical' ? <AlertTriangle className="w-5 h-5" /> : 
                                    rx.severity === 'warning' ? <Thermometer className="w-5 h-5" /> : 
                                    <CheckCircle className="w-5 h-5" />}
                                </div>
                                <div>
                                   <h4 className={`font-bold text-lg ${
                                      rx.severity === 'critical' ? 'text-rose-200' : 'text-slate-200'
                                   }`}>
                                     {rx.title}
                                   </h4>
                                   <p className="text-slate-400 mt-1 text-sm leading-relaxed max-w-xl">
                                     <span className="text-slate-500 uppercase text-xs font-bold tracking-wider mr-2">Diagnosis:</span>
                                     {rx.diagnosis}
                                   </p>
                                   <p className="text-emerald-400/90 mt-2 text-sm leading-relaxed bg-emerald-950/30 p-2 rounded border border-emerald-900/30 inline-block">
                                     <span className="text-emerald-600 uppercase text-xs font-bold tracking-wider mr-2">Rx:</span>
                                     {rx.treatment}
                                   </p>
                                </div>
                             </div>
                             <div className="flex flex-col items-end gap-3 min-w-[120px]">
                                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                  {rx.time}
                                </span>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm gap-4">
                       <div className="flex flex-col">
                         <p>Chief Surgeon: Dr. Vibe AI, MD</p>
                         <p className="font-mono text-xs">Connected to GitHub API</p>
                       </div>
                       
                       {/* DONATE BUTTON */}
                       <a 
                         href="https://buymeacoffee.com" 
                         target="_blank" 
                         rel="noreferrer"
                         className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all text-xs uppercase tracking-wide group"
                       >
                         <Coffee className="w-4 h-4 group-hover:animate-bounce" />
                         Buy Dr. Vibe a Coffee
                       </a>
                    </div>
                 </div>
              </div>

            </div>
          )}

        </main>
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Icon helper since lucide-react might not have Sparkles in the version we're using
function SparklesIcon({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 5H5" />
      <path d="M19 19v4" />
      <path d="M15 21h4" />
    </svg>
  );
}
