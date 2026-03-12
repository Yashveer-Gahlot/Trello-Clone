import React, { useState } from 'react';
import { Trello, Share2, Filter, Search, User, MoreHorizontal, X } from 'lucide-react';
import useBoardStore from '../../store/useBoardStore';

const TopNavbar = () => {
  const [copied, setCopied] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterQuery = useBoardStore((state) => state.filterQuery);
  const filterType = useBoardStore((state) => state.filterType);
  const setFilterQuery = useBoardStore((state) => state.setFilterQuery);
  const setFilterType = useBoardStore((state) => state.setFilterType);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="relative z-50 flex items-center justify-between px-4 py-3 bg-black/20 backdrop-blur-sm text-white">
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
            className={`flex items-center gap-2 rounded-[3px] px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors ${
              isFilterOpen || filterQuery 
                ? 'bg-white/30 text-white' 
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <Filter size={16} />
            <span className="hidden md:inline">Filters</span>
            {filterQuery && (
              <span className="bg-white/30 text-xs px-1.5 py-0.5 rounded-sm ml-1">1</span>
            )}
          </button>

          {/* DROPDOWN MENU - Rendered OUTSIDE the toggle button! */}
          {isFilterOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full right-0 mt-2 w-[304px] bg-white rounded-[3px] shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25)] text-[#172b4d] p-3 z-50"
            >
              {/* HEADER & CLOSE BUTTON */}
              <div className="relative border-b border-[#091e4224] pb-2 mb-3">
                <h3 className="text-center text-sm font-semibold text-[#5e6c84]">Filter</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#6b778c] hover:bg-[#091e4214] rounded-[3px] p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* TABS FOR LIST VS CARD */}
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-[#5e6c84] uppercase tracking-wide mt-3 mb-1">Search Type</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType('card')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-[3px] transition-colors ${
                      filterType === 'card' 
                        ? 'bg-[#e4f0f6] text-[#0079bf] font-semibold' 
                        : 'bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d]'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setFilterType('list')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-[3px] transition-colors ${
                      filterType === 'list' 
                        ? 'bg-[#e4f0f6] text-[#0079bf] font-semibold' 
                        : 'bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d]'
                    }`}
                  >
                    Lists
                  </button>
                </div>
              </div>

              {/* SEARCH INPUT */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-[#5e6c84] uppercase tracking-wide mt-3 mb-1">Keyword</h4>
                <input
                  type="text"
                  autoFocus
                  placeholder={`Search ${filterType}s...`}
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-[#fafbfc] focus:bg-white border-2 border-[#dfe1e6] focus:border-[#0079bf] rounded-[3px] outline-none px-2 py-1 text-sm text-[#172b4d] transition-colors"
                />
              </div>

              {/* Clear All */}
              <button
                onClick={() => { setFilterQuery(''); setIsFilterOpen(false); }}
                className={`w-full py-1.5 text-sm font-medium rounded-[3px] transition-colors ${
                  filterQuery 
                    ? 'hover:bg-[#091e4214] text-[#172b4d]' 
                    : 'text-[#a5adba] cursor-not-allowed'
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
        <button className="hover:bg-white/10 p-1.5 rounded transition-colors">
          <MoreHorizontal size={20} />
        </button>
        <button className="bg-indigo-600 hover:bg-indigo-700 p-1.5 rounded-full transition-colors">
          <User size={18} className="text-white" />
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;
