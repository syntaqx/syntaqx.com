import { describe, it, expect } from "vitest";
import { buildInfo } from "./build-info";

const sha = "0123456789abcdef0123456789abcdef01234567";

describe("buildInfo", () => {
  it("shows a production deploy's commit with no label", () => {
    expect(buildInfo({ VERCEL_GIT_COMMIT_SHA: sha, VERCEL_ENV: "production" })).toEqual({
      sha,
      dirty: false,
      label: null,
    });
  });

  it("labels a preview deploy", () => {
    expect(buildInfo({ VERCEL_GIT_COMMIT_SHA: sha, VERCEL_ENV: "preview" })).toEqual({
      sha,
      dirty: false,
      label: "preview",
    });
  });

  it("reads the local commit from git and labels it dev", () => {
    const info = buildInfo({});
    expect(info?.sha).toMatch(/^[0-9a-f]{40}$/);
    expect(info?.label).toBe("dev");
    expect(typeof info?.dirty).toBe("boolean");
  });
});
