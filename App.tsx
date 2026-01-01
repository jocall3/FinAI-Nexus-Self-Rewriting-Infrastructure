
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from './components/Layout';
import { Goal, AIProcessTask, CodeFile, CodeChange, Metric, LogEntry, TokenAsset, TokenAccount, DigitalIdentity, AuditLogEntry, AgentEntity } from './types';
import { generateIntelligentFix, analyzeMetrics } from './services/geminiService';

// --- Initial Constants ---
const INITIAL_FILES: CodeFile[] = [
  { id: 'f1', path: 'src/settlement/engine.ts', name: 'engine.ts', version: 1, lastModified: new Date().toISOString(), language: 'typescript', content: `export const processSettlement = (amount: number, rail: string) => { console.log("Settling " + amount + " via " + rail); return true; };` },
  { id: 'f2', path: 'src/governance/compliance.ts', name: 'compliance.ts', version: 1, lastModified: new Date().toISOString(), language: 'typescript', content: `export const checkAML = (tx: any) => tx.amount < 10000;` }
];

const INITIAL_METRICS: Metric[] = [
  { id: 'm1', name: 'Settlement Latency', value: 42, unit: 'ms', category: 'PERFORMANCE', timestamp: new Date().toISOString() },
  { id: 'm2', name: 'Trust Score', value: 98, unit: '%', category: 'SECURITY', timestamp: new Date().toISOString() },
  { id: 'm3', name: 'Total Supply USD_C', value: 1250000, unit: 'tokens', category: 'COST', timestamp: new Date().toISOString() }
];

