
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';
import { Settings } from '../types';

interface CssEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const CssEditorModal: React.FC<CssEditorModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [cssCode, setCssCode] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCssCode(settings.customCss || '');
    }
  }, [isOpen, settings.customCss]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsChange({ ...settings, customCss: cssCode });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
  const modalClasses = isGlass
    ? 'glass-card text-theme-darkest dark:text-theme-lightest'
    : 'bg-theme-lightest dark:bg-theme-darkest text-theme-darkest dark:text-theme-lightest border border-theme-mint/50 dark:border-theme-olive/50';
  
  const buttonClasses = isGlass
    ? 'bg-white/40 hover:bg-white/60 text-theme-darkest dark:text-theme-lightest'
    : 'bg-theme-olive text-theme-lightest hover:bg-opacity-80';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div 
        className={`rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col relative animate-fade-in-down ${modalClasses}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Tùy chỉnh CSS (CSS Editor)</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow p-4 relative">
            <textarea
                className="w-full h-full bg-slate-900 text-green-400 font-mono text-sm p-4 rounded-lg focus:outline-none resize-none"
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                placeholder="/* Nhập mã CSS tùy chỉnh của bạn ở đây... Ví dụ: body { background: red !important; } */"
                spellCheck="false"
            />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
                Hủy
            </button>
            <button 
                onClick={handleSave}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${buttonClasses}`}
            >
                {isSaved ? 'Đã Lưu!' : 'Lưu CSS'}
            </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CssEditorModal;
