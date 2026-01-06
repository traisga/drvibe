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
  Cpu,
  XCircle,
  Coffee,
  Database,
  Key,
  Lock,
  ExternalLink,
  HelpCircle,
  Sparkles
} from 'lucide-react';

/**
 * --- AYARLAR (CONFIG) ---
 * V1.1 Sürümü - Buton Düzeltmesi
 */
const CONFIG = {
  // 1. Buy Me A Coffee Profil Linkin
  buyMeACoffeeUrl: "https://buymeacoffee.com/fyrat",

  // 2. GitHub Token Linki (Otomatik doldurma özellikli)
  githubTokenUrl: "https://github.com/settings/tokens/new?scopes=public_repo&description=VibeDoctor%20Access"
};

const SCANNER_LOGS = [
  "Connecting to GitHub Satellite...",
  "Handshaking with API...",
  "Fetching repository skeleton...",
  "Recursively parsing file tree...",
  "Analyzing dependency footprint...",
  "Scanning for security leaks (.env)...",
  "Calculating technical debt...",
  "Finalizing medical report..."
];

export default function VibeDoctor() {
  const [view, setView] = useState('waiting'); // waiting, scanning, dashboard, ratelimit
  const [repoUrl, setRepoUrl] = useState('');
  const [userToken, setUserToken] = useState('');
  const [scanLogIndex, setScanLogIndex] = useState(0);
  const [vibeScore, setVibeScore] = useState(0);
  const [diagnosis, setDiagnosis] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // --- Utility: Format Bytes ---
  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // --- Real Analysis Engine (Heuristic Only) ---
  const analyzeRepo = async (url, token = null) => {
    try {
      const headers = token ? { Authorization: `token ${token}` } : {};
      const cleanUrl = url.trim().replace('https://', '').replace('github.com/', '').replace(/\/$/, '');
      const parts = cleanUrl.split('/').filter(p => p);
      
      if (parts.length < 2) throw new Error("Invalid format. Use 'owner/repo'");
      const [owner, repo] = parts;

      // 1. Fetch Repo Metadata
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!repoRes.ok) {
        if (repoRes.status === 403) throw new Error("RATELIMIT"); 
        throw new Error("Repository not found (or private).");
      }
      const repoData = await repoRes.json();
      const defaultBranch = repoData.default_branch;

      // 2. Fetch File Tree
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
      if (treeRes.status === 403) throw new Error("RATELIMIT");
      const treeData = await treeRes.json();
      
      // 3. Heuristic Analysis
      const files = treeData.tree || [];
      const fileCount = files.length;
      
      const hasReadme = files.some(f => f.path.toLowerCase() === 'readme.md');
      const envFile = files.find(f => f.path.includes('.env') && !f.path.includes('example') && !f.path.includes('sample'));
      const hasNodeModules = files.some(f => f.path.includes('node_modules/'));
      const hasLockFile = files.some(f => f.path.includes('package-lock.json') || f.path.includes('yarn.lock') || f.path.includes('pnpm-lock.yaml'));
      const isTypeScript = files.some(f => f.path.endsWith('.ts') || f.path.endsWith('.tsx'));
      const hasTests = files.some(f => f.path.includes('.test.') || f.path.includes('.spec.') || f.path.startsWith('test/'));

      let score = 100;
      let prescriptions = [];
      let summary = "";

      // --- SCORING LOGIC ---
      if (fileCount > 1000) {
        score -= 20;
        prescriptions.push({
          id: 'bloat',
          severity: 'warning',
          title: 'Massive Complexity',
          diagnosis: `Detected ${fileCount}+ files. Project is heavy.`,
          treatment: "Consider monorepo tools or architectural split.",
          time: "Long-term"
        });
      } else if (fileCount < 5) {
        score -= 10;
        prescriptions.push({
          id: 'ghost',
          severity: 'info',
          title: 'Ghost Town',
          diagnosis: "Repository is extremely sparse.",
          treatment: "Needs more features/code.",
          time: "Ongoing"
        });
      }

      if (hasNodeModules) {
        score -= 30;
        prescriptions.push({
          id: 'modules-committed',
          severity: 'critical',
          title: 'The Forbidden Commit',
          diagnosis: "'node_modules' is committed to the repo. This is a sin.",
          treatment: "git rm -r --cached node_modules && echo 'node_modules' >> .gitignore",
          time: "IMMEDIATE"
        });
      }

      if (!hasReadme) {
        score -= 25;
        prescriptions.push({
          id: 'no-readme',
          severity: 'critical',
          title: 'Anonymous Code',
          diagnosis: "No README.md found.",
          treatment: "Add a README to explain what this is.",
          time: "15 min"
        });
      }

      if (envFile) {
        score -= 40;
        prescriptions.push({
          id: 'env-leak',
          severity: 'critical',
          title: 'Security Breach Detected',
          diagnosis: `Secrets leaked in ${envFile.path}.`,
          treatment: "Remove file, rotate ALL keys, use .env.example.",
          time: "EMERGENCY"
        });
      }

      if (!hasLockFile && (files.some(f => f.path === 'package.json'))) {
        score -= 10;
        prescriptions.push({
          id: 'no-lock',
          severity: 'warning',
          title: 'Unstable Dependencies',
          diagnosis: "No lockfile detected (npm/yarn/pnpm).",
          treatment: "Commit your lockfile to ensure deterministic builds.",
          time: "2 min"
        });
      }

      if (!hasTests && fileCount > 20) {
        score -= 5;
        prescriptions.push({
          id: 'no-tests',
          severity: 'info',
          title: 'Living Dangerously',
          diagnosis: "No obvious test files detected.",
          treatment: "Add Jest/Vitest and write basic unit tests.",
          time: "1 hour"
        });
      }

      if (!isTypeScript && fileCount > 30) {
         score -= 5;
         prescriptions.push({
            id: 'js-scale',
            severity: 'info',
            title: 'Type Safety Gap',
            diagnosis: "Large JavaScript codebase detected.",
            treatment: "Migrate to TypeScript for better maintainability.",
            time: "Elective"
         });
      }

      // --- FINAL SCORE CALC ---
      score = Math.max(0, Math.min(100, score));

      let status = "Healthy";
      let color = "text-emerald-400";
      
      if (score < 50) {
        status = "Critical";
        color = "text-rose-500";
        summary = "This repository needs immediate life support.";
      } else if (score < 80) {
        status = "Stable";
        color = "text-amber-400";
        summary = "Functional, but showing signs of fatigue.";
      } else {
        status = "Peak Form";
        summary = "Excellent code hygiene. Ready for production.";
      }

      // --- FILE ANALYSIS ---
      const sortedFiles = files
        .filter(f => f.type === 'blob')
        .sort((a, b) => (b.size || 0) - (a.size || 0));

      const displayFiles = sortedFiles.slice(0, 5).map(f => {
        let riskScore = 0;
        let healthStatus = 'healthy';
        const size = f.size || 0;
        
        if (f.path.includes('.env')) { riskScore = 100; healthStatus = 'critical'; }
        else if (f.path.includes('node_modules')) { riskScore = 90; healthStatus = 'critical'; }
        else if (size > 5 * 1024 * 1024) { riskScore = 80; healthStatus = 'warning'; } 
        else if (size > 1 * 1024 * 1024) { riskScore = 40; healthStatus = 'healthy'; } 
        else if (f.path.endsWith('.js') && !isTypeScript) { riskScore = 20; }
        else { riskScore = 5; }

        return {
          name: f.path.length > 35 ? '...'+f.path.slice(-30) : f.path,
          health: healthStatus,
          risk: riskScore,
          sizeStr: formatBytes(size)
        };
      });

      return {
        score,
        status,
        color,
        summary,
        files: displayFiles,
        prescriptions,
        meta: {
          fileCount,
          isTs: isTypeScript
        }
      };

    } catch (err) {
      throw err;
    }
  };

  // --- Handlers ---
  const startDiagnosis = (e) => {
    if (e) e.preventDefault();
    if (!repoUrl) return;
    setErrorMessage('');
    setScanLogIndex(0);
    setView('scanning');
  };

  const handleRetryWithToken = (e) => {
    e.preventDefault();
    startDiagnosis();
  };

  useEffect(() => {
    let isMounted = true;
    const runScan = async () => {
      if (view !== 'scanning') return;
      const logInterval = setInterval(() => { setScanLogIndex((prev) => (prev < SCANNER_LOGS.length - 1 ? prev + 1 : prev)); }, 500);
      try {
        const result = await analyzeRepo(repoUrl, userToken);
        setTimeout(() => { if (isMounted) { setDiagnosis(result); clearInterval(logInterval); setView('dashboard'); } }, 1000);
      } catch (err) {
        clearInterval(logInterval);
        if (err.message === "RATELIMIT") { if (isMounted) setView('ratelimit'); }
        else { setTimeout(() => { if (isMounted) { setErrorMessage(err.message); setView('waiting'); } }, 1500); }
      }
    };
    runScan();
    return () => { isMounted = false; };
  }, [view, repoUrl, userToken]);

  useEffect(() => {
    if (view === 'dashboard' && diagnosis) {
      let start = 0;
      const timer = setInterval(() => { start += 1; setVibeScore(start); if (start >= diagnosis.score) clearInterval(timer); }, 20);
      return () => clearInterval(timer);
    }
  }, [view, diagnosis]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col">
        
        {/* Header - Fixed to include BuyMeACoffee Button */}
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
             {/* HEADER BUTTON EKLEMESİ */}
             <a 
               href={CONFIG.buyMeACoffeeUrl} 
               target="_blank" 
               rel="noreferrer"
               className="hidden md:flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
             >
               <Coffee className="w-3.5 h-3.5" /> 
               <span>Buy me a coffee</span>
             </a>

             {userToken && <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded text-xs"><Key className="w-3 h-3" /> Pro Access</span>}
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col justify-center items-center w-full max-w-5xl mx-auto">
          
          {/* 1. WAITING ROOM */}
          {view === 'waiting' && (
            <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-emerald-400 mb-4">
                  <Sparkles className="w-3 h-3" /> <span>Powered by GitHub API</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                  Is your code <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">healthy?</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-lg mx-auto">
                  Paste your public GitHub repository URL below. Dr. Vibe will diagnose technical debt, security leaks, and bad practices.
                </p>
              </div>

              <form onSubmit={startDiagnosis} className="relative group max-w-lg mx-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-20 blur transition duration-500"></div>
                <div className="relative flex items-center bg-slate-900 rounded-xl p-1.5 border border-slate-800 shadow-2xl">
                  <div className="pl-4 text-slate-500"><Search className="w-5 h-5" /></div>
                  <input type="text" placeholder="owner/repo (e.g. facebook/react)" className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 px-4 py-3 outline-none" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2">
                    Diagnose <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
              {errorMessage && <div className="flex items-center justify-center gap-2 text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-900/50"><XCircle className="w-4 h-4" /> {errorMessage}</div>}
            </div>
          )}

          {/* 2. RATE LIMIT VIEW */}
          {view === 'ratelimit' && (
             <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-700 rounded-2xl p-0 backdrop-blur-xl animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden flex flex-col md:flex-row">
                <div className="p-8 md:w-1/2 space-y-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800">
                    <div className="w-14 h-14 bg-amber-950/30 rounded-full flex items-center justify-center border border-amber-500/20"><Lock className="w-7 h-7 text-amber-500" /></div>
                    <div><h2 className="text-xl font-bold text-white mb-2">Too Many Requests</h2><p className="text-slate-400 text-sm">GitHub allows anonymous users only 60 scans/hour. You've hit the limit!</p></div>
                </div>
                <div className="p-8 md:w-1/2 bg-slate-900/50 flex flex-col">
                   <h3 className="font-bold text-white flex items-center gap-2 mb-4"><HelpCircle className="w-4 h-4 text-emerald-400" /> Quick Fix Guide</h3>
                   <ol className="relative border-l border-slate-800 space-y-6 ml-2">
                      <li className="ml-6"><span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-slate-800 rounded-full ring-4 ring-slate-900 text-[10px] font-bold text-slate-400">1</span><h4 className="font-medium text-slate-200 text-sm">Get Token</h4><a href={CONFIG.githubTokenUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300">Open GitHub Settings <ExternalLink className="w-3 h-3" /></a></li>
                      <li className="ml-6"><span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-slate-800 rounded-full ring-4 ring-slate-900 text-[10px] font-bold text-slate-400">2</span><h4 className="font-medium text-slate-200 text-sm">Paste Here</h4><form onSubmit={handleRetryWithToken} className="mt-2"><input type="password" placeholder="ghp_..." className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white" value={userToken} onChange={(e) => setUserToken(e.target.value)} /><button type="submit" disabled={!userToken} className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold py-2 rounded">Resume</button></form></li>
                   </ol>
                </div>
             </div>
          )}

          {/* 3. SCANNER VIEW */}
          {view === 'scanning' && (
            <div className="w-full max-w-xl bg-black/50 border border-slate-800 rounded-lg p-8 font-mono relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
              <div className="space-y-4 relative z-30">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <span className="text-emerald-500 font-bold tracking-widest uppercase flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Dr. Vibe Analyzing...</span>
                  <Cpu className="w-5 h-5 text-slate-500 animate-spin-slow" />
                </div>
                <div className="h-48 flex flex-col justify-end space-y-2">
                  {SCANNER_LOGS.map((log, index) => (
                    <div key={index} className={`flex items-center gap-3 transition-all duration-300 ${index === scanLogIndex ? 'text-emerald-400 scale-105 origin-left' : index < scanLogIndex ? 'text-slate-600 opacity-40' : 'opacity-0'}`}>
                      {index < scanLogIndex ? <CheckCircle className="w-3 h-3 text-emerald-500/50" /> : index === scanLogIndex ? <div className="w-3 h-3 border-2 border-t-transparent border-emerald-400 rounded-full animate-spin"></div> : null}
                      {log}
                    </div>
                  ))}
                </div>
                <div className="w-full bg-slate-900 h-1 mt-6 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-300 ease-out" style={{ width: `${((scanLogIndex + 1) / SCANNER_LOGS.length) * 100}%` }}></div></div>
              </div>
            </div>
          )}

          {/* 4. DASHBOARD VIEW */}
          {view === 'dashboard' && diagnosis && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                  <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /> Overall Vitality</h3>
                  <div className="flex flex-col items-center justify-center py-4">
                     <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * vibeScore) / 100} className={`transition-all duration-1000 ease-out ${diagnosis.color}`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center"><span className={`text-5xl font-bold ${diagnosis.color}`}>{vibeScore}</span><span className="text-xs text-slate-500 mt-1">/ 100</span></div>
                     </div>
                     <div className={`mt-4 px-4 py-1 rounded-full text-sm font-bold bg-opacity-10 border ${diagnosis.color.replace('text', 'border')} ${diagnosis.color.replace('text', 'bg')}`}>{diagnosis.status}</div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                   <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-4 flex items-center gap-2"><FileCode className="w-4 h-4 text-blue-400" /> Heaviest Files</h3>
                   <div className="space-y-3">
                    {diagnosis.files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-800/50 transition-colors cursor-default">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${file.health === 'healthy' ? 'bg-emerald-500' : file.health === 'warning' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}></div>
                           <div className="flex flex-col"><span className={`font-mono leading-none ${file.health === 'critical' ? 'text-rose-200' : 'text-slate-300'}`}>{file.name}</span><span className="text-[10px] text-slate-600 font-mono">{file.sizeStr}</span></div>
                        </div>
                        <span className={`text-xs font-bold ${file.risk > 50 ? 'text-rose-400' : 'text-slate-600'}`}>{file.risk}% Risk</span>
                      </div>
                    ))}
                    {diagnosis.files.length === 0 && <span className="text-slate-500 italic text-sm">No significant files found.</span>}
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500">
                     <div className="flex items-center gap-2"><Database className="w-3 h-3" /> {diagnosis.meta.fileCount} Files</div>
                     <div className="flex items-center gap-2"><Cpu className="w-3 h-3" /> {diagnosis.meta.isTs ? 'TypeScript' : 'JavaScript'}</div>
                   </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                 <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <Stethoscope className="w-6 h-6 text-emerald-400" /> 
                          Heuristic Diagnosis
                        </h2>
                        <p className="text-slate-400 mt-1">{diagnosis.summary}</p>
                      </div>
                      <button onClick={() => setView('waiting')} className="text-xs text-slate-500 hover:text-white transition-colors border border-slate-700 rounded px-3 py-1">New Patient</button>
                    </div>

                    {diagnosis.prescriptions.length > 0 ? (
                      <div className="space-y-4 flex-1">
                        {diagnosis.prescriptions.map((rx, idx) => (
                          <div key={rx.id || idx} className={`relative border rounded-xl p-5 transition-all hover:scale-[1.01] hover:shadow-lg ${rx.severity === 'critical' ? 'bg-rose-950/10 border-rose-900/50' : rx.severity === 'warning' ? 'bg-amber-950/10 border-amber-900/50' : 'bg-slate-800/20 border-slate-700/50'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex gap-4">
                                  <div className={`mt-1 p-2 rounded-lg ${rx.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : rx.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {rx.severity === 'critical' ? <AlertTriangle className="w-5 h-5" /> : rx.severity === 'warning' ? <Thermometer className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <h4 className={`font-bold text-lg ${rx.severity === 'critical' ? 'text-rose-200' : 'text-slate-200'}`}>{rx.title}</h4>
                                    <p className="text-slate-400 mt-1 text-sm leading-relaxed max-w-xl">{rx.diagnosis}</p>
                                    <p className="text-emerald-400/90 mt-2 text-sm leading-relaxed bg-emerald-950/30 p-2 rounded border border-emerald-900/30 inline-block"><span className="text-emerald-600 uppercase text-xs font-bold tracking-wider mr-2">Rx:</span>{rx.treatment}</p>
                                  </div>
                              </div>
                              <div className="flex flex-col items-end gap-3 min-w-[100px] text-right">
                                  <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800 whitespace-nowrap">{rx.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500"><CheckCircle className="w-16 h-16 text-emerald-500/20 mb-4" /><p>No major issues found. Good job!</p></div>
                    )}
                    <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm gap-4">
                       <div className="flex flex-col"><p>Chief Surgeon: Dr. Vibe, MD</p><p className="font-mono text-xs">Analysis via GitHub REST API</p></div>
                       
                       {/* BUY ME A COFFEE BUTTON - Alt taraftaki (Büyük ve renkli) */}
                       <a href={CONFIG.buyMeACoffeeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all text-xs uppercase tracking-wide group"><Coffee className="w-4 h-4 group-hover:animate-bounce" /> Buy Dr. Vibe a Coffee</a>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <style>{`
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
