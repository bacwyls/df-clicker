import { create } from 'zustand'
import { ServiceApi } from '@dartfrog/puddle';

type ClickMap = Record<string, number>;

export interface ClickerStore {
  clickMap: ClickMap;
  setClickMap: (newClickMap: ClickMap) => void;
  sendClick: (api: ServiceApi) => void;
  handleUpdate: (update: any) => void;
  get: () => ClickerStore;
  set: (partial: ClickerStore | Partial<ClickerStore>) => void;
}

const useClickerStore = create<ClickerStore>((set, get) => ({
  clickMap: {},
  setClickMap: (newClickMap) => set({ clickMap: newClickMap }),
  sendClick: (api: ServiceApi) => {
    let req = {
      "Clicker": "Click"
    };
    api.sendToService(req);

  },
  handleUpdate: (update) => {
    if (update && typeof update === 'object') {
      if ('ClickMap' in update) {
        set({ clickMap: update.ClickMap as ClickMap });
      } else if ('ClickMapNode' in update) {
        const [ id, count ] = update.ClickMapNode;
        set((state) => ({
          clickMap: {
            ...state.clickMap,
            [id]: count
          }
        }));
      }
    }
  },
  get,
  set,
}));

export default useClickerStore;

