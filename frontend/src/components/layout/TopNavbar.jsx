import React, { useState } from 'react';
import { Trello, Share2, Filter, Search, User, MoreHorizontal, X, ChevronLeft, ChevronDown, Image, Plus, LayoutGrid, Trash2, Palette, Droplets, Camera } from 'lucide-react';
import useBoardStore from '../../store/useBoardStore';

// ─── SOLID COLORS ─── High-contrast solids that won't blend with list backgrounds
const solidColorOptions = [
  { label: 'Ocean',       css: 'bg-[#0079bf]' },
  { label: 'Forest',      css: 'bg-[#519839]' },
  { label: 'Berry',       css: 'bg-[#b04632]' },
  { label: 'Sunset',      css: 'bg-[#d29034]' },
  { label: 'Plum',        css: 'bg-[#89609e]' },
  { label: 'Rose',        css: 'bg-[#cd5a91]' },
  { label: 'Sky',         css: 'bg-[#00aecc]' },
  { label: 'Lime',        css: 'bg-[#4bbf6b]' },
  { label: 'Charcoal',    css: 'bg-[#344563]' },
  { label: 'Storm',       css: 'bg-[#505f79]' },
];

// ─── GRADIENTS ─── Premium Trello-style vibrant gradients
const gradientOptions = [
  { label: 'Classic Blue',  css: 'bg-gradient-to-br from-[#0052cc] via-[#0079bf] to-[#00c2e0]' },
  { label: 'Northern',      css: 'bg-gradient-to-br from-[#6a0dad] via-[#b721ff] to-[#21d4fd]' },
  { label: 'Dusk',          css: 'bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]' },
  { label: 'Coral Reef',    css: 'bg-gradient-to-br from-[#ff6a00] via-[#ee0979] to-[#ff6a00]' },
  { label: 'Electric',      css: 'bg-gradient-to-br from-[#4776e6] to-[#8e54e9]' },
  { label: 'Emerald',       css: 'bg-gradient-to-br from-[#11998e] to-[#38ef7d]' },
  { label: 'Flamingo',      css: 'bg-gradient-to-br from-[#f953c6] to-[#b91d73]' },
  { label: 'Midnight',      css: 'bg-gradient-to-br from-[#232526] to-[#414345]' },
];

// ─── PHOTOS ─── HD Unsplash nature & landscape images
const photoOptions = [
  'https://images.unsplash.com/photo-1506744626753-1fa28f621b02?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1444464666168-49b19e88145e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1518173946687-a42874c717be?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
];

