import { useEffect, useRef, useCallback } from 'react';
import { usePluginSystem } from '../PluginContext';
import { UsePluginEventsReturn } from '@/core/pluginSystem/types/pluginTypes';

type EventCallback<T = any> = (data?: T) => void;

export const usePluginEvents = (): UsePluginEventsReturn => {
  const { eventBus } = usePluginSystem();

  // Track all active subscriptions to clean them up on unmount
  const subscriptionsRef = useRef<Array<() => void>>([]);

  const subscribe = useCallback(<T = any>(
    event: string,
    callback: EventCallback<T>
  ): void => {
    const unsubscribe = eventBus.subscribe<T>(event, callback);
    subscriptionsRef.current.push(unsubscribe);
  }, [eventBus]);

  const publish = useCallback(<T = any>(
    event: string,
    data?: T
  ): void => {
    eventBus.publish<T>(event, data);
  }, [eventBus]);

  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, []);

  return {
    subscribe,
    publish,
  };
};
