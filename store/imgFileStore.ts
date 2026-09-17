import { create } from 'zustand';

export interface AvatarFile {
  uri: string;
  name: string;
  type: string;
}

interface ImgFileState {
  pendingAvatar: AvatarFile | null;
  avatarVersion: number;
  setPendingAvatar: (file: AvatarFile | null) => void;
  clearPendingAvatar: () => void;
}

const useImgFileStore = create<ImgFileState>((set) => ({
  pendingAvatar: null,
  avatarVersion: 0,
  setPendingAvatar: (file) => set({ pendingAvatar: file }),
  clearPendingAvatar: () =>
    set((state) => ({
      pendingAvatar: null,
      // The server can replace an image without changing its filename.
      avatarVersion: state.avatarVersion + 1,
    })),
}));

export default useImgFileStore;
