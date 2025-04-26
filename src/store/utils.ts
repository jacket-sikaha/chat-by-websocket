import { StoreApi, UseBoundStore } from 'zustand';

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(_store: S) => {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

// 中间件：state 每次发生变化都将输出日志
export const logger =
  (config: (arg0: (...args: any[]) => void, arg1: any, arg2: any) => any) =>
  (set: (...arg0: any[]) => void, get: () => any, api: any) =>
    config(
      (...args) => {
        console.log('  applying', args);
        set(...args);
        console.log('  new state', get());
      },
      get,
      api
    );