const INITIAL_AGENTS: AgentEntity[] = [
  { id: 'a1', name: 'Nexus-Core', role: 'ORCHESTRATOR', status: 'IDLE', healthScore: 100 },
  { id: 'a2', name: 'Cyber-Guard', role: 'SECURITY', status: 'IDLE', healthScore: 94 }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<AIProcessTask[]>([]);
  const [files, setFiles] = useState<CodeFile[]>(INITIAL_FILES);
  const [codeChanges, setCodeChanges] = useState<CodeChange[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState("System standby.");

  // --- Logic ---

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO', source = 'System') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      message,
      level,
      source
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  }, []);

  const handleCreateGoal = async (text: string) => {
    if (!text) return;
    setIsProcessing(true);
    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dependencies: [],
      category: 'FEATURE',
      progressPercentage: 10,
      lastUpdated: new Date().toISOString()
    };
    setGoals(prev => [newGoal, ...prev]);
    addLog(`Strategic goal defined: ${text}`, 'INFO', 'Orchestrator');

    // Simulate AI Agent taking the task
    const taskId = Math.random().toString(36).substr(2, 9);
    const newTask: AIProcessTask = {
      id: taskId,
      goalId: newGoal.id,
      description: `Analyzing architectural implications for "${text}"`,
      type: 'CODE_GEN',
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      logs: [],
      agentId: 'a1'
    };
    setTasks(prev => [newTask, ...prev]);

    // Use Gemini to suggest a code change
    const targetFile = files[0];
    const suggestion = await generateIntelligentFix(text, targetFile.content, targetFile.name);

    if (suggestion) {
      const changeId = Math.random().toString(36).substr(2, 9);
      const newChange: CodeChange = {
        id: changeId,
        taskId,
        fileId: targetFile.id,
        filePath: targetFile.path,
        diff: `@@ -1 +1 @@\n-${targetFile.content}\n+${suggestion}`,
        newContent: suggestion,
        timestamp: new Date().toISOString(),
        status: 'PENDING_REVIEW'
      };
      setCodeChanges(prev => [newChange, ...prev]);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() } : t));
      setGoals(prev => prev.map(g => g.id === newGoal.id ? { ...g, status: 'REVIEW_NEEDED', progressPercentage: 60 } : g));
      addLog(`AI Agent generated a code proposal for "${text}"`, 'AUDIT', 'Nexus-Core');
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'FAILED' } : t));
      setGoals(prev => prev.map(g => g.id === newGoal.id ? { ...g, status: 'BLOCKED' } : g));
      addLog(`AI Agent failed to reconcile code for "${text}"`, 'ERROR', 'Nexus-Core');
    }
    setIsProcessing(false);
  };

  const approveChange = useCallback((changeId: string) => {
    const change = codeChanges.find(c => c.id === changeId);
    if (!change) return;

    setFiles(prev => prev.map(f => f.id === change.fileId ? { ...f, content: change.newContent, version: f.version + 1, lastModified: new Date().toISOString() } : f));
    setCodeChanges(prev => prev.map(c => c.id === changeId ? { ...c, status: 'APPROVED' } : c));
    setGoals(prev => prev.map(g => {
        const t = tasks.find(task => task.id === change.taskId);
        return g.id === t?.goalId ? { ...g, status: 'PASSING', progressPercentage: 100 } : g;
    }));
    addLog(`Code change ${changeId} approved and committed to main-net.`, 'AUDIT', 'Governance');
  }, [codeChanges, tasks]);

  // Periodic metric fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => ({
        ...m,
        value: Math.max(0, m.value + (Math.random() - 0.5) * 2),
        timestamp: new Date().toISOString()
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Gemini Summary
  useEffect(() => {
    const fetchSummary = async () => {
      const summaryText = await analyzeMetrics(JSON.stringify(metrics));
      setSummary(summaryText);
    };
    fetchSummary();
  }, [metrics.length]); // Simple trigger

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} isProcessing={isProcessing}>
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-700">
          {/* Hero / Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <i className="fas fa-brain text-8xl text-cyan-400"></i>
               </div>
               <h3 className="text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4">Neural Synthesis</h3>
               <h1 className="text-3xl font-bold mb-6 max-w-xl text-white">System Self-Rewriting Orchestration Hub</h1>
               <p className="text-slate-400 leading-relaxed mb-8 max-w-2xl">
                 {summary}
               </p>
               <div className="flex gap-4">
                 <button 
                  onClick={() => handleCreateGoal("Optimize settlement engine for 50ms latency")}
                  className="px-6 py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
                 >
                   Initiate Evolution
                 </button>
                 <button className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all">
                   System Audit
                 </button>
               </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border-cyan-500/20">
               <div>
                  <h3 className="text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4">Operational Status</h3>
                  <div className="space-y-4">
                     {metrics.map(m => (
                        <div key={m.id} className="flex justify-between items-center">
                           <span className="text-slate-400 text-sm">{m.name}</span>
                           <span className="text-white font-mono font-bold">{m.value.toFixed(1)} {m.unit}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="mt-8 pt-6 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-green-400">
                     <i className="fas fa-check-circle"></i>
                     <span>Protocol Integrated & Verified</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Goals and Tasks Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h2 className="text-xl font-bold flex items-center gap-2">
                 <i className="fas fa-bullseye text-cyan-400"></i>
                 Active Strategic Goals
               </h2>
               <div className="space-y-4">
                  {goals.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-800 rounded-3xl text-center">
                      <p className="text-slate-500">No active evolutions scheduled.</p>
                    </div>
                  ) : goals.map(goal => (
                    <div key={goal.id} className="glass-panel p-6 rounded-2xl border-l-4 border-cyan-500">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg">{goal.text}</h3>
                        <span className={`px-2 py-1 text-[10px] rounded font-bold uppercase tracking-widest ${
                          goal.status === 'PASSING' ? 'bg-green-500/10 text-green-400' :
                          goal.status === 'IN_PROGRESS' ? 'bg-cyan-500/10 text-cyan-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-cyan-500" style={{ width: `${goal.progressPercentage}%` }}></div>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{goal.progressPercentage}%</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <h2 className="text-xl font-bold flex items-center gap-2">
                 <i className="fas fa-tasks text-cyan-400"></i>
                 Autonomous Task Stream
               </h2>
               <div className="glass-panel rounded-3xl overflow-hidden border-slate-800">
                  <div className="max-h-[400px] overflow-y-auto">
                     {tasks.map(task => (
                        <div key={task.id} className="p-4 border-b border-slate-800 hover:bg-slate-900/40 transition-colors flex gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-800 flex-shrink-0 flex items-center justify-center">
                              <i className={`fas ${task.status === 'COMPLETED' ? 'fa-check text-green-400' : 'fa-spinner fa-spin text-cyan-400'}`}></i>
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-white">{task.description}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-mono text-slate-500 uppercase">{task.type}</span>
                                <span className="text-[10px] text-slate-600">•</span>
                                <span className="text-[10px] text-slate-500">{new Date(task.startedAt!).toLocaleTimeString()}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-[700px]">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center">
               <h3 className="font-bold flex items-center gap-2">
                 <i className="fas fa-folder-open text-cyan-400"></i>
                 Project Explorer
               </h3>
               <span className="text-xs font-mono text-slate-500">v{files[0].version}.0.0</span>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {files.map(f => (
                  <div key={f.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all group cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <i className="fab fa-js-square text-yellow-500"></i>
                        <span className="text-sm font-medium">{f.path}</span>
                      </div>
                      <i className="fas fa-chevron-right text-[10px] text-slate-600 group-hover:text-cyan-400"></i>
                    </div>
                  </div>
                ))}
             </div>
             <div className="bg-slate-900 p-6 border-t border-slate-800 font-mono text-[11px] text-slate-300">
                <pre className="whitespace-pre-wrap">{files[0].content}</pre>
             </div>
          </div>

          <div className="space-y-6 flex flex-col h-[700px]">
             <h2 className="text-xl font-bold flex items-center gap-2">
               <i className="fas fa-code-pull-request text-cyan-400"></i>
               Pending Code Revisions
             </h2>
             <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {codeChanges.filter(c => c.status === 'PENDING_REVIEW').map(change => (
                  <div key={change.id} className="glass-panel rounded-2xl p-6 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                            <i className="fas fa-robot text-cyan-400 text-xs"></i>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Agent Consensus Change</p>
                            <p className="text-[10px] text-slate-500">{new Date(change.timestamp).toLocaleString()}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => approveChange(change.id)}
                          className="px-3 py-1 bg-green-500 text-slate-950 font-bold rounded-lg text-xs"
                        >Approve</button>
                        <button className="px-3 py-1 bg-red-500/10 text-red-500 font-bold rounded-lg text-xs">Deny</button>
                      </div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[10px] overflow-x-auto">
                       <pre className="text-slate-400">{change.diff}</pre>
                    </div>
                  </div>
                ))}
                {codeChanges.filter(c => c.status === 'PENDING_REVIEW').length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                     <i className="fas fa-clipboard-check text-4xl"></i>
                     <p>All changes reconciled. Codebase is healthy.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {['assets', 'governance', 'agents'].includes(activeTab) && (
        <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500 space-y-6">
           <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-800 shadow-2xl">
              <i className="fas fa-hard-hat text-4xl text-cyan-400"></i>
           </div>
           <div className="text-center">
             <h3 className="text-xl font-bold text-white mb-2">Protocol Expansion Underway</h3>
             <p className="max-w-md">Our AI agents are currently mapping these system modules. Real-time integration is expected in the next epoch cycle.</p>
           </div>
           <button 
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-sm transition-all"
           >
             Return to Synthesis
           </button>
        </div>
      )}

      {/* Floating Audit Log Toggle */}
      <div className="fixed bottom-8 right-8 z-50">
        <details className="group">
          <summary className="list-none cursor-pointer">
            <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/40 hover:scale-110 transition-transform active:scale-95">
              <i className="fas fa-terminal text-slate-950 text-xl group-open:hidden"></i>
              <i className="fas fa-times text-slate-950 text-xl hidden group-open:block"></i>
            </div>
          </summary>
          <div className="absolute bottom-16 right-0 w-96 glass-panel rounded-3xl p-6 shadow-2xl border-cyan-500/20 max-h-96 overflow-hidden flex flex-col">
            <h4 className="text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4 border-b border-slate-800 pb-2">Central Audit Trail</h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
               {logs.map(log => (
                 <div key={log.id} className="text-[10px] font-mono leading-relaxed border-l border-slate-800 pl-3">
                    <div className="flex justify-between items-center mb-0.5">
                       <span className={`uppercase font-bold ${
                         log.level === 'ERROR' ? 'text-red-400' : 
                         log.level === 'WARN' ? 'text-yellow-400' :
                         log.level === 'AUDIT' ? 'text-purple-400' : 'text-slate-500'
                       }`}>[{log.level}]</span>
                       <span className="text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300"><span className="text-cyan-500/70">{log.source}:</span> {log.message}</p>
                 </div>
               ))}
            </div>
          </div>
        </details>
      </div>
    </Layout>
  );
};

export default App;
