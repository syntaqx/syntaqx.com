import { describe, it, expect } from "vitest";
import {
  checkFor,
  decrypt,
  decryptBytes,
  encrypt,
  newKey,
  packFile,
  pageLink,
  parseFragment,
  parseLink,
  unpack,
} from "./secret-link";

const id = "pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M";

describe("secret-link", () => {
  it("round-trips through encryption, and rejects the wrong key", async () => {
    const key = newKey();
    expect(key).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const payload = await encrypt(key, "hunter2 ✓");
    expect(payload).not.toContain("hunter2");
    expect(await decrypt(key, payload)).toBe("hunter2 ✓");
    await expect(decrypt(newKey(), payload)).rejects.toThrow();
  });

  it("parses the links it makes", () => {
    const key = newKey();
    expect(parseLink(pageLink("https://www.syntaqx.com", id, key))).toEqual({
      kind: "browser",
      id,
      key,
    });
    expect(parseLink(pageLink("https://www.syntaqx.com", id))).toEqual({ kind: "browser", id });
    expect(parseFragment(`#${id}/${key}`)).toEqual({ kind: "browser", id, key });
  });

  it("parses API links and bare ids", () => {
    expect(parseLink(`https://api.syntaqx.com/secrets/${id}`)).toEqual({ kind: "api", id });
    expect(parseLink(`https://www.syntaqx.com/api/secrets/${id}`)).toEqual({ kind: "api", id });
    expect(parseLink(` ${id} `)).toEqual({ kind: "browser", id });
  });

  it("round-trips a file, and leaves text as text", async () => {
    const key = newKey();
    const bytes = crypto.getRandomValues(new Uint8Array(60 * 1024));
    const payload = await encrypt(key, packFile("kube\nconfig.yaml", "text/yaml", bytes));
    const file = unpack(await decryptBytes(key, payload));
    expect(file).toMatchObject({ kind: "file", name: "kube\nconfig.yaml", type: "text/yaml" });
    expect(file.kind === "file" && Array.from(file.bytes)).toEqual(Array.from(bytes));
    expect(unpack(new TextEncoder().encode('{"a":1}'))).toEqual({ kind: "text", text: '{"a":1}' });
  });

  it("derives a stable check that isn't the key", async () => {
    const key = newKey();
    const check = await checkFor(key);
    expect(check).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(check).not.toBe(key);
    expect(await checkFor(key)).toBe(check);
  });

  it("parses the api fragment a redirected browser lands on", () => {
    expect(parseFragment(`#api/${id}`)).toEqual({ kind: "api", id });
    expect(parseFragment("#api/nope")).toBeNull();
  });

  it("rejects anything else", () => {
    expect(parseLink("hunter2")).toBeNull();
    expect(parseLink("https://example.com/")).toBeNull();
    expect(parseFragment(`#${id}/short`)).toBeNull();
    expect(parseFragment("#nope")).toBeNull();
    expect(parseFragment("")).toBeNull();
  });
});
