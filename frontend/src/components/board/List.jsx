import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import { MoreHorizontal, Plus, X, Trash2 } from 'lucide-react';
import useBoardStore from '../../store/useBoardStore';
import { Draggable, Droppable } from '@hello-pangea/dnd';

const List = ({ list, index }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const textareaRef = useRef(null);

  // Get all cards from the store, filter to only the ones belonging to this list, and sort by position
  const allCards = useBoardStore((state) => state.cards);
  const addCard = useBoardStore((state) => state.addCard);
  const removeList = useBoardStore((state) => state.removeList);
  
  const listCards = allCards
    .filter((card) => card.listId === list.id && !card.isArchived)
    .sort((a, b) => a.position - b.position);

  // Optional placeholder logic for list color bar based on index or property
  const listBorderColors = ['border-t-blue-500', 'border-t-yellow-500', 'border-t-green-500'];
  const colorClass = listBorderColors[Math.floor(list.position) % listBorderColors.length] || 'border-t-transparent';

  // Auto-focus the textarea when adding mode activates
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
      // Keep form open for rapid card entry
    } catch (err) {
      console.error('Failed to add card:', err);
    }
  };

  const handleCancel = () => {
    setIsAddingCard(false);
    setCardTitle('');
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div 
          className={`w-72 max-h-full flex flex-col bg-gray-900/80 rounded-xl flex-shrink-0 border-t-[3px] shadow-lg ${colorClass}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          
          {/* Header */}
          <div className="shrink-0 px-3 pt-3 pb-2 flex justify-between items-center group cursor-pointer text-gray-200 hover:bg-gray-800/50 rounded-t-xl transition-colors">
            <h3 className="font-semibold text-sm pl-1 truncate pr-2">{list.title}</h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); removeList(list.id); }}
                className="p-1.5 rounded text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
                className="flex items-center gap-2 p-2 w-full hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
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

