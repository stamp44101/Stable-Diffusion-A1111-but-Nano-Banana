import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Gallery } from './components/Gallery';
import { GeneratedImage, GenerationSettings, AspectRatio, ImageSize } from './types';
import { generateImages } from './services/geminiService';

const App: React.FC = () => {
  // State for Settings
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '',
    negativePrompt: '',
    seed: -1,
    batchSize: 1,
    aspectRatio: AspectRatio.SQUARE,
    imageSize: ImageSize.Resolution1K,
    creativity: 1.0,
    filenamePrefix: 'progen-output',
    compressionQuality: 0.95
  });

  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  // Check API Key on Mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setApiKeySet(hasKey);
        } else {
          // Fallback or dev mode if injected script not present
          // We assume false until user interaction if method exists, else true (dev env without injection)
          // But strict guidance says we must use it.
          // If window.aistudio is undefined, we might be in a dev env without the wrapper.
          // We'll just assume false for safety if strict, but let's default to asking.
          setApiKeySet(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleConnect = async () => {
    try {
        if (window.aistudio && window.aistudio.openSelectKey) {
            await window.aistudio.openSelectKey();
            // Assume success as per instructions
            setApiKeySet(true);
        } else {
            alert("AI Studio environment not detected.");
        }
    } catch (e) {
        console.error("Failed to select key", e);
    }
  };

  const handleGenerate = async () => {
    if (!settings.prompt.trim()) return;

    setIsGenerating(true);
    try {
      const imageUrls = await generateImages(settings, sourceImage);
      
      const newImages: GeneratedImage[] = imageUrls.map(url => ({
        id: crypto.randomUUID(),
        url,
        settings: { ...settings }, // Snapshot of settings at generation time
        timestamp: Date.now()
      }));

      setGeneratedImages(prev => [...newImages, ...prev]);
    } catch (error) {
      console.error("Failed to generate", error);
      alert("Generation failed. Please check your settings or API key.");
      // If unauthorized, maybe reset key state?
       if (error instanceof Error && error.message.includes("403")) { // Rough check
           setApiKeySet(false);
       }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleUseAsInput = (img: GeneratedImage) => {
    // Fetch the blob from the data URL to create a File object
    fetch(img.url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "generated_input.png", { type: "image/png" });
        setSourceImage(file);
      });
  };

  if (checkingKey) {
      return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Initializing...</div>;
  }

  if (!apiKeySet) {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center shadow-2xl">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🔑</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">API Key Required</h2>
                <p className="text-gray-400 mb-8">
                    To use the Gemini 3 Pro Vision model, you need to connect your Google Cloud project with a valid API key.
                </p>
                <button 
                    onClick={handleConnect}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    Connect API Key
                </button>
                <div className="mt-6 text-xs text-gray-500">
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">
                        View Billing Documentation
                    </a>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar 
        settings={settings} 
        setSettings={setSettings}
        sourceImage={sourceImage}
        setSourceImage={setSourceImage}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
      />
      
      {/* Main Gallery Area */}
      <Gallery 
        images={generatedImages}
        onDelete={handleDelete}
        onUseAsInput={handleUseAsInput}
        quality={settings.compressionQuality}
      />
    </div>
  );
};

export default App;