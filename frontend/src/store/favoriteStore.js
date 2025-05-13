import { create } from 'zustand';
import { checkFavoriteSong, toggleFavoriteSong } from '../services/musicApi';

const useFavoriteStore = create((set, get) => ({
  favoriteSongs: new Map(),
  
  // Kiểm tra trạng thái yêu thích của một bài hát
  checkFavoriteStatus: async (songId) => {
    if (!songId) return;
    
    try {
      const response = await checkFavoriteSong(songId);
      set((state) => {
        const newMap = new Map(state.favoriteSongs);
        newMap.set(Number(songId), response.is_favorite);
        return { favoriteSongs: newMap };
      });
      return response.is_favorite;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
      return false;
    }
  },
  
  // Toggle trạng thái yêu thích của một bài hát
  toggleFavorite: async (songId) => {
    if (!songId) return false;
    
    try {
      const response = await toggleFavoriteSong(songId);
      set((state) => {
        const newMap = new Map(state.favoriteSongs);
        newMap.set(Number(songId), response.is_favorite);
        return { favoriteSongs: newMap };
      });
      return response.is_favorite;
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
      return get().favoriteSongs.get(Number(songId)) || false;
    }
  },
  
  // Kiểm tra xem một bài hát có được yêu thích không
  isFavorite: (songId) => {
    return get().favoriteSongs.get(Number(songId)) || false;
  },
}));

export default useFavoriteStore;