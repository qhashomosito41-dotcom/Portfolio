import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { getHomeData } from '../services/publicApi';
import { useApiQuery } from '../hooks/useApiQuery';
import type { HomeData } from '../types';

type PublicDataValue = {
  data: HomeData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  setData: (updater: HomeData | ((current: HomeData | null) => HomeData | null)) => void;
};

const PublicDataContext = createContext<PublicDataValue | null>(null);

export const PublicDataProvider = ({ children }: { children: ReactNode }) => {
  const query = useApiQuery<HomeData>(() => getHomeData(), []);
  const value = useMemo(
    () => ({
      data: query.data,
      loading: query.loading,
      error: query.error,
      refetch: query.refetch,
      setData: query.setData,
    }),
    [query.data, query.loading, query.error, query.refetch, query.setData],
  );

  return <PublicDataContext.Provider value={value}>{children}</PublicDataContext.Provider>;
};

export const usePublicData = () => {
  const context = useContext(PublicDataContext);
  if (!context) throw new Error('usePublicData must be used inside PublicDataProvider');
  return context;
};
