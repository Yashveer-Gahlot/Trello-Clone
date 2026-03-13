import { create } from 'zustand';
import axios from 'axios';

const API = 'http://localhost:3000/api';

const useBoardStore = create((set, get) => ({
  // ─── MULTI-BOARD STATE ──────────────────────────────────────
  boards: [],
  activeBoardId: null,

  // ─── SINGLE BOARD STATE ─────────────────────────────────────
  board: null,
  lists: [],
  cards: [],
  boardLabels: [],
  boardUsers: [],
  activeCard: null,
  searchQuery: '',
  activeFilters: { labels: [], members: [], dueDates: [] },
  boardBackground: 'bg-gradient-to-br from-[#0052cc] via-[#0079bf] to-[#00c2e0]',
  isLoading: false,
  error: null,

  // ─── HELPER: Sync a full card into cards[] and activeCard ───
  syncCardInState: (updatedCard) => {
    const { cards, activeCard } = get();
    set({
      cards: cards.map((c) => c.id === updatedCard.id ? updatedCard : c),
      activeCard: activeCard?.id === updatedCard.id ? updatedCard : activeCard,
    });
  },

  // ─── MULTI-BOARD ACTIONS ────────────────────────────────────
  fetchAllBoards: async () => {
    try {
      const response = await axios.get(`${API}/boards`);
      set({ boards: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching boards:', error);
      return [];
    }
  },

  createNewBoard: async (title, description) => {
    try {
      const response = await axios.post(`${API}/boards`, { title, description });
      const newBoard = response.data;
      set({ boards: [...get().boards, newBoard] });
      get().switchBoard(newBoard.id);
      return newBoard;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  },

  switchBoard: async (boardId) => {
    set({ activeBoardId: boardId });
    await get().fetchBoardData(boardId);
  },

  deleteBoard: async (boardId) => {
    try {
      await axios.delete(`${API}/boards/${boardId}`);
      const remaining = get().boards.filter(b => b.id !== boardId);
      set({ boards: remaining });

      if (get().activeBoardId === boardId) {
        if (remaining.length > 0) {
          await get().switchBoard(remaining[0].id);
        } else {
          set({ activeBoardId: null, board: null, lists: [], cards: [], boardLabels: [], boardUsers: [] });
        }
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  },

  // ─── FETCH BOARD BY ID ─────────────────────────────────────
  fetchBoardData: async (boardId) => {
    const id = boardId || get().activeBoardId;
    if (!id) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API}/boards/${id}`);
      const boardData = response.data;

      const extractedLists = [];
      const extractedCards = [];

      if (boardData?.lists) {
        boardData.lists.forEach((list) => {
          const { cards, ...listWithoutCards } = list;
          extractedLists.push(listWithoutCards);
          if (cards && Array.isArray(cards)) {
            extractedCards.push(...cards);
          }
        });
      }

      const { lists, labels, users, ...boardWithoutLists } = boardData || {};

      set({
        board: boardWithoutLists,
        lists: boardData?.lists || [],
        cards: extractedCards,
        boardLabels: labels || [],
        boardUsers: users || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching board data:', error);
      set({ error: error.message || 'Failed to fetch board data', isLoading: false });
    }
  },

  // ─── DND ────────────────────────────────────────────────────
  moveItemLocally: async (result) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const { lists, cards } = get();

    if (type === 'list') {
      const newLists = Array.from(lists);
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);

      let newPosition = 0;
      if (destination.index === 0) {
        newPosition = newLists.length > 1 ? newLists[1].position / 2 : 1024;
      } else if (destination.index === newLists.length - 1) {
        newPosition = newLists[newLists.length - 2].position + 1024;
      } else {
        const prevPos = newLists[destination.index - 1].position;
        const nextPos = newLists[destination.index + 1].position;
        newPosition = (prevPos + nextPos) / 2;
      }
      movedList.position = newPosition;
      set({ lists: newLists });

      try {
        await axios.put(`${API}/lists/${draggableId}/move`, {
          position: newPosition,
          boardId: movedList.boardId,
        });
      } catch (error) {
        console.error('Failed to save list movement:', error);
      }
      return;
    }

    if (type === 'card') {
      const newCards = Array.from(cards);
      const movedCardIndex = newCards.findIndex(c => c.id === draggableId);
      if (movedCardIndex === -1) return;
      const movedCard = newCards[movedCardIndex];
      newCards.splice(movedCardIndex, 1);

      const visibleDestCards = newCards
        .filter(c => c.listId === destination.droppableId && !c.isArchived)
        .sort((a, b) => a.position - b.position);

      let newPosition = 0;
      if (visibleDestCards.length === 0) {
        newPosition = 1024;
      } else if (destination.index === 0) {
        newPosition = visibleDestCards[0].position / 2;
      } else if (destination.index >= visibleDestCards.length) {
        newPosition = visibleDestCards[visibleDestCards.length - 1].position + 1024;
      } else {
        const prevPos = visibleDestCards[destination.index - 1].position;
        const nextPos = visibleDestCards[destination.index].position;
        newPosition = (prevPos + nextPos) / 2;
      }

      movedCard.listId = destination.droppableId;
      movedCard.position = newPosition;
      newCards.push(movedCard);
      set({ cards: newCards });

      try {
        await axios.put(`${API}/cards/${draggableId}/move`, {
          position: newPosition,
          listId: destination.droppableId,
        });
      } catch (error) {
        console.error('Failed to save card movement:', error);
      }
      return;
    }
  },

  // ─── LIST CRUD ──────────────────────────────────────────────
  addList: async (title, boardId) => {
    try {
      const { lists } = get();
      const position = lists.length > 0 ? lists[lists.length - 1].position + 1024 : 1024;
      const response = await axios.post(`${API}/lists`, { title, boardId, position });
      set({ lists: [...get().lists, response.data] });
      return response.data;
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  },

  // ─── CARD CRUD ──────────────────────────────────────────────
  addCard: async (title, listId) => {
    try {
      const { cards } = get();
      const listCards = cards.filter((c) => c.listId === listId && !c.isArchived).sort((a, b) => a.position - b.position);
      const position = listCards.length > 0 ? listCards[listCards.length - 1].position + 1024 : 1024;
      const response = await axios.post(`${API}/cards`, { title, listId, position });
      set({ cards: [...get().cards, response.data] });
      return response.data;
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  },

  removeList: async (listId) => {
    const { lists, cards } = get();
    set({
      lists: lists.filter((l) => l.id !== listId),
      cards: cards.filter((c) => c.listId !== listId),
    });
    try { await axios.delete(`${API}/lists/${listId}`); }
    catch (error) { console.error('Failed to delete list:', error); }
  },

  removeCard: async (cardId) => {
    const { cards } = get();
    set({ cards: cards.filter((c) => c.id !== cardId) });
    try { await axios.delete(`${API}/cards/${cardId}`); }
    catch (error) { console.error('Failed to delete card:', error); }
  },

  archiveList: async (listId) => {
    const { lists, cards } = get();
    set({
      lists: lists.filter((l) => l.id !== listId),
      cards: cards.filter((c) => c.listId !== listId),
    });
    try { await axios.put(`${API}/lists/${listId}/archive`); }
    catch (error) { console.error('Failed to archive list:', error); }
  },

  archiveCard: async (cardId) => {
    const { cards } = get();
    set({ cards: cards.filter((c) => c.id !== cardId) });
    try { await axios.put(`${API}/cards/${cardId}/archive`); }
    catch (error) { console.error('Failed to archive card:', error); }
  },

  // ─── MODAL ──────────────────────────────────────────────────
  openModal: (card) => set({ activeCard: card }),
  closeModal: () => set({ activeCard: null }),

  // ─── UPDATE CARD (title, description, dueDate) ─────────────
  updateCard: async (id, updates) => {
    try {
      const response = await axios.put(`${API}/cards/${id}`, updates);
      get().syncCardInState(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },

  // ─── LABEL ACTIONS ──────────────────────────────────────────
  createLabel: async (boardId, title, color) => {
    try {
      const response = await axios.post(`${API}/boards/${boardId}/labels`, { title, color });
      set({ boardLabels: [...get().boardLabels, response.data] });
    } catch (error) {
      console.error('Error creating label:', error);
    }
  },

  toggleCardLabel: async (cardId, labelId) => {
    const previousCards = get().cards;
    const previousActiveCard = get().activeCard;
    
    // Optimistic Update
    set((state) => {
      const updatedCards = state.cards.map(card => {
        if (card.id === cardId) {
          const hasLabel = card.cardLabels?.some(cl => cl.labelId === labelId);
          let newLabels;
          if (hasLabel) {
            newLabels = card.cardLabels.filter(cl => cl.labelId !== labelId);
          } else {
            const labelObj = state.boardLabels.find(l => l.id === labelId);
            newLabels = [...(card.cardLabels || []), { cardId, labelId, label: labelObj }];
          }
          return { ...card, cardLabels: newLabels };
        }
        return card;
      });
      
      return { 
        cards: updatedCards, 
        activeCard: state.activeCard?.id === cardId ? updatedCards.find(c => c.id === cardId) : state.activeCard 
      };
    });

    try {
      const response = await axios.post(`${API}/cards/${cardId}/labels/${labelId}/toggle`);
      get().syncCardInState(response.data);
    } catch (error) {
      set({ cards: previousCards, activeCard: previousActiveCard });
      console.error('Error toggling label:', error);
    }
  },

  // ─── MEMBER ACTIONS ─────────────────────────────────────────
  toggleCardMember: async (cardId, userId) => {
    const previousCards = get().cards;
    const previousActiveCard = get().activeCard;

    // Optimistic Update
    set((state) => {
      const updatedCards = state.cards.map(c => {
        if (c.id === cardId) {
          const hasMember = c.cardMembers?.some(cm => cm.userId === userId);
          let newMembers;
          if (hasMember) {
            newMembers = c.cardMembers.filter(cm => cm.userId !== userId);
          } else {
            const userObj = state.boardUsers.find(u => u.id === userId);
            newMembers = [...(c.cardMembers || []), { cardId, userId, user: userObj }];
          }
          return { ...c, cardMembers: newMembers };
        }
        return c;
      });
      
      return { 
        cards: updatedCards,
        activeCard: state.activeCard?.id === cardId ? updatedCards.find(c => c.id === cardId) : state.activeCard
      };
    });

    try {
      const card = previousCards.find(c => c.id === cardId);
      const hasMember = card?.cardMembers?.some(cm => cm.userId === userId);
      let response;
      if (hasMember) {
        response = await axios.delete(`${API}/cards/${cardId}/members/${userId}`);
      } else {
        response = await axios.post(`${API}/cards/${cardId}/members/${userId}`);
      }
      get().syncCardInState(response.data);
    } catch (error) {
      set({ cards: previousCards, activeCard: previousActiveCard });
      console.error('Error toggling member:', error);
    }
  },

  // ─── DUE DATE ───────────────────────────────────────────────
  updateCardDueDate: async (cardId, dueDate) => {
    const previousCards = get().cards;
    const previousActiveCard = get().activeCard;

    // Optimistic Update
    set((state) => {
      const updatedCards = state.cards.map(c => c.id === cardId ? { ...c, dueDate } : c);
      return {
        cards: updatedCards,
        activeCard: state.activeCard?.id === cardId ? updatedCards.find(c => c.id === cardId) : state.activeCard
      };
    });

    try {
      const response = await axios.put(`${API}/cards/${cardId}`, { dueDate });
      get().syncCardInState(response.data);
    } catch (error) {
      set({ cards: previousCards, activeCard: previousActiveCard });
      console.error('Error updating due date:', error);
    }
  },

  // ─── CHECKLIST ACTIONS ──────────────────────────────────────
  addChecklist: async (cardId, title) => {
    try {
      const response = await axios.post(`${API}/cards/${cardId}/checklists`, { title });
      get().syncCardInState(response.data);
    } catch (error) {
      console.error('Error creating checklist:', error);
    }
  },

  deleteChecklist: async (cardId, checklistId) => {
    try {
      const response = await axios.delete(`${API}/cards/${cardId}/checklists/${checklistId}`);
      get().syncCardInState(response.data);
    } catch (error) {
      console.error('Error deleting checklist:', error);
    }
  },

  addChecklistItem: async (checklistId, content) => {
    try {
      const response = await axios.post(`${API}/checklists/${checklistId}/items`, { content });
      get().syncCardInState(response.data);
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  },

  // ─── ATTACHMENTS ──────────────────────────────────────────────
  addAttachment: async (cardId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API}/cards/${cardId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      get().syncCardInState(response.data);
    } catch (error) {
      console.error('Error uploading attachment:', error);
    }
  },

  deleteAttachment: async (cardId, attachmentId) => {
    try {
      const response = await axios.delete(`${API}/cards/${cardId}/attachments/${attachmentId}`);
      get().syncCardInState(response.data);
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  },

  addLinkAttachment: async (cardId, url, displayName) => {
    try {
      const response = await axios.post(`${API}/cards/${cardId}/attachments/link`, { url, displayName });
      get().syncCardInState(response.data);
    } catch (error) {
      console.error('Error adding link attachment:', error);
    }
  },

  toggleChecklistItem: async (checklistId, itemId) => {
    try {
      const response = await axios.patch(`${API}/checklists/${checklistId}/items/${itemId}`);
      get().syncCardInState(response.data);
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  },

  deleteChecklistItem: async (checklistId, itemId) => {
    try {
      const response = await axios.delete(`${API}/checklists/${checklistId}/items/${itemId}`);
      get().syncCardInState(response.data);
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  },

  // ─── SEARCH & ADVANCED FILTERS ─────────────────────────────
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  toggleLabelFilter: (labelId) => set((state) => {
    const isSelected = state.activeFilters.labels.includes(labelId);
    return {
      activeFilters: {
        ...state.activeFilters,
        labels: isSelected
          ? state.activeFilters.labels.filter(id => id !== labelId)
          : [...state.activeFilters.labels, labelId]
      }
    };
  }),

  toggleMemberFilter: (userId) => set((state) => {
    const isSelected = state.activeFilters.members.includes(userId);
    return {
      activeFilters: {
        ...state.activeFilters,
        members: isSelected
          ? state.activeFilters.members.filter(id => id !== userId)
          : [...state.activeFilters.members, userId]
      }
    };
  }),

  toggleDueDateFilter: (option) => set((state) => {
    const current = state.activeFilters.dueDates;
    const updated = current.includes(option) 
      ? current.filter(o => o !== option) 
      : [...current, option];
    return { 
      activeFilters: { ...state.activeFilters, dueDates: updated } 
    };
  }),

  clearFilters: () => set({ 
    searchQuery: '', 
    activeFilters: { labels: [], members: [], dueDates: [] } 
  }),

  // ─── BACKGROUND ──────────────────────────────────────────────
  setBoardBackground: (bg) => set({ boardBackground: bg }),
}));

export default useBoardStore;
