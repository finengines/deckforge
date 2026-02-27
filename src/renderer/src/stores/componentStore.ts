import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuid } from 'uuid'
import type { ComponentDefinition, ComponentSlot } from '../types'

interface ComponentStore {
  // Current component being edited (null = not editing)
  currentComponent: ComponentDefinition | null
  
  // Selected slot IDs in the component editor
  selectedSlotIds: string[]
  
  // Actions
  createComponent: (name: string, category: ComponentDefinition['category']) => void
  loadComponent: (component: ComponentDefinition) => void
  closeComponent: () => void
  updateComponent: (updates: Partial<ComponentDefinition>) => void
  
  // Slot management
  addSlot: (slot: Omit<ComponentSlot, 'id'>) => void
  updateSlot: (id: string, updates: Partial<ComponentSlot>) => void
  removeSlot: (id: string) => void
  selectSlots: (ids: string[]) => void
  
  // Background image
  setBackgroundImage: (dataUrl: string | undefined) => void
  
  // Dimensions
  setDimensions: (width: number, height: number) => void
}

export const useComponentStore = create<ComponentStore>()(
  immer((set) => ({
    currentComponent: null,
    selectedSlotIds: [],
    
    createComponent: (name, category) =>
      set((s) => {
        s.currentComponent = {
          id: uuid(),
          name,
          description: '',
          category,
          width: 54,  // Default width in mm
          height: 8,  // Default height in mm
          backgroundImage: undefined,
          layers: [],
          slots: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        s.selectedSlotIds = []
      }),
    
    loadComponent: (component) =>
      set((s) => {
        s.currentComponent = component
        s.selectedSlotIds = []
      }),
    
    closeComponent: () =>
      set((s) => {
        s.currentComponent = null
        s.selectedSlotIds = []
      }),
    
    updateComponent: (updates) =>
      set((s) => {
        if (!s.currentComponent) return
        Object.assign(s.currentComponent, updates, { updatedAt: new Date().toISOString() })
      }),
    
    addSlot: (slotData) =>
      set((s) => {
        if (!s.currentComponent) return
        const slot: ComponentSlot = {
          ...slotData,
          id: uuid()
        }
        s.currentComponent.slots.push(slot)
        s.selectedSlotIds = [slot.id]
      }),
    
    updateSlot: (id, updates) =>
      set((s) => {
        if (!s.currentComponent) return
        const slot = s.currentComponent.slots.find((sl) => sl.id === id)
        if (slot) {
          Object.assign(slot, updates)
          s.currentComponent.updatedAt = new Date().toISOString()
        }
      }),
    
    removeSlot: (id) =>
      set((s) => {
        if (!s.currentComponent) return
        s.currentComponent.slots = s.currentComponent.slots.filter((sl) => sl.id !== id)
        s.selectedSlotIds = s.selectedSlotIds.filter((sid) => sid !== id)
        s.currentComponent.updatedAt = new Date().toISOString()
      }),
    
    selectSlots: (ids) =>
      set((s) => {
        s.selectedSlotIds = ids
      }),
    
    setBackgroundImage: (dataUrl) =>
      set((s) => {
        if (!s.currentComponent) return
        s.currentComponent.backgroundImage = dataUrl
        s.currentComponent.updatedAt = new Date().toISOString()
      }),
    
    setDimensions: (width, height) =>
      set((s) => {
        if (!s.currentComponent) return
        s.currentComponent.width = Math.max(5, Math.min(200, width))
        s.currentComponent.height = Math.max(5, Math.min(200, height))
        s.currentComponent.updatedAt = new Date().toISOString()
      })
  }))
)
