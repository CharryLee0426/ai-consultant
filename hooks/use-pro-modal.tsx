import { create } from "zustand";

interface useProModalSore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useProModal = create<useProModalSore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));