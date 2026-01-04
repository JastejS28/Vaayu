import { create } from 'zustand';

export const useHoverState = create((set) => ({
  isHovering: false,
  targetType: null,
  hoverTimeAccumulated: 0,
  requiredHoverTime: 10,
  hoverProgress: 0,
  
  updateHoverState: (data) => set(data),
  
  resetHoverState: () => set({
    isHovering: false,
    targetType: null,
    hoverTimeAccumulated: 0,
    requiredHoverTime: 10,
    hoverProgress: 0
  })
}));