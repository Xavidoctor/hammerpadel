export {};

declare global {
  interface ScrollCraftInstance {
    destroy?: () => void;
  }
  interface Window {
    ScrollCraft?: {
      mount: (root?: Element | Document | string, opts?: Record<string, unknown>) => ScrollCraftInstance;
      reduce: boolean;
      instances: ScrollCraftInstance[];
    };
  }
}