const TopNavbar = () => {
  const [copied, setCopied] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState('main');
  const [bgTab, setBgTab] = useState('colors');

  // Boards dropdown state
  const [isBoardsOpen, setIsBoardsOpen] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  const searchQuery = useBoardStore((state) => state.searchQuery);
  const setSearchQuery = useBoardStore((state) => state.setSearchQuery);
  
  // Advanced Filter state & actions
  const activeFilters = useBoardStore((state) => state.activeFilters);
  const toggleLabelFilter = useBoardStore((state) => state.toggleLabelFilter);
  const toggleMemberFilter = useBoardStore((state) => state.toggleMemberFilter);
  const toggleDueDateFilter = useBoardStore((state) => state.toggleDueDateFilter);
  const clearFilters = useBoardStore((state) => state.clearFilters);
  const boardLabels = useBoardStore((state) => state.boardLabels);
  const boardUsers = useBoardStore((state) => state.boardUsers);

  const setBoardBackground = useBoardStore((state) => state.setBoardBackground);

  // Multi-board
  const boards = useBoardStore((state) => state.boards);
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const switchBoard = useBoardStore((state) => state.switchBoard);
  const createNewBoard = useBoardStore((state) => state.createNewBoard);
  const board = useBoardStore((state) => state.board);
  const deleteBoard = useBoardStore((state) => state.deleteBoard);

  const handleDeleteBoard = (boardId, boardTitle) => {
    if (window.confirm(`Are you sure you want to delete "${boardTitle}" and all its contents?`)) {
      deleteBoard(boardId);
      setIsBoardsOpen(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;
    try {
      await createNewBoard(newBoardTitle.trim(), newBoardDesc.trim() || null);
      setNewBoardTitle('');
      setNewBoardDesc('');
      setIsCreatingBoard(false);
      setIsBoardsOpen(false);
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  return (
    <nav className="relative z-50 flex items-center justify-between px-4 py-3 bg-black/20 backdrop-blur-sm border-b border-white/20 text-white">
      {/* Left side - Branding + Board Switcher */}
      <div className="flex items-center gap-3">
        <Trello size={22} className="text-blue-400" />
        <h1 className="text-xl font-bold tracking-wide hidden sm:block">Trello</h1>

        {/* Boards Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIsBoardsOpen(!isBoardsOpen); setIsCreatingBoard(false); }}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline truncate max-w-[140px]">{board?.title || 'Boards'}</span>
            <ChevronDown size={14} />
          </button>

          {isBoardsOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full mt-2 w-72 bg-[#282e33] rounded-lg shadow-xl border border-[#384148] z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="relative border-b border-[#384148] px-3 py-2.5">
                <h3 className="text-center text-sm font-semibold text-[#9fadbc]">Your Boards</h3>
                <button
                  onClick={() => setIsBoardsOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9fadbc] hover:bg-[#a6c5e229] rounded p-1 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Board List */}
              <div className="max-h-60 overflow-y-auto p-2">
                {boards.map((b) => (
                  <div key={b.id} className="flex items-center gap-1 group/item">
                    <button
                      onClick={() => { switchBoard(b.id); setIsBoardsOpen(false); }}
                      className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded text-left text-sm transition-colors ${
                        b.id === activeBoardId
                          ? 'bg-blue-500/20 text-blue-300 font-semibold'
                          : 'text-[#b6c2cf] hover:bg-[#a6c5e229]'
                      }`}
                    >
                      <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-blue-600 to-indigo-700 shrink-0" />
                      <span className="truncate">{b.title}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteBoard(b.id, b.title); }}
                      className="p-1.5 rounded text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover/item:opacity-100 shrink-0"
                      title="Delete board"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {boards.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No boards yet</p>
                )}
              </div>

              {/* Create New Board */}
              <div className="border-t border-[#384148] p-2">
                {isCreatingBoard ? (
                  <div className="p-2 space-y-2">
                    <input
                      type="text"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                      placeholder="Board title"
                      autoFocus
                      className="w-full bg-[#22272b] border border-[#384148] rounded px-2.5 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={newBoardDesc}
                      onChange={(e) => setNewBoardDesc(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                      placeholder="Description (optional)"
                      className="w-full bg-[#22272b] border border-[#384148] rounded px-2.5 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateBoard}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 rounded transition-colors"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => { setIsCreatingBoard(false); setNewBoardTitle(''); setNewBoardDesc(''); }}
                        className="flex-1 bg-[#22272b] hover:bg-[#384148] text-gray-400 text-xs font-medium py-1.5 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCreatingBoard(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-[#b6c2cf] hover:bg-[#a6c5e229] transition-colors"
                  >
                    <Plus size={14} />
                    Create new board
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Center - Search Bar */}
      <div className="flex-1 flex justify-center items-center px-4 hidden md:flex">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/20 hover:bg-white/30 focus:bg-white focus:text-gray-900 border-none rounded-[3px] py-1 pl-9 pr-3 text-sm text-white placeholder-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 md:gap-4">

        {/* FILTER WRAPPER */}
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 rounded-[3px] px-3 py-1.5 text-sm font-medium transition-colors text-white outline-none focus:outline-none focus:ring-0 ${
              (isFilterOpen || activeFilters.labels.length > 0 || activeFilters.members.length > 0 || activeFilters.due) 
                ? 'bg-white/20' 
                : 'bg-transparent hover:bg-white/20'
            }`}
          >
            <Filter size={16} />
            <span className="hidden md:inline">Filters</span>
          </button>

          {isFilterOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full right-0 mt-2 w-[304px] bg-[#282e33] rounded-lg shadow-[0_8px_16px_-4px_rgba(0,0,0,0.6)] border border-[#384148] text-[#b6c2cf] p-3 z-50"
            >
              <div className="relative border-b border-[#384148] pb-2 mb-3">
                <h3 className="text-center text-sm font-semibold text-[#9fadbc]">Filter</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9fadbc] hover:bg-[#a6c5e229] hover:text-[#b6c2cf] rounded-[3px] p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Labels Section */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[#9fadbc] uppercase tracking-wide mb-2">Labels</h4>
                <div className="space-y-1">
                  {boardLabels?.map(label => (
                    <label 
                      key={label.id} 
                      className="flex items-center gap-2 p-1.5 hover:bg-[#a6c5e229] rounded cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox"
                        checked={activeFilters.labels.includes(label.id)}
                        onChange={() => toggleLabelFilter(label.id)}
                        className="w-3.5 h-3.5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-[#22272b] cursor-pointer"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className={`w-3.5 h-3.5 rounded-full`} style={{ backgroundColor: label.color }}></span>
                        <span className="text-sm font-medium text-[#b6c2cf]">{label.title}</span>
                      </div>
                    </label>
                  ))}
                  {(!boardLabels || boardLabels.length === 0) && (
                    <p className="text-xs text-gray-400 italic px-1.5">No labels on this board.</p>
                  )}
                </div>
              </div>

              {/* Members Section */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[#9fadbc] uppercase tracking-wide mb-2">Members</h4>
                <div className="space-y-1">
                  {boardUsers?.map(user => (
                    <label 
                      key={user.id} 
                      className="flex items-center gap-2 p-1.5 hover:bg-[#a6c5e229] rounded cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox"
                        checked={activeFilters.members.includes(user.id)}
                        onChange={() => toggleMemberFilter(user.id)}
                        className="w-3.5 h-3.5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-[#22272b] cursor-pointer"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                          {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-sm font-medium text-[#b6c2cf]">{user.username}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Due Date Section */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[#9fadbc] uppercase tracking-wide mb-2">Due date</h4>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#a6c5e229] rounded cursor-pointer transition-colors">
                    <input 
                      type="checkbox"
                      checked={activeFilters.dueDates.includes('noDate')}
                      onChange={() => toggleDueDateFilter('noDate')}
                      className="w-3.5 h-3.5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-[#22272b] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-[#b6c2cf] flex-1">No dates</span>
                  </label>
                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#a6c5e229] rounded cursor-pointer transition-colors">
                    <input 
                      type="checkbox"
                      checked={activeFilters.dueDates.includes('overdue')}
                      onChange={() => toggleDueDateFilter('overdue')}
                      className="w-3.5 h-3.5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-[#22272b] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-[#b6c2cf] flex-1">Overdue</span>
                  </label>
                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#a6c5e229] rounded cursor-pointer transition-colors">
                    <input 
                      type="checkbox"
                      checked={activeFilters.dueDates.includes('nextDay')}
                      onChange={() => toggleDueDateFilter('nextDay')}
                      className="w-3.5 h-3.5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-[#22272b] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-[#b6c2cf] flex-1">Due in the next day</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="pt-2 border-t border-[#384148]">
                <button
                  onClick={clearFilters}
                  className="w-full py-1.5 text-sm font-medium rounded-[3px] transition-colors hover:bg-red-500/10 text-red-400"
                >
                  Clear all filters
                </button>
              </div>
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

          {isMenuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full right-0 mt-2 w-[304px] bg-[#282e33] rounded-lg shadow-[0_8px_16px_-4px_rgba(0,0,0,0.6)] border border-[#384148] text-[#b6c2cf] z-50 overflow-hidden flex flex-col"
            >
              <div className="relative border-b border-[#384148] px-3 py-2">
                {menuView === 'background' && (
                  <button 
                    onClick={() => setMenuView('main')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9fadbc] hover:bg-[#a6c5e229] hover:text-[#b6c2cf] rounded-[3px] p-1 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                <h3 className="text-center text-sm font-semibold text-[#9fadbc]">
                  {menuView === 'main' ? 'Menu' : 'Change background'}
                </h3>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9fadbc] hover:bg-[#a6c5e229] hover:text-[#b6c2cf] rounded-[3px] p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 max-h-[400px] overflow-y-auto">
                {menuView === 'main' ? (
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setMenuView('background')}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-[3px] hover:bg-[#a6c5e229] transition-colors"
                    >
                      <Image size={16} className="text-[#9fadbc]" />
                      Change background
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* ─── Tabs ─── */}
                    <div className="flex gap-1 mb-4 bg-[#1b2025] rounded-lg p-1">
                      {[
                        { key: 'colors', label: 'Colors', Icon: Palette },
                        { key: 'gradients', label: 'Gradients', Icon: Droplets },
                        { key: 'photos', label: 'Photos', Icon: Camera },
                      ].map(({ key, label, Icon }) => (
                        <button
                          key={key}
                          onClick={() => setBgTab(key)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                            bgTab === key
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-[#9fadbc] hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon size={12} />
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* ─── Solid Colors Grid ─── */}
                    {bgTab === 'colors' && (
                      <div className="grid grid-cols-5 gap-2">
                        {solidColorOptions.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => { setBoardBackground(opt.css); setIsMenuOpen(false); }}
                            title={opt.label}
                            className={`aspect-square rounded-lg cursor-pointer hover:scale-110 hover:ring-2 hover:ring-white/60 transition-all duration-150 shadow-sm ${opt.css}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* ─── Gradients Grid ─── */}
                    {bgTab === 'gradients' && (
                      <div className="grid grid-cols-2 gap-2">
                        {gradientOptions.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => { setBoardBackground(opt.css); setIsMenuOpen(false); }}
                            title={opt.label}
                            className={`h-16 rounded-lg cursor-pointer hover:scale-[1.03] hover:ring-2 hover:ring-white/60 transition-all duration-150 shadow-sm ${opt.css}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* ─── Photos Grid ─── */}
                    {bgTab === 'photos' && (
                      <div className="grid grid-cols-2 gap-2">
                        {photoOptions.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => { setBoardBackground(imgUrl); setIsMenuOpen(false); }}
                            className="h-20 rounded-lg bg-cover bg-center hover:scale-[1.03] hover:ring-2 hover:ring-white/60 transition-all duration-150 shadow-sm"
                            style={{ backgroundImage: `url(${imgUrl})` }}
                          />
                        ))}
                      </div>
                    )}
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
