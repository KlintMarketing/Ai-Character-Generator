import React, { useState, useRef } from 'react';
import { generateCharacterImage, improvePrompt } from './services/geminiService';
import { GeneratedImage, CharacterRef, GenerationStatus } from './types';

// Modal Component for Prompt Improvement Confirmation
const PromptConfirmModal: React.FC<{ isOpen: boolean; onYes: () => void; onNo: () => void }> = ({ isOpen, onYes, onNo }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-xs w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2">
          <i className="fas fa-comment-dots text-xl"></i>
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-bold text-slate-100">Empty Prompt</h3>
          <p className="text-xs text-slate-400 leading-relaxed">You didn't provide a prompt. Do you want me to create something randomly for you?</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onNo}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            No, thanks
          </button>
          <button 
            onClick={onYes}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
          >
            Yes, please
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Component for Documentation
const DocumentationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <i className="fas fa-book-open text-indigo-400"></i>
            Forge Guide
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors focus:outline-none">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <section className="space-y-3">
            <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Getting Started</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Character Forge uses Gemini's advanced image-to-image capabilities to transform your characters.
            </p>
          </section>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <h4 className="font-bold text-slate-100 text-sm mb-1">Upload</h4>
              <p className="text-slate-400 text-xs">Provide a clear character image.</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <h4 className="font-bold text-slate-100 text-sm mb-1">Improve Prompt</h4>
              <p className="text-slate-400 text-xs">Use our AI tool to refine your text before forging.</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-800/50 text-center">
          <button onClick={onClose} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all">
            Start Forging
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Drawer
const SettingsDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const handleOpenSelectKey = async () => {
    const win = window as any;
    if (win.aistudio && typeof win.aistudio.openSelectKey === 'function') {
      await win.aistudio.openSelectKey();
    } else {
      alert("Please use the .env configuration for local builds.");
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-900 border-l border-slate-700/50 z-[101] shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold">Account Settings</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><i className="fas fa-times text-xl"></i></button>
          </div>
          <div className="p-6 space-y-8">
            <section className="space-y-4">
              <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">G</div>
                  <div>
                    <h4 className="text-sm font-bold">Google Integration</h4>
                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">Authorized via AI Studio</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Log in to link your own Google Cloud projects and use your personal Gemini credits.</p>
                <button onClick={handleOpenSelectKey} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                  <i className="fab fa-google"></i> Login with Google
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

// Modal Component for Full Screen View
const FullScreenModal: React.FC<{ image: GeneratedImage | null; onClose: () => void; onEdit: (img: GeneratedImage) => void }> = ({ image, onClose, onEdit }) => {
  if (!image) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-4 animate-in zoom-in duration-300">
      <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white"><i className="fas fa-times text-3xl"></i></button>
      <div className="max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6">
        <img src={image.url} alt={image.prompt} className="max-h-[80vh] rounded-2xl shadow-2xl object-contain border border-white/10" />
        <div className="w-full max-w-2xl text-center space-y-4">
          <p className="text-white text-lg font-medium italic">"{image.prompt}"</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => onEdit(image)} className="px-6 py-3 bg-white text-black rounded-xl font-bold flex items-center gap-2"><i className="fas fa-magic"></i> Use as Reference</button>
            <a href={image.url} download={`forge-${image.id}.png`} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2"><i className="fas fa-download"></i> Download</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [reference, setReference] = useState<CharacterRef | null>(null);
  const [isHighQuality, setIsHighQuality] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReference({ data: (event.target?.result as string).split(',')[1], mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const onImproveClick = () => {
    if (!prompt.trim()) {
      setIsConfirmModalOpen(true);
    } else {
      performImprovement();
    }
  };

  const performImprovement = async () => {
    setIsConfirmModalOpen(false);
    setIsImproving(true);
    try {
      const improvedText = await improvePrompt(prompt);
      setPrompt(improvedText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsImproving(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt || !reference) return;
    if (isHighQuality) {
      const win = window as any;
      if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey && win.aistudio.openSelectKey) {
          await win.aistudio.openSelectKey();
        }
      }
    }

    setStatus(GenerationStatus.LOADING);
    try {
      const imageUrl = await generateCharacterImage(prompt, reference, isHighQuality);
      const newImage: GeneratedImage = { id: Math.random().toString(36).substr(2, 9), url: imageUrl, prompt, timestamp: Date.now() };
      setHistory([newImage, ...history]);
      setStatus(GenerationStatus.SUCCESS);
    } catch (error: any) {
      setStatus(GenerationStatus.ERROR);
      if (error.message?.includes("Requested entity was not found.")) {
        const win = window as any;
        if (win.aistudio?.openSelectKey) await win.aistudio.openSelectKey();
      }
    }
  };

  const handleEdit = (img: GeneratedImage) => {
    setReference({ data: img.url.split(',')[1], mimeType: 'image/png' });
    setPrompt(img.prompt);
    setSelectedImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20"><i className="fas fa-hammer text-white text-xl"></i></div>
          <div>
            <h1 className="font-black text-lg tracking-tight">CHARACTER FORGE</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Meme Labs AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDocsOpen(true)} className="p-3 text-slate-400 hover:text-white transition-colors"><i className="fas fa-question-circle text-lg"></i></button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-3 text-slate-400 hover:text-white transition-colors"><i className="fas fa-sliders-h text-lg"></i></button>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 max-w-6xl mx-auto space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className={`group relative aspect-square rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center bg-slate-900/50 cursor-pointer ${reference ? 'border-indigo-500/50' : 'border-slate-800'}`} onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              {reference ? (
                <img src={`data:${reference.mimeType};base64,${reference.data}`} alt="Ref" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4"><i className="fas fa-cloud-upload-alt text-slate-400 text-2xl"></i></div>
                  <h3 className="text-slate-200 font-bold">Upload Source</h3>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
              <span className="text-sm font-bold">Pro Forge Mode</span>
              <button onClick={() => setIsHighQuality(!isHighQuality)} className={`w-12 h-6 rounded-full transition-colors relative ${isHighQuality ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHighQuality ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Transformation Prompt</label>
                <button 
                  onClick={onImproveClick} 
                  disabled={isImproving}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-400/10 px-3 py-1.5 rounded-full border border-indigo-400/20"
                >
                  <i className={`fas ${isImproving ? 'fa-circle-notch fa-spin' : 'fa-sparkles'}`}></i>
                  {isImproving ? 'Refining...' : 'Improve My Prompt'}
                </button>
              </div>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the new scene... (e.g., 'In a rainy cyberpunk city...')"
                className="w-full h-48 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
              />
            </div>

            <button onClick={handleGenerate} disabled={!prompt || !reference || status === GenerationStatus.LOADING} className={`w-full py-6 rounded-2xl font-black text-lg transition-all ${!prompt || !reference || status === GenerationStatus.LOADING ? 'bg-slate-800 text-slate-600 opacity-50' : 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20'}`}>
              {status === GenerationStatus.LOADING ? 'FORGING...' : 'IGNITE FORGE'}
            </button>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-black tracking-tight">FORGED HISTORY</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {history.map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 cursor-pointer border border-slate-800 hover:border-indigo-500/50 transition-all" onClick={() => setSelectedImage(img)}>
                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <PromptConfirmModal isOpen={isConfirmModalOpen} onYes={performImprovement} onNo={() => setIsConfirmModalOpen(false)} />
      <DocumentationModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <FullScreenModal image={selectedImage} onClose={() => setSelectedImage(null)} onEdit={handleEdit} />
    </div>
  );
};

export default App;
