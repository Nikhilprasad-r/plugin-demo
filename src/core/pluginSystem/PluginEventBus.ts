import { PluginEventBusType } from '@/core/pluginSystem/types/pluginTypes';

export class PluginEventBus implements PluginEventBusType {
  private events: Map<string, Set<Function>> = new Map();

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  public subscribe<T = any>(event: string, callback: (data?: T) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => this.unsubscribe(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  public unsubscribe(event: string, callback: Function): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      
      // Clean up empty sets
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Publish an event with optional data
   */
  public publish<T = any>(event: string, data?: T): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }
}