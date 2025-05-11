import { useEffect, useCallback } from 'react';
import { usePluginSystem } from '../PluginContext';
import { UsePluginEventsReturn } from '@/core/pluginSystem/types/pluginTypes';



export const usePluginEvents = (): UsePluginEventsReturn => {
  const { eventBus } = usePluginSystem();
  
  /**
   * Subscribe to plugin events with automatic cleanup
   */
  const subscribe = useCallback(<T = any>(
    event: string, 
    callback: (data?: T) => void
  ): void => {
    const unsubscribe = eventBus.subscribe<T>(event, callback);
    
    // Clean up subscription when component unmounts
    useEffect(() => {
      return () => unsubscribe();
    }, [unsubscribe]);
  }, [eventBus]);
  
  /**
   * Publish an event to the plugin system
   */
  const publish = useCallback(<T = any>(
    event: string,
    data?: T
  ): void => {
    eventBus.publish<T>(event, data);
  }, [eventBus]);

  return {
    subscribe,
    publish
  };
};
