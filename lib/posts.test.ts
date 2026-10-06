import { describe, it, expect } from "vitest";
import { getAllPosts } from "./posts";
import { POST_SCENES } from "./scene/scenes";
import { REST } from "./scene/iso";
import { scenes } from "./scene/scenes";
import { levels, rasterize } from "./scene/raster";

describe("feature post heroes", () => {
  const features = getAllPosts().filter((p) => p.layout === "feature");

  it("gives every feature post a hero scene", () => {
    expect(features.length).toBeGreaterThan(0);
    for (const post of features) expect(post.hero, post.slug).toBeDefined();
  });

  it("never shares a hero between posts", () => {
    const heroes = features.map((p) => p.hero);
    expect(new Set(heroes).size).toBe(heroes.length);
  });

  it("only allows post scenes, never page scenes like the home art", () => {
    expect(POST_SCENES).not.toContain("system");
  });
});

describe("scene rasterizer", () => {
  it("draws every scene with visible tiles and some accent", () => {
    for (const [name, fn] of Object.entries(scenes)) {
      const { field } = rasterize(fn(REST), 120, 90, 0);
      const lv = levels(field);
      expect(
        lv.some((v) => v > 0),
        name,
      ).toBe(true);
      expect(
        field.acc.some((v) => v > 0),
        name,
      ).toBe(true);
    }
  });
});
