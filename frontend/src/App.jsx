import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Users, 
  Sparkles,
  Search,
  ChevronRight,
  Loader2,
  Trash2,
  BrainCircuit,
  Award,
  Zap,
  LayoutGrid,
  FileCheck,
  History,
  CloudUpload,
  Globe,
  Stars,
  ShieldCheck,
  Cpu,
  MousePointer2,
  ExternalLink,
  Target,
  Trophy,
  Activity,
  Gem,
  X,
  BookOpen,
  Settings,
  Terminal,
  Layers,
  FileDown,
  Lock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
};

const parsePoint = (text) => {
  if (!text) return { title: '', description: '' };
  
  // Try colon first, then hyphen
  const separator = text.includes(':') ? ':' : (text.includes(' - ') ? ' - ' : null);
  
  if (separator) {
    const parts = text.split(separator);
    return {
      title: parts[0].trim(),
      description: parts.slice(1).join(separator).trim()
    };
  }
  
  const words = text.split(' ');
  if (words.length > 6) {
    const titleWords = words.slice(0, 3).join(' ');
    const descWords = words.slice(3).join(' ');
    return { title: titleWords, description: descWords };
  }
  
  return { title: 'Analysis', description: text };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showDocs, setShowDocs] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef(null);

  const loaderSteps = [
    "Harvesting Talent Data...",
    "Scanning Technical DNA...",
    "Aligning Experience Vectors...",
    "Benchmarking Skill Densities...",
    "Synthesizing Recruiter Rationale...",
    "Finalizing Performance Benchmarks..."
  ];

  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loaderSteps.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // High-performance hardware-accelerated cursor tracking
  const cursorRef = useRef(null);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    setResumes((prev) => [...prev, ...files]);
  };

  const removeResume = (index) => {
    setResumes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!jobDescription || resumes.length === 0) {
      setError('Provide requirements and upload talent files to proceed.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('job_description', jobDescription);
    resumes.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(response.data.results);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      const serverErrorMessage = err.response?.data?.detail;
      setError(serverErrorMessage || 'Analysis failed. Check your API credentials or backend.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = async () => {
    if (!results) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/export`, results);
      const csvContent = response.data.csv;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'TalentIQ_Analysis.csv');
      link.click();
    } catch (err) {
      console.error(err);
      setError('Export failed.');
    }
  };

  const downloadOriginal = (filename) => {
    const file = resumes.find(r => r.name === filename);
    if (!file) return;
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden selection:bg-purple-500/30 selection:text-white">
      <div className="fixed inset-0 -z-10 bg-[#020617] overflow-hidden">
        <div className="absolute top-0 -left-[10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-[10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[#020617]/50 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>
      </div>

      {/* Raw CSS Flashlight ORB */}
      <div 
        ref={cursorRef}
        style={{ 
          position: 'fixed',
          top: 0, 
          left: 0, 
          width: '600px', 
          height: '600px', 
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0) 70%)',
          filter: 'blur(40px)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)', 
          transition: 'left 0.1s linear, top 0.1s linear',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-9 h-9 bg-slate-900 rounded-[0.8rem] flex items-center justify-center border border-white/10 group-hover:border-purple-500/40 transition-all duration-500 shadow-2xl">
              <BrainCircuit className="w-4.5 h-4.5 text-purple-500" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">
              Talent<span className="text-purple-500">IQ</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-8">
            <button 
              onClick={() => setShowDocs(true)} 
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors"
            >
              Documentation
            </button>
            <div className="px-4 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 flex items-center gap-2 shadow-inner">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Engine Live</span>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showDocs && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDocs(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden glass-panel border border-white/10 rounded-[3rem] shadow-4xl flex flex-col"
            >
              <div className="p-8 md:p-12 border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-black tracking-tight">Technical Documentation</h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">v2.0 Stable Build</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDocs(false)}
                  className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors group"
                >
                  <X className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 space-y-16 text-left">
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Core Architecture</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-3xl bg-slate-950/40 border border-white/5 space-y-4">
                      <div className="text-lg font-bold text-white">Advanced Inference</div>
                      <p className="text-sm text-slate-500 leading-relaxed font-normal">
                        Utilizes Gemini 2.0 Flash and Mistral architectures to perform deep semantic parsing of resume assets against multi-vector job requirements.
                      </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-950/40 border border-white/5 space-y-4">
                      <div className="text-lg font-bold text-white">Scoring Heuristics</div>
                      <p className="text-sm text-slate-500 leading-relaxed font-normal">
                        Matches are calculated based on explicit skills, latent technical potential, and verified experience history. A 90%+ score indicates elite alignment.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-6 text-left">
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Workflow Sync</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { t: "Input Phase", d: "Paste raw job descriptions into the requirements engine. The system extracts core competencies, mandatory tech stacks, and soft-skill parameters." },
                      { t: "Pipeline Ingestion", d: "Upload up to 50 PDF resumes simultaneously. Our OCR handles complex formatting, columns, and skill-density maps." },
                      { t: "Analysis Cycle", d: "Each candidate iterates through an agentic screening loop, generating prioritized attributes, verified gaps, and final rationale." },
                      { t: "Data Export", d: "Single-click CSV generation for downstream integration with your existing ATS or CRM systems." }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-6 items-start group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/10 text-[10px] font-black text-emerald-500">0{i+1}</div>
                        <div className="space-y-1 text-left">
                          <div className="text-[15px] font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{step.t}</div>
                          <p className="text-sm text-slate-500 leading-relaxed font-normal">{step.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="p-10 rounded-3xl bg-purple-500/5 border border-purple-500/10 flex flex-col md:flex-row items-center gap-8 text-left">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0 shadow-2xl">
                    <Settings className="w-8 h-8 text-purple-400 animate-slow-spin" />
                  </div>
                  <div className="text-left space-y-2">
                    <h4 className="text-xl font-bold text-white tracking-tight">Ready to deploy?</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-normal">
                      For API access or custom LLM tuning, reach out to the TalentIQ core engineering team. This engine is optimized for high-volume technical screening.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6 text-center">
        <section className="min-h-screen flex flex-col items-center justify-center text-center space-y-12 select-none relative">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-950/80 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 shadow-2xl"
          >
            <Sparkles className="w-4 h-4" />
            Recruiter Intelligence v2.0
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-7xl lg:text-9xl font-black tracking-tight leading-[0.95] max-w-5xl mx-auto drop-shadow-2xl"
          >
            Smarter talent <br />
            <span className="text-shimmer">discovery.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="max-w-lg mx-auto text-slate-500 text-base md:text-lg font-medium leading-relaxed opacity-80"
          >
            Cut through the noise. Identify high-potential candidates with AI-driven technical screening.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center gap-3 text-slate-600 cursor-pointer mt-12 hover:text-slate-200 transition-colors"
            onClick={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Launch Interface</span>
            <div className="w-6 h-10 border-2 border-slate-800 rounded-full flex justify-center p-1.5">
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 bg-purple-500 rounded-full"
              />
            </div>
          </motion.div>
        </section>

        <div className="pt-32" id="input-section"> 
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="w-full glass-panel px-8 md:px-10 lg:px-12 pt-3 md:pt-4 pb-6 md:pb-8 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-4 mb-20 relative group overflow-hidden text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 ml-2 text-left">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Target Requirements</span>
                </div>
                <div className="relative group/field">
                  <textarea 
                    className="w-full h-40 md:h-44 bg-slate-950/60 border border-white/5 rounded-3xl p-6 text-slate-200 placeholder:text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all custom-scrollbar resize-none text-[14px] font-medium leading-[1.6] shadow-2xl"
                    placeholder="Paste your job description or key skill requirements here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Pipeline Upload</span>
                </div>
                
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="group flex flex-col items-center justify-center w-full h-40 md:h-44 rounded-3xl bg-slate-950/20 border-2 border-dashed border-white/5 hover:border-blue-500/30 transition-all cursor-pointer shadow-inner relative overflow-hidden text-center"
                >
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-700"></div>
                  <div className="flex flex-col items-center text-center p-4 relative z-10 transition-transform duration-500 group-hover:scale-105">
                    <CloudUpload className="w-10 h-10 text-slate-700 group-hover:text-blue-400 transition-all duration-500 mb-3" />
                    <p className="text-slate-300 font-bold text-base uppercase tracking-tight">Drop Talent Data</p>
                    <p className="text-slate-700 text-[8px] font-black mt-2 uppercase tracking-[0.3em]">PDF Assets Only • Multi-select</p>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" multiple accept=".pdf" onChange={handleFileChange} />
                </div>

                <AnimatePresence>
                  {resumes.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {resumes.map((file, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          key={i} 
                          className="flex items-center gap-2.5 bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black text-slate-500 shadow-xl"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-500/70" />
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <button onClick={(e) => { e.stopPropagation(); removeResume(i); }} className="hover:text-red-500 transition-colors ml-1 p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col items-center pt-4 border-t border-white/5">
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="relative group w-full md:w-72 h-14 bg-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black text-slate-950 transition-all active:scale-[0.97] disabled:opacity-50 overflow-hidden shadow-[0_20px_40px_-12px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-all duration-500"></div>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    Processing Pool...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Screen Candidates
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        <div className="w-full space-y-10 pb-16" id="results-section">
          <AnimatePresence mode="wait">
            {!results && isAnalyzing && (
              <motion.div 
                key="loader"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full min-h-[400px] flex flex-col items-center justify-center glass-panel rounded-[3.5rem] border border-white/5 relative overflow-hidden group py-20"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent"></div>
                
                <div className="relative mb-12">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-t-2 border-r-2 border-purple-500/20"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-b-2 border-l-2 border-blue-500/20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="w-12 h-12 text-purple-500 animate-pulse" />
                  </div>
                  
                  <motion.div 
                    animate={{ 
                      y: [0, 160, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute -top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.5)] z-20"
                  />
                </div>

                <div className="relative z-10 space-y-4 max-w-md mx-auto">
                  <AnimatePresence mode="wait">
                    <motion.h3 
                      key={loadingStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xl md:text-2xl font-black uppercase tracking-[0.25em] text-white"
                    >
                      {loaderSteps[loadingStep]}
                    </motion.h3>
                  </AnimatePresence>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                    Deploying Neural Screening Assets
                  </p>
                </div>
                
                <div className="mt-12 w-full max-w-xs h-1 px-4 bg-slate-950/40 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                  />
                </div>
              </motion.div>
            )}

            {!results && !isAnalyzing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="w-full h-80 flex flex-col items-center justify-center glass-panel rounded-[3.5rem] border border-white/5 text-center opacity-30 shadow-inner group"
              >
                <Activity className="w-12 h-12 text-slate-700 mb-6 group-hover:text-purple-500/50 transition-colors" />
                <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-2">Awaiting Stream</h3>
                <p className="text-slate-700 text-[10px] font-bold uppercase tracking-widest">Pipeline output will populate here</p>
              </motion.div>
            )}

            {results && (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/5 pb-8 px-4">
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-purple-500">Benchmark Report</span>
                    <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter">Engine Ranking.</h3>
                  </div>
                  <button 
                    onClick={handleExport}
                    className="px-6 py-2.5 bg-slate-900 border border-white/10 rounded-xl transition-all text-xs font-black flex items-center gap-2.5 group hover:bg-slate-800 shadow-2xl"
                  >
                    <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                    Export Full Insight
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-12">
                  {results.map((candidate, idx) => (
                    <CandidateCard key={idx} candidate={candidate} index={idx} onDownload={downloadOriginal} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-6 px-6 border-t border-white/5 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 opacity-40 grayscale-0 transition-opacity hover:opacity-100">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            <span className="font-black text-[10px] tracking-[0.4em] uppercase text-slate-500">TalentIQ 2026 Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CandidateCard({ candidate, index, onDownload }) {
  const isStrong = candidate.recommendation === 'Strong Fit';
  const isModerate = candidate.recommendation === 'Moderate Fit';
  
  const maxLines = Math.max(candidate.strengths.length, candidate.gaps.length);
  const pairedRows = [];
  for (let i = 0; i < maxLines; i++) {
    pairedRows.push({
      strength: candidate.strengths[i] || null,
      gap: candidate.gaps[i] || null
    });
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative"
    >
      <div className="absolute -left-4 md:-left-12 -top-4 text-[80px] font-black italic leading-none opacity-[0.03] select-none pointer-events-none">
        0{index + 1}
      </div>

      <div className="glass-panel p-6 md:p-10 rounded-[3rem] border border-white/5 shadow-3xl hover:border-purple-500/20 transition-all duration-700 group overflow-hidden">
        <div className={cn(
          "absolute top-0 right-0 w-80 h-80 blur-[80px] opacity-[0.02] -z-10",
          isStrong ? "bg-emerald-500" : isModerate ? "bg-yellow-500" : "bg-red-500"
        )}></div>

        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 border-b border-white/5 pb-8">
          <div className="flex items-center gap-6 md:gap-8 text-left">
            <div className={cn(
              "w-14 h-14 md:w-20 md:h-20 rounded-[1.2rem] md:rounded-[1.6rem] flex items-center justify-center text-2xl md:text-4xl font-black border transition-all duration-1000 shadow-2xl shrink-0 group-hover:scale-105 group-hover:rotate-1",
              isStrong && "bg-slate-950 border-emerald-500/30 text-emerald-500 shadow-emerald-500/10",
              isModerate && "bg-slate-950 border-yellow-400/30 text-yellow-400 shadow-yellow-500/10",
              !isStrong && !isModerate && "bg-slate-950 border-white/5 text-slate-800"
            )}>
              {index + 1}
            </div>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-4">
                <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-none group-hover:text-purple-400 transition-colors">
                  {toTitleCase(candidate.name)}
                </h4>
                <button 
                  onClick={() => onDownload(candidate.filename)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-2 hover:bg-slate-800 hover:border-blue-500/30 transition-all group/dl shadow-xl"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-500 group-hover/dl:text-blue-400 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover/dl:text-slate-200 transition-colors">Download Resume</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all duration-700",
                  isStrong && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                  isModerate && "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
                  !isStrong && !isModerate && "bg-red-500/10 text-red-500 border-white/5"
                )}>
                  {candidate.recommendation}
                </span>
                {isStrong && (
                  <div className="flex items-center gap-1.5 text-emerald-500/70 text-[8px] font-black uppercase tracking-widest">
                    <Trophy className="w-3 h-3" />
                    Top Match
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-[2rem] border border-white/5 min-w-[130px] shadow-2xl group-hover:border-purple-500/20 transition-all duration-700">
            <div className="text-4xl font-black tracking-tighter tabular-nums drop-shadow-2xl flex items-end">
              {candidate.score}
              <span className="text-purple-500 text-xl mb-1 ml-0.5 font-black">%</span>
            </div>
            <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 whitespace-nowrap">Match Score</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mt-8 pb-6">
          <div className="flex items-center gap-3 text-left">
            <div className="w-5 h-[1px] bg-emerald-500/50"></div>
            <h5 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em]">Elite Attributes</h5>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-left">
            <div className="w-5 h-[1px] bg-orange-500/50"></div>
            <h5 className="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em]">Identified Gaps</h5>
          </div>
        </div>

        <div className="space-y-6">
          {pairedRows.map((row, i) => {
            const sParsed = parsePoint(row.strength);
            const gParsed = parsePoint(row.gap);
            
            return (
              <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                <div className="flex items-start gap-4 group/item min-h-[40px]">
                  {row.strength ? (
                    <>
                      <div className="w-4.5 h-4.5 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 shadow-lg border border-emerald-500/10">
                        <Gem className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <div className="space-y-1 text-left">
                        <div className="text-[13px] font-semibold text-slate-100 tracking-tight leading-none">{sParsed.title}</div>
                        <div className="text-[14px] font-normal leading-relaxed text-slate-400">{sParsed.description}</div>
                      </div>
                    </>
                  ) : <div className="hidden lg:block"></div>}
                </div>

                <div className="flex items-start gap-4 group/item min-h-[40px] lg:border-l lg:border-white/5 lg:pl-8 lg:-ml-8">
                  {row.gap ? (
                    <>
                      <div className="w-4.5 h-4.5 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5 shadow-lg border border-orange-500/10">
                        <AlertCircle className="w-2.5 h-2.5 text-orange-400" />
                      </div>
                      <div className="space-y-1 text-left">
                        <div className="text-[13px] font-semibold text-slate-300 tracking-tight leading-none">{gParsed.title}</div>
                        <div className="text-[14px] font-normal leading-relaxed text-slate-500">{gParsed.description}</div>
                      </div>
                    </>
                  ) : <div className="hidden lg:block"></div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 relative">
          <ChevronRight className="absolute left-0 top-8 w-4 h-4 text-purple-500 opacity-20" />
          <div className="px-5 flex flex-col gap-2.5 text-left">
            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">Automated Rationale</div>
            <p className="text-[15px] md:text-[17px] text-slate-400 leading-relaxed font-normal italic group-hover:text-white transition-colors">
              "{candidate.reasoning}"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
