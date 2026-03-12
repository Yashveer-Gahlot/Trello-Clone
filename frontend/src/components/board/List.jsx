import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import { MoreHorizontal, Plus, X, Trash2, Archive, FoldHorizontal, UnfoldHorizontal } from 'lucide-react';
import useBoardStore from '../../store/useBoardStore';
import { Draggable, Droppable } from '@hello-pangea/dnd';

const List = ({ list, index }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const textareaRef = useRef(null);

  const allCards = useBoardStore((state) => state.cards);
  const addCard = useBoardStore((state) => state.addCard);
  const removeList = useBoardStore((state) => state.removeList);
  const archiveList = useBoardStore((state) => state.archiveList);
  const searchQuery = useBoardStore((state) => state.searchQuery);
  const activeFilters = useBoardStore((state) => state.activeFilters);
  
  const listCards = allCards
    .filter((card) => card.listId === list.id && !card.isArchived)
    .sort((a, b) => a.position - b.position)
    .filter((card) => {
      // 1. Search filter
      const matchesSearch = !searchQuery || card.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Labels filter
      const matchesLabels = activeFilters.labels.length === 0 || 
        activeFilters.labels.some(id => card.cardLabels?.some(cl => cl.labelId === id));
        
      // 3. Members filter
      const matchesMembers = activeFilters.members.length === 0 || 
        activeFilters.members.some(id => card.cardMembers?.some(cm => cm.userId === id));

      // 4. Due Date filter
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const matchesDue = activeFilters.dueDates.length === 0 || activeFilters.dueDates.some(filter => {
        if (filter === 'noDate') return !card.dueDate;
        if (!card.dueDate) return false;
        
        const cardDate = new Date(card.dueDate);
        if (filter === 'overdue') return cardDate < now;
        if (filter === 'nextDay') return cardDate >= now && cardDate <= tomorrow;
        return false;
      });

      return matchesSearch && matchesLabels && matchesMembers && matchesDue;
    });

  useEffect(() => {
    if (isAddingCard && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAddingCard]);

  const handleAddCard = async () => {
    if (!cardTitle.trim()) return;
    try {
      await addCard(cardTitle.trim(), list.id);
      setCardTitle('');
    } catch (err) {
      console.error('Failed to add card:', err);
    }
  };

  const handleCancel = () => {
    setIsAddingCard(false);
    setCardTitle('');
  };

  // ─── COLLAPSED VIEW ────────────────────────────────────────
  const listColors = ['bg-[#5a481c]', 'bg-[#1e462d]', 'bg-[#4b1e36]', 'bg-[#1b3f54]', 'bg-[#502418]'];
  const listBg = listColors[index % listColors.length];

  if (isCollapsed) {
    return (
      <Draggable draggableId={list.id} index={index}>
        {(provided) => (
          <div
            className={`w-14 max-h-full flex flex-col items-center rounded-xl flex-shrink-0 shadow-xl border border-black/20 py-3 cursor-pointer hover:brightness-110 transition-all ${listBg}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setIsCollapsed(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsCollapsed(false); }}
              className="p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-white transition-colors mb-2"
            >
              <UnfoldHorizontal size={16} />
            </button>
            <span className="text-gray-300 text-xs font-semibold [writing-mode:vertical-lr] tracking-wider whitespace-nowrap">
              {list.title}
            </span>
            <span className="text-gray-500 text-[10px] mt-2">{listCards.length}</span>
          </div>
        )}
      </Draggable>
    );
  }

  // ─── NORMAL (EXPANDED) VIEW ─────────────────────────────────
  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div 
          className={`w-72 max-h-full flex flex-col text-[#b6c2cf] rounded-xl flex-shrink-0 shadow-xl border border-black/20 ${listBg}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          
          {/* Header */}
          <div className="shrink-0 px-3 pt-3 pb-2 flex justify-between items-center group cursor-pointer text-gray-200 hover:bg-gray-800/50 rounded-t-xl transition-colors">
            <h3 className="font-semibold text-sm pl-1 truncate pr-2">{list.title}</h3>
            <div className="flex items-center gap-0.5">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
                className="p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="Collapse list"
              >
                <FoldHorizontal size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); archiveList(list.id); }}
                className="p-1.5 rounded text-gray-400 hover:bg-orange-500/20 hover:text-orange-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Archive list"
              >
                <Archive size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); removeList(list.id); }}
                className="p-1.5 rounded text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete list"
              >
                <Trash2 size={14} />
              </button>
              <button className="p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Cards Scrollable Area */}
          <Droppable droppableId={list.id} type="card">
            {(provided) => (
              <div 
                className="flex-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {listCards.map((card, index) => (
                  <Card key={card.id} card={card} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Footer / Add Card */}
          <div className="shrink-0 px-2 pb-2 pt-1">
            {isAddingCard ? (
              <div>
                <textarea
                  ref={textareaRef}
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCard();
                    }
                    if (e.key === 'Escape') handleCancel();
                  }}
                  placeholder="Enter a title for this card..."
                  className="w-full bg-gray-800 text-white p-2 rounded-lg text-sm resize-none border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={handleAddCard}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Add card
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="flex items-center gap-2 p-2 mx-2 mb-2 w-[calc(100%-16px)] hover:bg-black/20 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm font-medium">Add a card</span>
              </button>
            )}
          </div>
          
        </div>
      )}
    </Draggable>
  );
};

export default List;
