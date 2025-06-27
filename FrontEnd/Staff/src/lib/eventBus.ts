// lib/eventBus.ts
type Callback = (...args: unknown[]) => void;

class EventBus {
  private events: Map<string, Set<Callback>> = new Map();

  on(event: string, callback: Callback) {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: Callback) {
    this.events.get(event)?.delete(callback);
  }

  emit(event: string, ...args: unknown[]) {
    this.events.get(event)?.forEach((callback) => callback(...args));
  }
}

const eventBus = new EventBus();
export default eventBus;
