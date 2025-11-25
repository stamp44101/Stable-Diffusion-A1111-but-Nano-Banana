import React, { useRef } from 'react';
import { GenerationSettings, AspectRatio, ImageSize } from '../types';
import { Settings2, Image as ImageIcon, Sparkles, Upload, X } from 'lucide-react';

interface SidebarProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  sourceImage: File | null;
  setSourceImage: (file: File | null) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  setSettings,
  sourceImage,
  setSourceImage,
  isGenerating,
  onGenerate
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSourceImage(e.target.files[0]);
    }
  };

  return (
    <div className="w-full md:w-96 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-orange-500 font-mono text-2xl">⚡</span>
          ProGen Studio
        </h1>
        <div className="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded bg-gray-800">
          v3.0 PRO
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Prompt Section */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Positive Prompt</label>
          <textarea
            className="w-full h-32 bg-gray-950 border border-gray-700 rounded-md p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none font-mono"
            placeholder="A futuristic city with flying cars, neon lights, cyberpunk style, highly detailed..."
            value={settings.prompt}
            onChange={(e) => handleChange('prompt', e.target.value)}
          />
        </div>

        {/* Negative Prompt */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Negative Prompt</label>
          <textarea
            className="w-full h-16 bg-gray-950 border border-gray-700 rounded-md p-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none font-mono"
            placeholder="blurry, low quality, bad anatomy, watermark..."
            value={settings.negativePrompt}
            onChange={(e) => handleChange('negativePrompt', e.target.value)}
          />
        </div>

        {/* Source Image (Img2Img) */}
        <div className="space-y-2">
           <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
             <span>Image Input (Optional)</span>
             {sourceImage && (
               <button onClick={() => setSourceImage(null)} className="text-red-400 hover:text-red-300 text-xs">Clear</button>
             )}
           </label>
           <div 
             className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${sourceImage ? 'border-orange-500 bg-gray-800' : 'border-gray-700 hover:border-gray-500 bg-gray-950'}`}
             onClick={() => !sourceImage && fileInputRef.current?.click()}
           >
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*"
               onChange={handleFileChange}
             />
             
             {sourceImage ? (
               <div className="relative group">
                 <img 
                   src={URL.createObjectURL(sourceImage)} 
                   alt="Source" 
                   className="w-full h-32 object-cover rounded" 
                 />
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-white text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Change Image</span>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-4 cursor-pointer">
                 <Upload className="w-8 h-8 text-gray-600 mb-2" />
                 <span className="text-xs text-gray-500">Click to upload source</span>
               </div>
             )}
           </div>
        </div>

        {/* Tabs / Settings Group */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-4 border border-gray-700">
          <div className="flex items-center gap-2 text-white border-b border-gray-700 pb-2 mb-2">
            <Settings2 className="w-4 h-4" />
            <span className="text-sm font-bold">Generation Config</span>
          </div>

          {/* Model Config Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Aspect Ratio</label>
              <select 
                className="w-full bg-gray-950 border border-gray-700 rounded p-1.5 text-xs text-white focus:border-orange-500 outline-none"
                value={settings.aspectRatio}
                onChange={(e) => handleChange('aspectRatio', e.target.value as AspectRatio)}
              >
                {Object.values(AspectRatio).map((ratio) => (
                  <option key={ratio} value={ratio}>{ratio}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Size</label>
              <select 
                className="w-full bg-gray-950 border border-gray-700 rounded p-1.5 text-xs text-white focus:border-orange-500 outline-none"
                value={settings.imageSize}
                onChange={(e) => handleChange('imageSize', e.target.value as ImageSize)}
              >
                {Object.values(ImageSize).map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">Batch Size</label>
                <span className="text-xs text-orange-400 font-mono">{settings.batchSize}</span>
              </div>
              <input 
                type="range" min="1" max="4" step="1"
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                value={settings.batchSize}
                onChange={(e) => handleChange('batchSize', parseInt(e.target.value))}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">Creativity (Temp)</label>
                <span className="text-xs text-orange-400 font-mono">{settings.creativity}</span>
              </div>
              <input 
                type="range" min="0" max="2" step="0.1"
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                value={settings.creativity}
                onChange={(e) => handleChange('creativity', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">Seed (-1 = Random)</label>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  className="flex-1 bg-gray-950 border border-gray-700 rounded p-1.5 text-xs text-white font-mono focus:border-orange-500 outline-none"
                  value={settings.seed}
                  onChange={(e) => handleChange('seed', parseInt(e.target.value))}
                />
                <button 
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                  onClick={() => handleChange('seed', -1)}
                  title="Randomize"
                >
                  🎲
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Output Config */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-4 border border-gray-700">
          <div className="flex items-center gap-2 text-white border-b border-gray-700 pb-2 mb-2">
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm font-bold">Output Settings</span>
          </div>
          
           <div>
              <label className="block text-xs text-gray-400 mb-1">Filename Prefix</label>
              <input 
                type="text"
                className="w-full bg-gray-950 border border-gray-700 rounded p-1.5 text-xs text-white font-mono focus:border-orange-500 outline-none"
                value={settings.filenamePrefix}
                onChange={(e) => handleChange('filenamePrefix', e.target.value)}
              />
           </div>
           
           <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">JPG Quality (Download)</label>
                <span className="text-xs text-orange-400 font-mono">{Math.round(settings.compressionQuality * 100)}%</span>
              </div>
              <input 
                type="range" min="0.1" max="1" step="0.05"
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                value={settings.compressionQuality}
                onChange={(e) => handleChange('compressionQuality', parseFloat(e.target.value))}
              />
            </div>
        </div>

      </div>

      <div className="p-4 bg-gray-900 border-t border-gray-800 sticky bottom-0 z-10">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !settings.prompt.trim()}
          className={`w-full py-4 rounded-md font-bold text-lg uppercase tracking-wider transition-all
            ${isGenerating 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-900/50'
            }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span> Generating...
            </span>
          ) : 'Generate'}
        </button>
      </div>
    </div>
  );
};