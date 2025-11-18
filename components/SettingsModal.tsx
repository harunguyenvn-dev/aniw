import React from 'react';
import { CloseIcon, PositionTopIcon, PositionBottomIcon, PositionLeftIcon, PositionRightIcon } from './icons';
import { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const THEMES = [
    { name: 'Liquid Glass', id: 'liquid-glass', colors: ['#a0e9ff', '#89cff0', '#5f9ea0', '#1a2a6c', '#003366'] },
    { name: 'Glass UI', id: 'glass-ui', colors: ['#FFFFFF', '#ACD6FF', '#FF708C', '#8969FF', '#101222'] },
    { name: 'Unicorn', id: 'unicorn', colors: ['#ECFDFF', '#41F0D1', '#A8FFC8', '#008B8B', '#012A29'] },
    { name: 'Sky Glider', id: 'sky-glider', colors: ['#E6F3FF', '#62BDFF', '#A08FFF', '#3D10BD', '#0D033A'] },
    { name: 'Green Screen', id: 'green-screen', colors: ['#F4FFFC', '#91EAAF', '#C3E956', '#4D7111', '#1F4B2C'] },
    { name: 'Retro Magic', id: 'retro-magic', colors: ['#FFF7AD', '#FFB3AE', '#FF49C1', '#6A1452', '#44113E'] },
    { name: 'Coral Wave', id: 'coral-wave', colors: ['#FCEDD8', '#FFD464', '#FF5E5E', '#E23C64', '#B0183D'] },
    { name: 'Deep Space', id: 'deep-space', colors: ['#BB63FF', '#5B58EB', '#56E1E9', '#112C71', '#0A2353'] },
    { name: 'Jade Horizon', id: 'jade-horizon', colors: ['#E6F5E7', '#B7E5BA', '#5CA87C', '#288760', '#1A5140'] },
    { name: 'Sunny Attitude', id: 'sunny-attitude', colors: ['#FEEAF0', '#F0D0C7', '#F09410', '#BC430D', '#241705'] },
    { name: 'Misty Forest', id: 'misty-forest', colors: ['#F2E0DF', '#BDCDCF', '#E3B8B8', '#034C36', '#003332'] },
    { name: 'Cyber Glow', id: 'cyber-glow', colors: ['#FFE5F1', '#87F5F5', '#F042FF', '#7226FF', '#160078'] },
    { name: 'Oceanic Blue', id: 'oceanic-blue', colors: ['#D6E8EE', '#97CADB', '#018ABE', '#02457A', '#001B48'] },
];

const POSITIONS: {id: 'top' | 'bottom' | 'left' | 'right', name: string, icon: React.FC<{className?: string}>}[] = [
    { id: 'top', name: 'Trên', icon: PositionTopIcon },
    { id: 'bottom', name: 'Dưới', icon: PositionBottomIcon },
    { id: 'left', name: 'Trái', icon: PositionLeftIcon },
    { id: 'right', name: 'Phải', icon: PositionRightIcon },
];

const FONTS = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Open Sans', value: '"Open Sans", sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Nunito', value: 'Nunito, sans-serif' },
    { name: 'Source Code Pro', value: '"Source Code Pro", monospace' },
    { name: 'Playfair Display', value: '"Playfair Display", serif' },
    { name: 'Merriweather', value: 'Merriweather, serif' },
];

