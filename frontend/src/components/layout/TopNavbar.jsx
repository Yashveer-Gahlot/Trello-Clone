import React, { useState } from 'react';
import { Trello, Share2, Filter, Search, User, MoreHorizontal, X, ChevronLeft, Copy, Image } from 'lucide-react';
import useBoardStore from '../../store/useBoardStore';

const gradientOptions = [
  'bg-gradient-to-br from-blue-600 to-indigo-900',
  'bg-gradient-to-br from-green-400 to-emerald-700',
  'bg-gradient-to-br from-orange-400 to-rose-600',
  'bg-gradient-to-br from-purple-500 to-pink-600',
  'bg-gradient-to-r from-cyan-400 to-blue-500',
  'bg-gradient-to-br from-gray-700 to-gray-900',
];

const imageOptions = [
  'https://images.unsplash.com/photo-1506744626753-1fa28f621b02?auto=format&fit=crop&w=1920&q=100', // Mountain
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=100', // Scenery
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=100', // Lake
  'https://images.unsplash.com/photo-1444464666168-49b19e88145e?auto=format&fit=crop&w=1920&q=100', // Sunrise
];

const TopNavbar = () => {
  const [copied, setCopied] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState('main'); // 'main' | 'background'

  const filterQuery = useBoardStore((state) => state.filterQuery);
  const filterType = useBoardStore((state) => state.filterType);
  const setFilterQuery = useBoardStore((state) => state.setFilterQuery);
  const setFilterType = useBoardStore((state) => state.setFilterType);
  const setBoardBackground = useBoardStore((state) => state.setBoardBackground);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="relative z-50 flex items-center justify-between px-4 py-3 bg-black/20 dark:bg-[#22272b] backdrop-blur-sm text-white dark:text-[#b6c2cf] transition-colors border-b border-transparent dark:border-[#384148]">
      {/* Left side - Branding */}
      <div className="flex items-center gap-2">
        <Trello size={22} className="text-blue-400" />
        <h1 className="text-xl font-bold tracking-wide">Trello</h1>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 md:gap-4">

        {/* FILTER WRAPPER - Must be a relative div, not a button */}
        <div className="relative">
          
          {/* TOGGLE BUTTON */}
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 rounded-[3px] px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors outline-none focus:outline-none focus:ring-0 ${
              filterQuery 
                ? 'bg-white/30 text-white dark:bg-[#a6c5e23d] dark:text-[#b6c2cf]' 
                : 'bg-white/20 hover:bg-white/30 text-white dark:bg-[#a6c5e229] dark:hover:bg-[#a6c5e23d] dark:text-[#b6c2cf]'
            }`}
          >
            <Filter size={16} />
            <span className="hidden md:inline">Filters</span>
          </button>

          {/* DROPDOWN MENU - Rendered OUTSIDE the toggle button! */}
          {isFilterOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full right-0 mt-2 w-[304px] bg-white dark:bg-[#282e33] rounded-[3px] shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25)] dark:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.6)] border border-transparent dark:border-[#384148] text-[#172b4d] dark:text-[#b6c2cf] p-3 z-50"
            >
              {/* HEADER & CLOSE BUTTON */}
              <div className="relative border-b border-[#091e4224] dark:border-[#384148] pb-2 mb-3">
                <h3 className="text-center text-sm font-semibold text-[#5e6c84] dark:text-[#9fadbc]">Filter</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#6b778c] dark:text-[#9fadbc] hover:bg-[#091e4214] dark:hover:bg-[#a6c5e229] dark:hover:text-[#b6c2cf] rounded-[3px] p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* TABS FOR LIST VS CARD */}
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-[#5e6c84] dark:text-[#9fadbc] uppercase tracking-wide mt-3 mb-1">Search Type</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType('card')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-[3px] transition-colors ${
                      filterType === 'card' 
                        ? 'bg-[#e4f0f6] text-[#0079bf] dark:bg-[#a6c5e229] dark:text-[#b6c2cf] font-semibold' 
                        : 'bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d] dark:bg-[#22272b] dark:hover:bg-[#2c333a] dark:text-[#b6c2cf]'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setFilterType('list')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-[3px] transition-colors ${
                      filterType === 'list' 
                        ? 'bg-[#e4f0f6] text-[#0079bf] dark:bg-[#a6c5e229] dark:text-[#b6c2cf] font-semibold' 
                        : 'bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d] dark:bg-[#22272b] dark:hover:bg-[#2c333a] dark:text-[#b6c2cf]'
                    }`}
                  >
                    Lists
                  </button>
                </div>
              </div>

              {/* SEARCH INPUT */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-[#5e6c84] dark:text-[#9fadbc] uppercase tracking-wide mt-3 mb-1">Keyword</h4>
                <input
                  type="text"
                  autoFocus
                  placeholder={`Search ${filterType}s...`}
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-[#fafbfc] dark:bg-[#22272b] focus:bg-white dark:focus:bg-[#22272b] border-2 border-[#dfe1e6] dark:border-[#738496] focus:border-[#0079bf] dark:focus:border-[#579dff] rounded-[3px] outline-none px-2 py-1 text-sm text-[#172b4d] dark:text-[#b6c2cf] placeholder-[#5e6c84] dark:placeholder-[#9fadbc] transition-colors"
                />
              </div>

              {/* Clear All */}
              <button
                onClick={() => { setFilterQuery(''); setIsFilterOpen(false); }}
                className={`w-full py-1.5 text-sm font-medium rounded-[3px] transition-colors ${
                  filterQuery 
                    ? 'hover:bg-[#091e4214] dark:hover:bg-[#a6c5e229] text-[#172b4d] dark:text-[#b6c2cf]' 
                    : 'text-[#a5adba] dark:text-[#596773] cursor-not-allowed'
                }`}
                disabled={!filterQuery}
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={handleShare}
          className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded transition-colors text-sm font-medium relative"
        >
          <Share2 size={16} />
          <span className="hidden md:inline">{copied ? 'Copied!' : 'Share'}</span>
        </button>
        <div className="h-4 w-[1px] bg-white/30 hidden md:block"></div>
        
        {/* THREE DOTS MENU WRAPPER */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-1.5 rounded-[3px] transition-colors ${
              isMenuOpen 
                ? 'bg-white/30 text-white dark:bg-[#a6c5e23d] dark:text-[#b6c2cf]' 
                : 'hover:bg-white/20 text-white dark:hover:bg-[#a6c5e229] dark:text-[#b6c2cf]'
            }`}
          >
            <MoreHorizontal size={20} />
          </button>

          {/* MENU POPOVER */}
          {isMenuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full right-0 mt-2 w-[304px] bg-white dark:bg-[#282e33] rounded-[3px] shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25)] dark:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.6)] border border-transparent dark:border-[#384148] text-[#172b4d] dark:text-[#b6c2cf] z-50 overflow-hidden flex flex-col"
            >
              {/* HEADER */}
              <div className="relative border-b border-[#091e4224] dark:border-[#384148] px-3 py-2">
                {menuView === 'background' && (
                  <button 
                    onClick={() => setMenuView('main')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-[#6b778c] dark:text-[#9fadbc] hover:bg-[#091e4214] dark:hover:bg-[#a6c5e229] dark:hover:text-[#b6c2cf] rounded-[3px] p-1 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                <h3 className="text-center text-sm font-semibold text-[#5e6c84] dark:text-[#9fadbc]">
                  {menuView === 'main' ? 'Menu' : 'Change background'}
                </h3>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b778c] dark:text-[#9fadbc] hover:bg-[#091e4214] dark:hover:bg-[#a6c5e229] dark:hover:text-[#b6c2cf] rounded-[3px] p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* CONTENT AREA */}
              <div className="p-3 max-h-[400px] overflow-y-auto">
                {menuView === 'main' ? (
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setMenuView('background')}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-[3px] hover:bg-[#091e4214] dark:hover:bg-[#a6c5e229] transition-colors"
                    >
                      <Image size={16} className="text-[#6b778c] dark:text-[#9fadbc]" />
                      Change background
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Gradients */}
                    <h4 className="text-xs font-semibold text-[#5e6c84] dark:text-[#9fadbc] uppercase tracking-wide mb-2">Colors</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {gradientOptions.map((grad, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setBoardBackground(grad); setIsMenuOpen(false); }}
                          className={`h-16 rounded-[3px] hover:opacity-80 transition-opacity ${grad}`}
                        />
                      ))}
                    </div>
                    {/* Photos */}
                    <h4 className="text-xs font-semibold text-[#5e6c84] dark:text-[#9fadbc] uppercase tracking-wide mb-2">Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {imageOptions.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setBoardBackground(imgUrl); setIsMenuOpen(false); }}
                          className="h-16 rounded-[3px] bg-cover bg-center hover:opacity-80 transition-opacity"
                          style={{ backgroundImage: `url(${imgUrl})` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 p-1.5 rounded-full transition-colors">
          <User size={18} className="text-white" />
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;
