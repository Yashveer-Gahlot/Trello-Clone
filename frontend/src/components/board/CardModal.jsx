import React, { useState, useEffect } from 'react';
import { X, AlignLeft, Type, Tag, Users, Calendar, CheckSquare, Plus, Trash2, Archive, ChevronLeft, Paperclip, Download } from 'lucide-react';
import useBoardStore from '../../store/useBoardStore';

const labelColors = [
  '#f87171', // Red
  '#fb923c', // Orange
  '#facc15', // Yellow
  '#4ade80', // Green
  '#60a5fa', // Blue
  '#c084fc', // Purple
  '#f472b6', // Pink
];

const CardModal = () => {
  const activeCard = useBoardStore((state) => state.activeCard);
  const closeModal = useBoardStore((state) => state.closeModal);
  const updateCard = useBoardStore((state) => state.updateCard);
  const boardLabels = useBoardStore((state) => state.boardLabels);
  const boardUsers = useBoardStore((state) => state.boardUsers);
  const toggleCardLabel = useBoardStore((state) => state.toggleCardLabel);
  const toggleCardMember = useBoardStore((state) => state.toggleCardMember);
  const updateCardDueDate = useBoardStore((state) => state.updateCardDueDate);
  const addChecklist = useBoardStore((state) => state.addChecklist);
  const deleteChecklist = useBoardStore((state) => state.deleteChecklist);
  const addChecklistItem = useBoardStore((state) => state.addChecklistItem);
  const toggleChecklistItem = useBoardStore((state) => state.toggleChecklistItem);
  const deleteChecklistItem = useBoardStore((state) => state.deleteChecklistItem);
  const archiveCard = useBoardStore((state) => state.archiveCard);
  const addAttachment = useBoardStore((state) => state.addAttachment);
  const removeAttachment = useBoardStore((state) => state.deleteAttachment);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Label Creation State
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const createLabel = useBoardStore((state) => state.createLabel);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelTitle, setNewLabelTitle] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(labelColors[0]);

  // Popover toggles
  const [showLabels, setShowLabels] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showDueDate, setShowDueDate] = useState(false);
  const [showChecklistAdd, setShowChecklistAdd] = useState(false);

  // Input states
  const [dueDateInput, setDueDateInput] = useState('');
  const [checklistTitle, setChecklistTitle] = useState('');
  const [newItemInputs, setNewItemInputs] = useState({});

  useEffect(() => {
    if (activeCard) {
      setTitle(activeCard.title || '');
      setDescription(activeCard.description || '');
      setDueDateInput(activeCard.dueDate ? activeCard.dueDate.slice(0, 10) : '');
      setShowLabels(false);
      setShowMembers(false);
      setShowDueDate(false);
      setShowChecklistAdd(false);
      setIsCreatingLabel(false);
    }
  }, [activeCard]);

  if (!activeCard) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await updateCard(activeCard.id, { title: title.trim(), description: description.trim() });
      closeModal();
    } catch (err) {
      console.error('Failed to save card:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelColor) return;
    await createLabel(activeBoardId, newLabelTitle.trim(), newLabelColor);
    setNewLabelTitle('');
    setNewLabelColor(labelColors[0]);
    setIsCreatingLabel(false);
  };

  const handleDueDateSave = async () => {
    await updateCardDueDate(activeCard.id, dueDateInput || null);
    setShowDueDate(false);
  };

  const handleAddChecklist = async () => {
    if (!checklistTitle.trim()) return;
    await addChecklist(activeCard.id, checklistTitle.trim());
    setChecklistTitle('');
    setShowChecklistAdd(false);
  };

  const handleAddItem = async (checklistId) => {
    const content = newItemInputs[checklistId]?.trim();
    if (!content) return;
    await addChecklistItem(checklistId, content);
    setNewItemInputs(prev => ({ ...prev, [checklistId]: '' }));
  };

  // Compute labels and members on card
  const cardLabelIds = new Set(activeCard.cardLabels?.map(cl => cl.labelId) || []);
  const cardMemberIds = new Set(activeCard.cardMembers?.map(cm => cm.userId) || []);

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start pt-12 overflow-y-auto pb-12"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#323940] w-full max-w-3xl rounded-xl p-0 text-white shadow-2xl relative flex flex-col md:flex-row"
      >
        {/* ═══ MAIN CONTENT (left column) ═══ */}
        <div className="flex-1 p-6 min-w-0">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:bg-gray-600 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Title */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1.5 text-gray-400">
              <Type size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Title</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full bg-[#22272b] border border-[#384148] rounded-lg px-3 py-2 text-base font-semibold text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter card title..."
            />
          </div>

          {/* Labels Display */}
          {activeCard.cardLabels?.length > 0 && (
            <div className="mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Labels</span>
              <div className="flex flex-wrap gap-1.5">
                {activeCard.cardLabels.map((cl) => (
                  <span
                    key={cl.labelId}
                    className="px-2.5 py-0.5 rounded-sm text-xs font-semibold text-white"
                    style={{ backgroundColor: cl.label?.color || '#0079bf' }}
                  >
                    {cl.label?.title || ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Due Date Display */}
          {activeCard.dueDate && (
            <div className="mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Due Date</span>
              <span className="inline-block bg-[#a1bdd914] text-[#b6c2cf] text-xs font-medium px-2.5 py-1 rounded">
                <Calendar size={12} className="inline mr-1.5 -mt-0.5" />
                {new Date(activeCard.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}

          {/* Members Display */}
          {activeCard.cardMembers?.length > 0 && (
            <div className="mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Members</span>
              <div className="flex -space-x-1">
                {activeCard.cardMembers.map((cm) => (
                  <div
                    key={cm.userId}
                    className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-[#323940] flex items-center justify-center text-[11px] text-white font-bold"
                    title={cm.user?.username || 'User'}
                  >
                    {cm.user?.username ? cm.user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Attachments Display */}
          {activeCard?.attachments?.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Paperclip className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold">Attachments</h3>
              </div>
              <div className="space-y-3">
                {activeCard.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
                    <span className="text-sm font-medium truncate max-w-[70%]">{attachment.fileName}</span>
                    <div className="flex gap-2">
                      <a href={`http://localhost:3000${attachment.fileUrl}`} target="_blank" rel="noreferrer" className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                      <button onClick={() => removeAttachment(activeCard.id, attachment.id)} className="p-1.5 bg-gray-700 hover:bg-red-500/80 rounded text-gray-300 hover:text-white transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1.5 text-gray-400">
              <AlignLeft size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Description</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-[#22272b] border border-[#384148] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Add a more detailed description..."
            />
          </div>

          {/* ═══ CHECKLISTS ═══ */}
          {activeCard.checklists?.map((checklist) => {
            const total = checklist.items?.length || 0;
            const done = checklist.items?.filter(i => i.isCompleted).length || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={checklist.id} className="mb-5">
                {/* Checklist Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckSquare size={16} />
                    <h4 className="text-sm font-semibold">{checklist.title}</h4>
                  </div>
                  <button
                    onClick={() => deleteChecklist(activeCard.id, checklist.id)}
                    className="text-xs text-gray-500 hover:text-red-400 bg-[#22272b] hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-gray-400 w-7 text-right">{pct}%</span>
                  <div className="flex-1 h-1.5 bg-[#22272b] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {checklist.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group py-1 px-1 rounded hover:bg-[#22272b] transition-colors">
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={() => toggleChecklistItem(checklist.id, item.id)}
                        className="w-4 h-4 rounded border-gray-500 text-blue-500 bg-transparent focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blue-500"
                      />
                      <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {item.content}
                      </span>
                      <button
                        onClick={() => deleteChecklistItem(checklist.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Item */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newItemInputs[checklist.id] || ''}
                    onChange={(e) => setNewItemInputs(prev => ({ ...prev, [checklist.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem(checklist.id)}
                    placeholder="Add an item..."
                    className="flex-1 bg-[#22272b] border border-[#384148] rounded px-2.5 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    onClick={() => handleAddItem(checklist.id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#384148]">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={closeModal}
              className="bg-[#22272b] hover:bg-[#2c333a] text-gray-300 text-sm font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* ═══ SIDEBAR (right column) ═══ */}
        <div className="w-full md:w-48 bg-[#2b3036] p-4 rounded-b-xl md:rounded-bl-none md:rounded-r-xl flex flex-col gap-2 shrink-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Add to card</span>

          {/* Labels Button */}
          <div className="relative">
            <button
              onClick={() => { setShowLabels(!showLabels); setShowMembers(false); setShowDueDate(false); setShowChecklistAdd(false); setIsCreatingLabel(false); }}
              className="w-full flex items-center gap-2 bg-[#22272b] hover:bg-[#384148] text-gray-300 text-sm font-medium px-3 py-2 rounded transition-colors text-left"
            >
              <Tag size={14} /> Labels
            </button>
            {showLabels && (
              <div className="absolute left-0 md:right-0 md:left-auto top-full mt-1 w-64 bg-[#282e33] rounded-lg shadow-xl border border-[#384148] p-3 z-50">
                {!isCreatingLabel ? (
                  <>
                    <h5 className="text-xs font-semibold text-gray-400 mb-2">Board Labels</h5>
                    <div className="space-y-1 max-h-48 overflow-y-auto mb-2">
                      {boardLabels.map((label) => (
                        <button
                          key={label.id}
                          onClick={() => toggleCardLabel(activeCard.id, label.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#384148] transition-colors"
                        >
                          <span className="w-8 h-5 rounded-sm shrink-0" style={{ backgroundColor: label.color }} />
                          <span className="text-sm text-gray-200 flex-1 text-left truncate">{label.title || 'Untitled'}</span>
                          {cardLabelIds.has(label.id) && <span className="text-blue-400 text-sm">✓</span>}
                        </button>
                      ))}
                      {boardLabels.length === 0 && <p className="text-xs text-gray-500">No labels available</p>}
                    </div>
                    <button
                      onClick={() => setIsCreatingLabel(true)}
                      className="w-full bg-[#1b2125] hover:bg-[#22272b] text-sm text-gray-300 py-1.5 rounded transition-colors"
                    >
                      Create a new label
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <button onClick={() => setIsCreatingLabel(false)} className="text-gray-400 hover:text-white">
                        <ChevronLeft size={16} />
                      </button>
                      <h5 className="text-xs font-semibold text-gray-400 leading-none">Create Label</h5>
                    </div>
                    
                    <div className="mb-3">
                      <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Title</label>
                      <input
                        type="text"
                        value={newLabelTitle}
                        onChange={(e) => setNewLabelTitle(e.target.value)}
                        className="w-full bg-[#22272b] border border-[#384148] rounded px-2.5 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Label title..."
                      />
                    </div>

                    <div className="mb-4">
                      <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Color</label>
                      <div className="flex flex-wrap gap-1.5">
                        {labelColors.map(color => (
                          <button
                            key={color}
                            onClick={() => setNewLabelColor(color)}
                            className={`w-8 h-6 rounded-sm transition-transform ${newLabelColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#282e33] scale-110' : 'hover:opacity-80'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleCreateLabel}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-1.5 rounded transition-colors"
                    >
                      Create
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Members Button */}
          <div className="relative">
            <button
              onClick={() => { setShowMembers(!showMembers); setShowLabels(false); setShowDueDate(false); setShowChecklistAdd(false); }}
              className="w-full flex items-center gap-2 bg-[#22272b] hover:bg-[#384148] text-gray-300 text-sm font-medium px-3 py-2 rounded transition-colors text-left"
            >
              <Users size={14} /> Members
            </button>
            {showMembers && (
              <div className="absolute left-0 md:right-0 md:left-auto top-full mt-1 w-56 bg-[#282e33] rounded-lg shadow-xl border border-[#384148] p-3 z-50">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">Board Members</h5>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {boardUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => toggleCardMember(activeCard.id, user.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#384148] transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-200 flex-1 text-left truncate">{user.username}</span>
                      {cardMemberIds.has(user.id) && <span className="text-blue-400 text-sm">✓</span>}
                    </button>
                  ))}
                  {boardUsers.length === 0 && <p className="text-xs text-gray-500">No users available</p>}
                </div>
              </div>
            )}
          </div>

          {/* Due Date Button */}
          <div className="relative">
            <button
              onClick={() => { setShowDueDate(!showDueDate); setShowLabels(false); setShowMembers(false); setShowChecklistAdd(false); }}
              className="w-full flex items-center gap-2 bg-[#22272b] hover:bg-[#384148] text-gray-300 text-sm font-medium px-3 py-2 rounded transition-colors text-left"
            >
              <Calendar size={14} /> Due Date
            </button>
            {showDueDate && (
              <div className="absolute left-0 md:right-0 md:left-auto top-full mt-1 w-56 bg-[#282e33] rounded-lg shadow-xl border border-[#384148] p-3 z-50">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">Set Due Date</h5>
                <input
                  type="date"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  className="w-full bg-[#22272b] border border-[#384148] rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleDueDateSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setDueDateInput(''); handleDueDateSave(); }}
                    className="flex-1 bg-[#22272b] hover:bg-[#384148] text-gray-400 text-xs font-medium py-1.5 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Attachment Button */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Add to card</h4>
            <label className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm font-medium">
              <Paperclip className="w-4 h-4" />
              Attachment
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => { 
                  if (e.target.files[0]) addAttachment(activeCard.id, e.target.files[0]); 
                }} 
              />
            </label>
          </div>

          {/* Checklist Button */}
          <div className="relative">
            <button
              onClick={() => { setShowChecklistAdd(!showChecklistAdd); setShowLabels(false); setShowMembers(false); setShowDueDate(false); }}
              className="w-full flex items-center gap-2 bg-[#22272b] hover:bg-[#384148] text-gray-300 text-sm font-medium px-3 py-2 rounded transition-colors text-left"
            >
              <CheckSquare size={14} /> Checklist
            </button>
            {showChecklistAdd && (
              <div className="absolute left-0 md:right-0 md:left-auto top-full mt-1 w-56 bg-[#282e33] rounded-lg shadow-xl border border-[#384148] p-3 z-50">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">Add Checklist</h5>
                <input
                  type="text"
                  value={checklistTitle}
                  onChange={(e) => setChecklistTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                  placeholder="Checklist title..."
                  className="w-full bg-[#22272b] border border-[#384148] rounded px-2.5 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                />
                <button
                  onClick={handleAddChecklist}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 rounded transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Archive Button */}
          <div className="mt-3 pt-3 border-t border-[#384148]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Actions</span>
            <button
              onClick={() => { archiveCard(activeCard.id); closeModal(); }}
              className="w-full flex items-center gap-2 bg-[#22272b] hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-sm font-medium px-3 py-2 rounded transition-colors text-left"
            >
              <Archive size={14} /> Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
