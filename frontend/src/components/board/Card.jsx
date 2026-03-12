import React from 'react';
import { AlignLeft, CheckSquare, MessageSquare, Paperclip, Trash2 } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import useBoardStore from '../../store/useBoardStore';

const Card = ({ card, index }) => {
  const removeCard = useBoardStore((state) => state.removeCard);
  const openModal = useBoardStore((state) => state.openModal);

  // Mock data for UI presentation since we haven't fetched all relations yet
  const hasDescription = !!card.description;
  const commentCount = card.comments?.length || 0;
  const attachmentCount = card.attachments?.length || 0;
  
  // Calculate checklist progress if available
  let checklistProgress = null;
  if (card.checklists && card.checklists.length > 0) {
    const totalItems = card.checklists.reduce((acc, checklist) => acc + (checklist.items?.length || 0), 0);
    const completedItems = card.checklists.reduce(
      (acc, checklist) => acc + (checklist.items?.filter(item => item.isCompleted).length || 0),
      0
    );
    if (totalItems > 0) {
      checklistProgress = `${completedItems}/${totalItems}`;
    }
  }

  // Placeholder cover image logic (e.g., if there's an attachment that is an image)
  const coverImage = card.attachments?.find(a => a.fileType?.startsWith('image/'))?.fileUrl || null;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <div 
          className="bg-[#22272b] hover:border-gray-500 border border-transparent text-gray-200 p-2.5 rounded-lg shadow-sm cursor-grab active:cursor-grabbing group mb-3 relative transition-colors"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => openModal(card)}
        >
          {/* Delete button - visible on hover */}
          <button
            onClick={(e) => { e.stopPropagation(); removeCard(card.id); }}
            className="absolute top-2 right-2 p-1 rounded text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 z-10"
          >
            <Trash2 size={14} />
          </button>
          
          {/* Optional Cover Image */}
          {coverImage && (
            <div className="h-24 w-full -mt-3 -mx-3 mb-3 shrink-0 rounded-t-lg overflow-hidden relative">
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-200"></div>
            </div>
          )}

          {/* Labels */}
          {card.cardLabels && card.cardLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.cardLabels.map((cl, index) => (
                 // Assuming the relation brings in the label object directly or we mock the color for now
                <span 
                  key={index} 
                  className="h-2 w-10 rounded-full"
                  style={{ backgroundColor: cl.label?.color || '#0079bf' }}
                  title={cl.label?.title || 'Label'}
                />
              ))}
            </div>
          )}

          {/* Title */}
          <h4 className="text-gray-100 font-medium mb-2 leading-snug">{card.title}</h4>

          {/* Badges / Footer Row */}
          <div className="flex items-center gap-3 text-gray-400">
            
            {/* Due Date Indicator (Example: hardcoded styling logic) */}
            {card.dueDate && (
              <div className="flex items-center gap-1 text-[11px] font-medium bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                <span className="truncate max-w-[60px]">
                  {new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}

            {hasDescription && <AlignLeft size={14} />}
            
            {commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span className="text-xs">{commentCount}</span>
              </div>
            )}

            {attachmentCount > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip size={14} />
                <span className="text-xs">{attachmentCount}</span>
              </div>
            )}

            {checklistProgress && (
              <div className="flex items-center gap-1">
                <CheckSquare size={14} />
                <span className="text-xs">{checklistProgress}</span>
              </div>
            )}

            {/* Members Avatars (Right aligned) */}
            {card.cardMembers && card.cardMembers.length > 0 && (
              <div className="ml-auto flex -space-x-1">
                {card.cardMembers.map((cm, idx) => (
                   <div 
                     key={idx} 
                     className="w-6 h-6 rounded-full bg-indigo-500 border border-gray-800 flex items-center justify-center text-[10px] text-white font-bold"
                     title={cm.user?.username || 'User'}
                   >
                     {cm.user?.username ? cm.user.username.charAt(0).toUpperCase() : 'U'}
                   </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;
