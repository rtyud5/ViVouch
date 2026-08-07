import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  getInitialCooldownSeconds,
  readStoredFlow,
  writeStoredFlow,
} from "./recoveryFlowStorage";

describe("recoveryFlowStorage", () => {
  const storage = new Map();

  beforeEach(() => {
    storage.clear();
    globalThis.sessionStorage = {
      getItem: vi.fn((key) => storage.get(key) ?? null),
      setItem: vi.fn((key, value) => storage.set(key, String(value))),
      removeItem: vi.fn((key) => storage.delete(key)),
      clear: vi.fn(() => storage.clear()),
    };
  });

  afterEach(() => {
    delete globalThis.sessionStorage;
  });

  it("round-trips stored recovery flow state", () => {
    writeStoredFlow("flow-key", { email: "test@example.com", step: "RESET", cooldownUntil: 123 });

    expect(readStoredFlow("flow-key")).toEqual({
      email: "test@example.com",
      step: "RESET",
      cooldownUntil: 123,
    });
  });

  it("returns zero when cooldown is expired or missing", () => {
    expect(getInitialCooldownSeconds(0)).toBe(0);
    expect(getInitialCooldownSeconds(Number.NaN)).toBe(0);
    expect(getInitialCooldownSeconds(Date.now() - 1000)).toBe(0);
  });

  it("returns remaining seconds for an active cooldown", () => {
    const future = Date.now() + 4500;
    const remaining = getInitialCooldownSeconds(future);

    expect(remaining).toBeGreaterThanOrEqual(4);
    expect(remaining).toBeLessThanOrEqual(5);
  });
});
