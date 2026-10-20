import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError } from '../services/api';

type QueryState<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | Error | null;
};

export const useApiQuery = <T>(loader: () => Promise<T>, deps: unknown[] = []) => {
  const [state, setState] = useState<QueryState<T>>({ data: null, loading: true, error: null });
  const [version, setVersion] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    loaderRef
      .current()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setState((current) => ({ ...current, loading: false, error }));
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...deps]);

  const refetch = useCallback(() => setVersion((value) => value + 1), []);
  const setData = useCallback(
    (updater: T | ((current: T | null) => T | null)) => {
      setState((current) => ({
        ...current,
        data:
          typeof updater === 'function'
            ? (updater as (current: T | null) => T | null)(current.data)
            : updater,
      }));
    },
    [],
  );

  return { ...state, refetch, setData };
};
