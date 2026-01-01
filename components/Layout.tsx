
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isProcessing: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isProcessing }) => {
  const tabs = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Overview' },
    { id: 'code', icon: 'fa-code', label: 'Code & Review' },
    { id: 'assets', icon: 'fa-coins', label: 'Value Rails' },
    { id: 'governance', icon: 'fa-shield-halved', label: 'Governance' },
    { id: 'agents', icon: 'fa-robot', label: 'Agent Mesh' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <i className="fas fa-microchip text-slate-950 text-lg"></i>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FinAI <span className="text-cyan-400">Nexus</span></span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-slate-950' : 'text-cyan-500/60 group-hover:text-cyan-400'}`}></i>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-cyan-400 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                {isProcessing ? 'Agent Active' : 'Orchestrator Idle'}
              </span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-cyan-500 transition-all duration-500 ${isProcessing ? 'w-2/3' : 'w-full'}`}
              ></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none"></div>
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              Control Panel <i className="fas fa-chevron-right text-[10px] mx-1"></i> 
              <span className="text-slate-100">{tabs.find(t => t.id === activeTab)?.label}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] text-cyan-400 font-bold overflow-hidden">
                  <img src={`https://picsum.photos/seed/agent${i}/32/32`} alt="Agent" />
                </div>
              ))}
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <i className="fas fa-bell"></i>
            </button>
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <i className="fas fa-user text-xs"></i>
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
