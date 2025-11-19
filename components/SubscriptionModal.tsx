
import React, { useState } from 'react';
import { CloseIcon, ClipboardIcon, ClipboardCheckIcon } from './icons';
import { Settings } from '../types';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
}

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);

  const modalClasses = isGlass
    ? 'glass-card text-theme-darkest dark:text-theme-lightest'
    : 'bg-theme-lightest dark:bg-theme-darkest text-theme-darkest dark:text-theme-lightest border border-theme-mint/50 dark:border-theme-olive/50';
  
  const innerCardClasses = isGlass
    ? 'bg-white/20 dark:bg-black/20'
    : 'bg-black/5 dark:bg-black/20';
    
  const buttonClasses = isGlass
    ? 'bg-white/40 hover:bg-white/60 text-theme-darkest dark:text-theme-lightest'
    : 'bg-theme-olive text-theme-lightest hover:bg-opacity-80';
    
  const titleColor = 'text-theme-darkest dark:text-theme-lightest';
  const subtitleColor = 'text-theme-darkest/80 dark:text-theme-lightest/80';
  const infoKeyColor = 'text-theme-darkest/70 dark:text-theme-lightest/70';
  const infoValueColor = 'text-theme-darkest dark:text-theme-lightest font-semibold';
  const copyIconColor = 'text-theme-olive dark:text-theme-lime';
  const closeIconColor = 'text-theme-darkest/60 dark:text-theme-lightest/60 hover:text-theme-darkest dark:hover:text-theme-lightest';
  
  const qrContainerBg = 'p-2 bg-white rounded-lg shadow-inner';
  const qrCodeColor = 'var(--theme-darkest)';
  const qrTextColor = isGlass ? 'text-theme-darkest dark:text-theme-lightest' : 'text-theme-darkest';


  const info = {
    'Người nhận': 'PHAM VAN HOANG',
    'Ngân hàng': 'VietinBank',
    'Số tài khoản': '107884722018',
    'Số tiền': '20000',
    'Nội dung': 'Payment',
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div 
        className={`rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in-down ${modalClasses} max-h-[90vh] overflow-y-auto`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={`absolute top-4 right-4 transition-colors z-50 ${closeIconColor}`}>
          <CloseIcon className="w-7 h-7" />
        </button>

        <div className="p-6 md:p-8">
          <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${titleColor}`}>Thông tin thanh toán</h2>
          <p className={`${subtitleColor} mb-6`}>Vui lòng quyên góp để ủng hộ nhà phát triển.</p>

          <div className="flex flex-col md:flex-row gap-6">
            <div className={`p-4 rounded-lg flex flex-col items-center justify-center space-y-2 flex-shrink-0 ${innerCardClasses}`}>
              <div className={qrContainerBg}>
                  <div 
                      className="w-28 h-28 md:w-36 md:h-36" 
                      style={{
                          backgroundColor: qrCodeColor,
                          maskImage: 'url(https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/img/qrcode.png)',
                          WebkitMaskImage: 'url(https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/img/qrcode.png)',
                          maskSize: 'contain',
                          WebkitMaskSize: 'contain',
                          maskRepeat: 'no-repeat',
                          WebkitMaskRepeat: 'no-repeat',
                          maskPosition: 'center',
                          WebkitMaskPosition: 'center',
                      }}
                  >
                  </div>
              </div>
              <p className={`text-sm font-semibold pt-2 ${qrTextColor}`}>Quét mã QR để thanh toán</p>
              <p className={`text-xs ${isGlass ? 'text-theme-darkest/70 dark:text-theme-lightest/70' : 'text-theme-darkest/70'}`}>Khuyến khích sử dụng</p>
            </div>
            
            <div className="flex-1">
              <div className={`p-4 rounded-lg h-full flex flex-col ${innerCardClasses}`}>
                <h3 className={`font-bold mb-3 text-lg ${titleColor}`}>Thông tin chuyển khoản:</h3>
                <div className="space-y-3">
                  {Object.entries(info).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className={infoKeyColor}>{key}:</span>
                      <div className="flex items-center gap-2">
                        <span className={`${infoValueColor} text-base`}>{value === '20000' ? '20.000' : value}</span>
                        <button onClick={() => copyToClipboard(value, key)} className={`${copyIconColor}/70 hover:opacity-100`}>
                          {copied === key ? <ClipboardCheckIcon className="w-4 h-4 text-theme-lime" /> : <ClipboardIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-lg text-sm ${innerCardClasses} ${subtitleColor}`}>
            <p>Vui lòng chuyển khoản đầy đủ thông tin không thêm hay bớt. Khuyến khích quét mã QR.</p>
            <p>Sau khi bạn quyên góp, xin chân thành cảm ơn sự ủng hộ của bạn. Nếu có vấn đề gì, nhấn vào <a href="#" className={`font-bold underline hover:opacity-80`}>đây</a> để liên hệ qua Fanpage.</p>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button onClick={onClose} className={`px-12 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${buttonClasses}`}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DonateModal;
