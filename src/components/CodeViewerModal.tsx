import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidProjectFile } from '../data/androidProjectFiles';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  FolderTree, 
  Terminal, 
  ExternalLink,
  BookOpen,
  Smartphone,
  Server,
  Layers
} from 'lucide-react';

interface CodeViewerModalProps {
  onClose: () => void;
}

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidProjectFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = ANDROID_PROJECT_FILES.filter(f => {
    const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesSearch = f.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.path.split('/').pop() || 'code.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllBundle = () => {
    const bundleData = {
      project: "Call of Battle: Anime Edition",
      target: "Android Kotlin + Node.js WebSocket Server",
      generatedAt: new Date().toISOString(),
      files: ANDROID_PROJECT_FILES.map(f => ({
        path: f.path,
        category: f.category,
        description: f.description,
        content: f.content
      }))
    };

    const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'call-of-battle-anime-codebase.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6">
      <div className="bg-slate-900 border-2 border-cyan-500/50 w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden anime-box-glow">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                NATIVE ANDROID & SERVER CODEBASE HUB
              </h3>
              <p className="text-xs text-slate-400">
                Complete Kotlin Architecture • Authoritative Node.js Server • Signed APK Build Guide • Flame Cross-Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadAllBundle}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Full Project Bundle</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar File Explorer + Code Viewer */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* LEFT SIDEBAR: File Tree & Categories */}
          <div className="md:col-span-4 border-r border-slate-800 bg-slate-950/40 flex flex-col overflow-hidden">
            
            {/* Search Input */}
            <div className="p-3 border-b border-slate-800">
              <input
                type="text"
                placeholder="Search files (e.g. MainActivity, Server)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-cyan-400"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1 overflow-x-auto p-2 border-b border-slate-800 bg-slate-950 text-[10px] font-mono">
              {[
                { id: 'all', label: 'All Files' },
                { id: 'kotlin_core', label: 'Kotlin Core' },
                { id: 'kotlin_render', label: 'Renderer' },
                { id: 'kotlin_net', label: 'OkHttp Client' },
                { id: 'gradle', label: 'Gradle' },
                { id: 'server', label: 'Server' },
                { id: 'flame', label: 'Flame' },
                { id: 'guide', label: 'Guides' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                    categoryFilter === cat.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isSelected 
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200' 
                        : 'bg-slate-900/40 border-transparent text-slate-300 hover:bg-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold font-mono truncate">{file.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{file.path}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Code Editor & Viewer */}
          <div className="md:col-span-8 flex flex-col bg-slate-950 overflow-hidden">
            
            {/* File Info Bar */}
            <div className="p-3.5 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  {selectedFile.category.replace('_', ' ')}
                </span>
                <h4 className="text-sm font-bold text-white font-mono">{selectedFile.path}</h4>
                <p className="text-xs text-slate-400">{selectedFile.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Output Textarea / Viewer */}
            <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed select-text">
              <pre className="whitespace-pre overflow-x-auto selection:bg-cyan-500/30">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