const ToggleSwitch: React.FC<ToggleProps> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700/50 last:border-b-0">
    <div>
      <h4 className="font-semibold text-slate-800 dark:text-slate-200">{label}</h4>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`${
        checked ? 'bg-theme-lime' : 'bg-slate-300 dark:bg-slate-600'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-theme-lime focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800`}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  const handleToggle = (key: keyof Settings) => (value: boolean) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleInputChange = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, [key]: e.target.value });
  };
  
  const handleColorModeToggle = (value: boolean) => {
     onSettingsChange({ ...settings, colorMode: value ? 'dark' : 'light' });
  };

  const handleThemeChange = (themeId: string) => {
    onSettingsChange({ ...settings, theme: themeId });
  };

  const handleCustomColorChange = (colorName: keyof NonNullable<Settings['customThemeColors']>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      theme: 'custom',
      customThemeColors: {
        ...(settings.customThemeColors || defaultCustomColors),
        [colorName]: e.target.value,
      },
    });
  };
  
  const modalClasses = ['glass-ui', 'liquid-glass'].includes(settings.theme)
    ? 'glass-card' 
    : 'bg-theme-lightest dark:bg-[#1A3822] text-theme-darkest dark:text-theme-lightest';

  const defaultCustomColors = {
      lightest: '#ECFDFF',
      mint: '#41F0D1',
      lime: '#A8FFC8',
      olive: '#008B8B',
      darkest: '#012A29',
  };

  const customColors = settings.customThemeColors || defaultCustomColors;
  const hoverEffectClass = 'transition-transform transform hover:scale-105';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div 
        className={`rounded-2xl shadow-2xl w-full max-w-lg relative animate-fade-in-down ${modalClasses}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          <CloseIcon className="w-7 h-7" />
        </button>

        <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Cài đặt</h2>

          <div className="flex flex-col">
            <div className="py-4 border-b border-slate-200 dark:border-slate-700/50">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Ảnh đại diện</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Dán một liên kết ảnh để thay đổi ảnh đại diện của bạn.</p>
                <input
                    type="text"
                    value={settings.avatarUrl}
                    onChange={handleInputChange('avatarUrl')}
                    placeholder="https://example.com/avatar.png"
                    className="w-full mt-3 bg-slate-200/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-theme-lime"
                />
            </div>
            <div className="py-4 border-b border-slate-200 dark:border-slate-700/50">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Nguồn Dữ Liệu Tùy Chỉnh</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Dán một liên kết đến tệp CSV của bạn. Tệp phải có các cột: <code className="text-xs bg-slate-200 dark:bg-slate-600 p-1 rounded">name</code>, <code className="text-xs bg-slate-200 dark:bg-slate-600 p-1 rounded">episodes</code>, <code className="text-xs bg-slate-200 dark:bg-slate-600 p-1 rounded">url</code>, <code className="text-xs bg-slate-200 dark:bg-slate-600 p-1 rounded">link</code>.</p>
                <div className="flex items-center gap-2 mt-3">
                    <input
                        type="text"
                        value={settings.customAnimeDataUrl}
                        onChange={handleInputChange('customAnimeDataUrl')}
                        placeholder="https://example.com/anime.csv"
                        className="w-full bg-slate-200/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-theme-lime"
                    />
                    <button 
                        onClick={() => onSettingsChange({ ...settings, customAnimeDataUrl: '' })} 
                        className="px-3 py-2 rounded-md text-sm font-semibold bg-slate-300/80 dark:bg-slate-600/80 hover:bg-slate-400/80 dark:hover:bg-slate-500/80"
                    >
                        Reset
                    </button>
                </div>
            </div>
            <ToggleSwitch
              label="Giao diện tối"
              description="Chuyển đổi giữa giao diện sáng và tối"
              checked={settings.colorMode === 'dark'}
              onChange={handleColorModeToggle}
            />
             <div className="py-4 border-b border-slate-200 dark:border-slate-700/50">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Chủ đề màu sắc</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Chọn bảng màu yêu thích của bạn</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                    {THEMES.map((theme) => (
                        <button 
                            key={theme.id} 
                            onClick={() => handleThemeChange(theme.id)}
                            className={`rounded-lg p-2 transition-all duration-200 ${settings.theme === theme.id ? 'ring-2 ring-offset-2 ring-offset-theme-lightest dark:ring-offset-theme-darkest ring-theme-lime' : (settings.enableHoverAnimation ? hoverEffectClass : '')}`}
                            aria-label={`Chọn chủ đề ${theme.name}`}
                        >
                            <div className="flex flex-col gap-1.5 items-center">
                                <div className="w-12 h-8 rounded-md overflow-hidden flex">
                                    {theme.colors.map(color => (
                                        <div key={color} style={{ backgroundColor: color }} className="w-1/5 h-full"></div>
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 text-center">{theme.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="py-4 border-b border-slate-200 dark:border-slate-700/50">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Màu sắc tùy chỉnh</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Tạo bảng màu của riêng bạn. Chọn màu sẽ tự động áp dụng chủ đề tùy chỉnh.</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4">
                    {(Object.keys(customColors) as Array<keyof typeof customColors>).map((colorName) => (
                        <div key={colorName} className="flex flex-col items-center gap-2">
                             <label htmlFor={`color-${colorName}`} className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{colorName}</label>
                            <div className="relative w-12 h-12 rounded-full border-2 border-slate-300 dark:border-slate-600 overflow-hidden">
                                <input
                                    type="color"
                                    id={`color-${colorName}`}
                                    value={customColors[colorName]}
                                    onChange={handleCustomColorChange(colorName)}
                                    className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] border-0 p-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="py-4 border-b border-slate-200 dark:border-slate-700/50">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Phông chữ</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Chọn phông chữ cho toàn bộ giao diện.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {FONTS.map(font => (
                        <button
                            key={font.name}
                            onClick={() => onSettingsChange({ ...settings, fontFamily: font.value })}
                            style={{ fontFamily: font.value }}
                            className={`w-full text-left p-3 text-base rounded-lg transition-all duration-200 ${
                                settings.fontFamily === font.value
                                    ? 'bg-theme-lime text-theme-darkest ring-2 ring-theme-lime/80'
                                    : `bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-700 ${settings.enableHoverAnimation ? hoverEffectClass : ''}`
                            }`}
                        >
                            {font.name}
                        </button>
                    ))}
                </div>
            </div>
            
            <ToggleSwitch
              label="Chữ đậm hơn"
              description="Tăng độ đậm của phông chữ để dễ đọc hơn"
              checked={settings.isTextBolder}
              onChange={handleToggle('isTextBolder')}
            />
             <ToggleSwitch
              label="Chữ nghiêng"
              description="Hiển thị văn bản ở dạng chữ nghiêng"
              checked={settings.isTextItalic}
              onChange={handleToggle('isTextItalic')}
            />

            <div className="py-4 border-b border-slate-200 dark:border-slate-700/50">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Vị trí thanh Menu</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Di chuyển thanh menu đến vị trí bạn muốn</p>
                <div className="grid grid-cols-4 gap-4 mt-4">
                    {POSITIONS.map((pos) => (
                        <button
                            key={pos.id}
                            onClick={() => onSettingsChange({ ...settings, headerPosition: pos.id })}
                            className={`rounded-lg p-3 flex flex-col items-center gap-2 transition-all duration-200 ${
                                settings.headerPosition === pos.id
                                    ? 'bg-theme-lime/20 ring-2 ring-theme-lime'
                                    : `bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-700 ${settings.enableHoverAnimation ? hoverEffectClass : ''}`
                            }`}
                            aria-label={`Vị trí ${pos.name}`}
                        >
                            <pos.icon className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{pos.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <ToggleSwitch
              label="Bố cục tùy chỉnh"
              description="Cho phép điều chỉnh kích thước các ô cửa sổ theo ý thích."
              checked={settings.resizablePanes}
              onChange={handleToggle('resizablePanes')}
            />
            <ToggleSwitch
              label="Hiệu ứng di chuột"
              description="Phóng to các icon và mục khi di chuột qua."
              checked={settings.enableHoverAnimation}
              onChange={handleToggle('enableHoverAnimation')}
            />
            <ToggleSwitch
              label="Bật nhạc nền"
              description="Phát nhạc nền trên một số trang."
              checked={settings.enableBackgroundMusic}
              onChange={handleToggle('enableBackgroundMusic')}
            />
             <ToggleSwitch
              label="Tắt PopUp Player"
              description="Xem video dạng toàn trang thay vì popup"
              checked={settings.disablePopupPlayer}
              onChange={handleToggle('disablePopupPlayer')}
            />
            <ToggleSwitch
              label="Chặn mở tab mới"
              description="Ngăn trình phát video mở các tab quảng cáo mới"
              checked={settings.blockNewTabs}
              onChange={handleToggle('blockNewTabs')}
            />
            <ToggleSwitch
              label="Bật Ghi chú"
              description="Hiển thị khu vực ghi chú cá nhân bên cạnh video"
              checked={settings.showNotes}
              onChange={handleToggle('showNotes')}
            />
            <ToggleSwitch
              label="Bật Lịch"
              description="Hiển thị lịch bên cạnh video"
              checked={settings.showCalendar}
              onChange={handleToggle('showCalendar')}
            />
            <ToggleSwitch
              label="Bật To-do List"
              description="Hiển thị danh sách công việc bên cạnh video"
              checked={settings.showTodoList}
              onChange={handleToggle('showTodoList')}
            />
             <ToggleSwitch
              label="Bật Bấm giờ"
              description="Hiển thị đồng hồ bấm giờ bên cạnh video"
              checked={settings.showStopwatch}
              onChange={handleToggle('showStopwatch')}
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SettingsModal;