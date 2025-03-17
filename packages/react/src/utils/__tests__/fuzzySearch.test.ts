import { fuzzySearch } from "../fuzzySearch";

describe("fuzzySearch", () => {
  // Basic matching cases
  test("exact match returns true", () => {
    expect(fuzzySearch("hello", "hello")).toBe(true);
  });

  test("substring match returns true", () => {
    expect(fuzzySearch("hell", "hello")).toBe(true);
  });

  test("characters in order with other characters in between returns true", () => {
    expect(fuzzySearch("hlo", "hello")).toBe(true);
    expect(fuzzySearch("wrld", "world")).toBe(true);
  });

  test("query with widely spaced characters returns true", () => {
    expect(fuzzySearch("hd", "hello world")).toBe(true);
    expect(fuzzySearch("hw", "hello world")).toBe(true);
  });

  // Case sensitivity tests
  test("case insensitive - query lowercase, target uppercase returns true", () => {
    expect(fuzzySearch("hello", "HELLO")).toBe(true);
  });

  test("case insensitive - query uppercase, target lowercase returns true", () => {
    expect(fuzzySearch("HELLO", "hello")).toBe(true);
  });

  test("case insensitive - mixed case query and target returns true", () => {
    expect(fuzzySearch("HeLLo", "hEllO")).toBe(true);
  });

  // Edge cases
  test("empty query returns true for any target", () => {
    expect(fuzzySearch("", "hello")).toBe(true);
    expect(fuzzySearch("", "")).toBe(true);
  });

  test("non-empty query and empty target returns false", () => {
    expect(fuzzySearch("hello", "")).toBe(false);
  });

  test("query longer than target returns false", () => {
    expect(fuzzySearch("helloworld", "hello")).toBe(false);
  });

  test("works with special characters", () => {
    expect(fuzzySearch("h!@#", "h!@#")).toBe(true);
    expect(fuzzySearch("h!@", "h!@#")).toBe(true);
    expect(fuzzySearch("!@#", "h!@#")).toBe(true);
    expect(fuzzySearch("h@#", "h!@#")).toBe(true);
  });

  // Negative cases
  test("characters present but in wrong order returns false", () => {
    expect(fuzzySearch("ehllo", "hello")).toBe(false);
    expect(fuzzySearch("dlrow", "world")).toBe(false);
  });

  test("not all query characters in target returns false", () => {
    expect(fuzzySearch("helloz", "hello")).toBe(false);
    expect(fuzzySearch("xyz", "hello")).toBe(false);
  });

  // Additional realistic examples
  test("realistic search examples", () => {
    expect(fuzzySearch("react", "Advanced React Components")).toBe(true);
    expect(fuzzySearch("adrc", "Advanced React Components")).toBe(true);
    expect(fuzzySearch("adc", "Advanced React Components")).toBe(true);
    expect(fuzzySearch("arc", "Advanced React Components")).toBe(true);
    expect(fuzzySearch("axz", "Advanced React Components")).toBe(false); // 'x' and 'z' not present
  });

  test("works with numbers", () => {
    expect(fuzzySearch("123", "12345")).toBe(true);
    expect(fuzzySearch("135", "12345")).toBe(true);
    expect(fuzzySearch("246", "12345")).toBe(false);
  });
});
