import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { storage } from './storage';
import { Gym } from '@/types';
import { parse } from 'react-native-svg';

const defaultGym: Gym = {
  id: '',
  name: '',
  location: ''
};

interface GymState {
  data: Gym;
  isLoading: boolean;
  isLoaded: boolean;
}

type GymAction =
  | { type: 'SET_GYM_DATA'; payload: Gym }
  | { type: 'UPDATE_GYM_DATA'; payload: Partial<Gym> }
  | { type: 'CLEAR_GYM_DATA' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADED'; payload: boolean };

interface GymContextType {
  state: GymState;
  setGym: (data: Gym) => void;
  updateGym: (data: Partial<Gym>) => void;
  clearGym: () => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

const STORAGE_KEY = 'gym_data';

function gymReducer(state: GymState, action: GymAction): GymState {
  switch (action.type) {
    case 'SET_GYM_DATA':
      return {
        ...state,
        data: action.payload
      };
    case 'UPDATE_GYM_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload }
      };
    case 'CLEAR_GYM_DATA':
      return {
        ...state,
        data: defaultGym
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
}

interface GymProviderProps {
  children: ReactNode;
}

export function GymProvider({ children }: GymProviderProps) {
  const [state, dispatch] = useReducer(gymReducer, {
    data: defaultGym,
    isLoading: true,
    isLoaded: false
  });

  // Load data from storage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const storedData = await storage.getItem(STORAGE_KEY);
  
        if (storedData) {
          const parsedData = JSON.parse(storedData) as Gym;

          dispatch({ type: 'SET_GYM_DATA', payload: parsedData });
        } else {
          console.log('No stored gym found. Leaving defaultGym as initial.');
          // Leave defaultGym as initial state
        }
      } catch (error) {
        console.warn('Failed to load gym data from storage:', error);
        // Do not reset state to default here
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
        await storage.setItem(STORAGE_KEY, JSON.stringify(state.data));
      } catch (error) {
        console.warn('Failed to save gym data to storage:', error);
      }
    };

    saveToStorage();
  }, [state.data, state.isLoaded]);

  const setGym = (data: Gym) => {
    dispatch({ type: 'SET_GYM_DATA', payload: data });
  };

  const updateGym = (data: Partial<Gym>) => {
    dispatch({ type: 'UPDATE_GYM_DATA', payload: data });
  };

  const clearGym = async () => {
    try {
      await storage.removeItem(STORAGE_KEY);
      dispatch({ type: 'CLEAR_GYM_DATA' });
    } catch (error) {
      console.warn('Failed to clear gym data from storage:', error);
      // Still clear the state even if storage fails
      dispatch({ type: 'CLEAR_GYM_DATA' });
    }
  };

  const contextValue: GymContextType = {
    state,
    setGym,
    updateGym,
    clearGym
  };

  return (
    <GymContext.Provider value={contextValue}>
      {children}
    </GymContext.Provider>
  );
}

// Custom hook for using the gym store
export function useGymStore() {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error('useGymStore must be used within a GymProvider');
  }
  return context;
}