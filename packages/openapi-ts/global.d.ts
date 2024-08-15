// global.d.ts

declare const Deno:
  | {
      version: { deno: string; typescript: string; v8: string };
      // Add more Deno-specific properties here if needed
    }
  | undefined;

declare const Bun:
  | {
      version: string;
      // Add more Bun-specific properties here if needed
    }
  | undefined;
