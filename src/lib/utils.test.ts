import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conflicting tailwind classes", () => {
    // twMerge should resolve conflicts, keeping the last one
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("should filter out falsy values", () => {
    const result = cn("text-sm", false, "font-bold", null, undefined);
    expect(result).toBe("text-sm font-bold");
  });

  it("should handle arrays of classes", () => {
    const result = cn(["text-sm", "font-bold"], "text-center");
    expect(result).toBe("text-sm font-bold text-center");
  });

  it("should handle objects with conditional classes", () => {
    const result = cn({
      "text-red-500": true,
      "bg-blue-500": false,
      "font-bold": true,
    });
    expect(result).toBe("text-red-500 font-bold");
  });

  it("should return empty string for no arguments", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
