import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RouteData {
  imageUri: string | null;
  annotations: string | null;
}

interface RouteStoreContextType {
  routeData: RouteData;
  setRouteData: (data: RouteData) => void;
  resetRouteData: () => void;
  updateImageUri: (imageUri: string | null) => void;
  updateAnnotations: (annotations: string | null) => void;
}

const RouteStoreContext = createContext<RouteStoreContextType | undefined>(undefined);

const initialRouteData: RouteData = {
  imageUri: null,
  annotations: null,
};

export const RouteStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [routeData, setRouteData] = useState<RouteData>(initialRouteData);

  const resetRouteData = () => {
    setRouteData(initialRouteData);
  };

  const updateImageUri = (imageUri: string | null) => {
    setRouteData(prev => ({ ...prev, imageUri }));
  };

  const updateAnnotations = (annotations: string | null) => {
    setRouteData(prev => ({ ...prev, annotations }));
  };

  return (
    <RouteStoreContext.Provider
      value={{
        routeData,
        setRouteData,
        resetRouteData,
        updateImageUri,
        updateAnnotations,
      }}
    >
      {children}
    </RouteStoreContext.Provider>
  );
};

export const useRouteStore = (): RouteStoreContextType => {
  const context = useContext(RouteStoreContext);
  if (context === undefined) {
    throw new Error('useRouteStore must be used within a RouteStoreProvider');
  }
  return context;
};
