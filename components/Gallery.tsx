import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Download, Edit, Trash2, Maximize2, X } from 'lucide-react';

interface GalleryProps {
  images: GeneratedImage[];
  onDelete: (id: string) => void;
  onUseAsInput: (image: GeneratedImage) => void;
  quality: number; // For download compression
}

export const Gallery: React.FC<GalleryProps> = ({ images, onDelete, onUseAsInput, quality }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleDownload = (img: GeneratedImage) => {
    // Basic download anchor
    const link = document.createElement('download-link');
    
    // To handle compression, we draw to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imageEl = new Image();
    imageEl.src = img.url;
    
    imageEl.onload = () => {
      canvas.width = imageEl.width;
      canvas.height = imageEl.height;
      ctx?.drawImage(imageEl, 0, 0);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      const a = document.createElement('a');
      a.href = compressedDataUrl;
      const timestamp = new Date(img.timestamp).toISOString().replace(/[:.]/g, '-');
      const prefix = img.settings.filenamePrefix || 'progen';
      a.download = `${prefix}-${timestamp}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  };

  if (images.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-950 h-full min-h-screen">
        <div className="w-24 h-24 border-2 border-gray-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl opacity-20">🎨</span>
        </div>
        <p className="text-lg">No images generated yet</p>
        <p className="text-sm opacity-50">Configure settings and click Generate</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-950 p-6 overflow-y-auto min-h-screen">
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
          {images.map((img) => (
            <div key={img.id} className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-800 transition-transform hover:scale-[1.02] duration-200">
               {/* Image Container */}
               <div className="aspect-square w-full overflow-hidden bg-gray-800 relative cursor-pointer" onClick={() => setSelectedImage(img)}>
                  <img src={img.url} alt="Generated" className="w-full h-full object-contain" />
               </div>
               
               {/* Metadata Footer */}
               <div className="p-3 border-t border-gray-800 bg-gray-900">
                  <p className="text-xs text-gray-400 truncate font-mono" title={img.settings.prompt}>
                    {img.settings.prompt}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                     <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                       {img.settings.imageSize} • {img.settings.aspectRatio}
                     </span>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => onUseAsInput(img)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                          title="Use as Input (Img2Img)"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDownload(img)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => onDelete(img.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ))}
       </div>

       {/* Lightbox Modal */}
       {selectedImage && (
         <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setSelectedImage(null)}>
           <div className="relative max-w-7xl max-h-full w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
             <img src={selectedImage.url} alt="Full view" className="max-h-[85vh] object-contain shadow-2xl rounded-sm border border-gray-800" />
             
             <button 
               onClick={() => setSelectedImage(null)}
               className="absolute -top-4 -right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 border border-gray-600"
             >
               <X className="w-6 h-6" />
             </button>

             <div className="mt-4 flex gap-4 bg-gray-900/80 p-4 rounded-full border border-gray-700 backdrop-blur">
                <button onClick={() => handleDownload(selectedImage)} className="flex items-center gap-2 text-sm text-white hover:text-orange-400 px-2">
                   <Download className="w-4 h-4" /> Download
                </button>
                <div className="w-px bg-gray-700 h-5 my-auto"></div>
                <button onClick={() => { onUseAsInput(selectedImage); setSelectedImage(null); }} className="flex items-center gap-2 text-sm text-white hover:text-orange-400 px-2">
                   <Edit className="w-4 h-4" /> Edit / Remix
                </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};