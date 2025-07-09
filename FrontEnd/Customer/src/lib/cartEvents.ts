// lib/cartEvents.ts
type CartChangeCallback = () => void;

const subscribers = new Set<CartChangeCallback>();

export const subscribeToCartChange = (callback: CartChangeCallback) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

export const emitCartChange = () => {
  subscribers.forEach((cb) => cb());
};
