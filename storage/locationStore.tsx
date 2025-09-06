import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { storage } from './storage';
import { Location } from '@/types';

const defaultLocation: Location = {
  id: '',
  name: '',
};

interface LocationState {
  data: Location;
  isLoading: boolean;
  isLoaded: boolean;
}

type LocationAction =
  | { type: 'SET_LOCATION_DATA'; payload: Location }
  | { type: 'UPDATE_LOCATION_DATA'; payload: Partial<Location> }
  | { type: 'CLEAR_LOCATION_DATA' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADED'; payload: boolean };

interface LocationContextType {
  state: LocationState;
  setLocation: (data: Location) => void;
  updateLocation: (data: Partial<Location>) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'location_data';

function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'SET_LOCATION_DATA':
      return {
        ...state,
        data: action.payload
      };
    case 'UPDATE_LOCATION_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload }
      };
    case 'CLEAR_LOCATION_DATA':
      return {
        ...state,
        data: defaultLocation
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

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [state, dispatch] = useReducer(locationReducer, {
    data: defaultLocation,
    isLoading: true,
    isLoaded: false
  });

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const storedData = await storage.getItem(STORAGE_KEY);
        
        if (storedData) {
          const parsedData = JSON.parse(storedData) as Location;
          if (parsedData && typeof parsedData === 'object' &&
              'name' in parsedData && 'id' in parsedData) {
            dispatch({ type: 'SET_LOCATION_DATA', payload: parsedData });
          }
        }
      } catch (error) {
        console.warn('Failed to load location data from storage:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_LOADED', payload: true });
      }
    };

    loadStoredData();
  }, []);

  useEffect(() => {
    const saveToStorage = async () => {
      if (!state.isLoaded) return;
      
      try {
        await storage.setItem(STORAGE_KEY, JSON.stringify(state.data));
      } catch (error) {
        console.warn('Failed to save location data to storage:', error);
      }
    };

    saveToStorage();
  }, [state.data, state.isLoaded]);

  const setLocation = (data: Location) => {
    dispatch({ type: 'SET_LOCATION_DATA', payload: data });
  };

  const updateLocation = (data: Partial<Location>) => {
    dispatch({ type: 'UPDATE_LOCATION_DATA', payload: data });
  };

  const clearLocation = async () => {
    try {
      await storage.removeItem(STORAGE_KEY);
      dispatch({ type: 'CLEAR_LOCATION_DATA' });
    } catch (error) {
      console.warn('Failed to clear location data from storage:', error);
      dispatch({ type: 'CLEAR_LOCATION_DATA' });
    }
  };

  const contextValue: LocationContextType = {
    state,
    setLocation,
    updateLocation,
    clearLocation
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationStore() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationStore must be used within a LocationProvider');
  }
  return context;
}
