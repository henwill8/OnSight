import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { storage } from './storage';

interface StoreState<T> {
  data: T;
  isLoading: boolean;
  isLoaded: boolean;
}

type StoreAction<T> =
  | { type: 'SET_DATA'; payload: T }
  | { type: 'UPDATE_DATA'; payload: Partial<T> }
  | { type: 'CLEAR_DATA' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADED'; payload: boolean };

interface StoreContextType<T> {
  state: StoreState<T>;
  data: T;
  setData: (data: T) => void;
  updateData: (data: Partial<T>) => void;
  clearData: () => void;
}

function createStoreReducer<T>(defaultValue: T) {
  return function storeReducer(state: StoreState<T>, action: StoreAction<T>): StoreState<T> {
    switch (action.type) {
      case 'SET_DATA':
        return {
          ...state,
          data: action.payload
        };
      case 'UPDATE_DATA':
        return {
          ...state,
          data: { ...state.data, ...action.payload }
        };
      case 'CLEAR_DATA':
        return {
          ...state,
          data: defaultValue
        };
      case 'SET_LOADING':
        return {
          ...state,
          isLoading: action.payload
        };
      case 'SET_LOADED':
        return {
          ...state,
          isLoaded: action.payload
        };
      default:
        return state;
    }
  };
}

interface StoreConfig<T> {
  storageKey: string;
  defaultValue: T;
  contextName: string;
}

interface StoreProviderProps {
  children: ReactNode;
}

export function createStore<T>(config: StoreConfig<T>) {
  const { storageKey, defaultValue, contextName } = config;
  
  const StoreContext = createContext<StoreContextType<T> | undefined>(undefined);
  
  const reducer = createStoreReducer(defaultValue);

  function StoreProvider({ children }: StoreProviderProps) {
    const [state, dispatch] = useReducer(reducer, {
      data: defaultValue,
      isLoading: true,
      isLoaded: false
    });

    // Load data from storage on mount
    useEffect(() => {
      const loadStoredData = async () => {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const storedData = await storage.getItem(storageKey);

          if (storedData) {
            const parsedData = JSON.parse(storedData) as T;
            dispatch({ type: 'SET_DATA', payload: parsedData });
          } else {
            console.log(`No stored ${contextName} found. Using default value.`);
          }
        } catch (error) {
          console.warn(`Failed to load ${contextName} data from storage:`, error);
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_LOADED', payload: true });
        }
      };

      loadStoredData();
    }, []);

    // Save to storage whenever data changes (but not during initial load)
    useEffect(() => {
      const saveToStorage = async () => {
        if (!state.isLoaded) return; // Don't save during initial load

        try {
          await storage.setItem(storageKey, JSON.stringify(state.data));
        } catch (error) {
          console.warn(`Failed to save ${contextName} data to storage:`, error);
        }
      };

      saveToStorage();
    }, [state.data, state.isLoaded]);

    const setData = (data: T) => {
      dispatch({ type: 'SET_DATA', payload: data });
    };

    const updateData = (data: Partial<T>) => {
      dispatch({ type: 'UPDATE_DATA', payload: data });
    };

    const clearData = async () => {
      try {
        await storage.removeItem(storageKey);
        dispatch({ type: 'CLEAR_DATA' });
      } catch (error) {
        console.warn(`Failed to clear ${contextName} data from storage:`, error);
        // Still clear the state even if storage fails
        dispatch({ type: 'CLEAR_DATA' });
      }
    };

    const contextValue: StoreContextType<T> = {
      state,
      data: state.data,
      setData,
      updateData,
      clearData
    };

    return (
      <StoreContext.Provider value={contextValue}>
        {children}
      </StoreContext.Provider>
    );
  }

  function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
      throw new Error(`useStore must be used within a ${contextName}Provider`);
    }
    return context;
  }

  return {
    Provider: StoreProvider,
    useStore
  };
}