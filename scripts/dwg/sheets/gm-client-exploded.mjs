// The layers of a game client as an exploded axonometric stack. Plate
// contents are schematic modules, one per item in the layer's sub-line.
// Embedded in content/books/gaming/building-an-engine.md (opening).
import { sheet } from "../kit.mjs";

// Plate 300 x 200; with a 66 step, a lower plate shows only local y > ~80,
// so every module sits in the front band y 88..186.
const W = 300, D = 200;

const layers = [
  {
    label: "L0 · Platform",
    sub: "OS · input devices · graphics API · audio",
    draw: (p) => [
      // OS: a process box with its threads.
      p.rect(16, 96, 58, 84, "obj fill-2"),
      p.line(28, 112, 28, 166, "ext"), p.line(40, 112, 40, 166, "ext"), p.line(52, 112, 52, 166, "ext"), p.line(64, 112, 64, 166, "ext"),
      // Input devices: ports.
      p.rect(86, 96, 58, 84, "obj fill-2"),
      ...[112, 136, 160].map((y) => p.circle(115, y, 7, "slot")),
      // Graphics API: a command buffer.
      p.rect(156, 96, 58, 84, "obj fill-2"),
      ...[110, 124, 138, 152, 166].map((y) => p.rect(166, y - 4, 38, 8, "obj fill-1")),
      // Audio: mixer channels.
      p.rect(226, 96, 58, 84, "obj fill-2"),
      ...[238, 250, 262, 274].map((x, i) => p.line(x, 172, x, 120 + i * 9, "obj")),
    ],
  },
  {
    label: "L1 · Engine core",
    sub: "memory · jobs · assets · time",
    draw: (p) => [
      // Memory: allocator pages.
      ...[0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => p.rect(16 + c * 20, 96 + r * 22, 16, 18, r === 1 && c === 2 ? "obj fill-1" : "obj fill-2"))),
      // Jobs: worker lanes with queued jobs.
      ...[104, 130, 156].flatMap((y, i) => [p.line(90, y, 168, y, "ctr"), p.rect(96 + i * 14, y - 7, 26, 14, "obj fill-1"), p.rect(130 + i * 6, y - 7, 18, 14, "obj fill-2")]),
      // Assets: a stack of packages.
      p.rect(186, 112, 44, 60, "obj fill-2"), p.rect(192, 104, 44, 60, "obj fill-2"), p.rect(198, 96, 44, 60, "obj fill-1"),
      // Time: the clock.
      p.circle(268, 140, 20, "obj fill-2"), p.line(268, 140, 268, 126, "obj"), p.line(268, 140, 279, 146, "obj"),
    ],
  },
  {
    label: "L2 · Simulation",
    sub: "fixed-step world · physics · AI",
    draw: (p) => [
      // Fixed-step world: the grid it advances in steps.
      p.rect(16, 92, 120, 92, "obj fill-2"),
      ...[46, 76, 106].map((x) => p.line(x, 92, x, 184, "ext")),
      ...[115, 138, 161].map((y) => p.line(16, y, 136, y, "ext")),
      // Physics: bodies and a contact.
      p.rect(150, 92, 60, 92, "obj fill-2"),
      p.circle(170, 120, 10, "obj fill-1"), p.circle(188, 134, 10, "obj fill-1"), p.rect(160, 158, 40, 14, "obj fill-1"),
      // AI: a behavior graph.
      p.rect(224, 92, 60, 92, "obj fill-2"),
      p.line(254, 110, 238, 138, "obj"), p.line(254, 110, 270, 138, "obj"), p.line(238, 138, 246, 166, "obj"), p.line(270, 138, 262, 166, "obj"),
      ...[[254, 110], [238, 138], [270, 138], [246, 166], [262, 166]].map(([x, y]) => p.circle(x, y, 4, "dot")),
    ],
  },
  {
    label: "L3 · Rendering",
    sub: "scene · draw submission · GPU resources",
    draw: (p) => [
      // Scene: a node tree.
      p.rect(16, 92, 80, 92, "obj fill-2"),
      p.line(56, 108, 34, 136, "obj"), p.line(56, 108, 78, 136, "obj"), p.line(78, 136, 66, 164, "obj"), p.line(78, 136, 90, 164, "obj"),
      ...[[56, 108], [34, 136], [78, 136], [66, 164], [90, 164]].map(([x, y]) => p.rect(x - 5, y - 5, 10, 10, "obj fill-1")),
      // Draw submission: the ordered draw list.
      p.rect(110, 92, 80, 92, "obj fill-2"),
      ...[102, 116, 130, 144, 158, 172].map((y, i) => p.rect(118, y, 64 - (i % 3) * 12, 8, "obj fill-1")),
      // GPU resources: buffers and textures held on the device.
      p.rect(204, 92, 80, 92, "obj fill-2"),
      p.rect(214, 102, 28, 28, "slot"), p.rect(250, 102, 26, 28, "slot"), p.rect(214, 140, 62, 34, "slot"),
    ],
  },
  {
    label: "L4 · UI",
    sub: "menus · HUD · input focus",
    draw: (p) => [
      // HUD: corner anchors around the whole screen.
      p.path("M10,30V10H30M270,10H290V30M290,170V190H270M30,190H10V170", "obj"),
      // Menu: a list of rows, one with input focus.
      p.rect(40, 90, 110, 92, "obj fill-2"),
      ...[100, 120, 140, 160].map((y) => p.rect(50, y, 90, 14, "obj fill-1")),
      p.rect(45, 116, 100, 22, "slot"),
      // HUD widgets.
      p.rect(170, 150, 50, 22, "obj fill-2"), p.rect(230, 150, 50, 22, "obj fill-2"), p.circle(255, 112, 16, "obj fill-2"),
    ],
  },
  {
    label: "L5 · Game code",
    sub: "rules · content · modes",
    draw: (p) => [
      // Rules: the script.
      p.rect(16, 30, 120, 150, "obj fill-2"),
      ...[46, 62, 78, 94, 110, 126, 142, 158].map((y, i) => p.line(28 + (i % 3) * 10, y, 120 - (i % 4) * 14, y, "obj")),
      // Content: the data it reads.
      ...[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => p.rect(152 + c * 22, 30 + r * 22, 18, 18, "obj fill-1"))),
      // Modes: the selectable modes.
      ...[112, 136, 160].map((y) => p.rect(152, y, 132, 16, "obj fill-2", 8)),
    ],
  },
];

export default function draw() {
  const s = sheet({ prefix: "gm-cx", width: 760 });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "A layer calls only the layers beneath it; only the platform layer touches the OS and devices."],
    [0, "Not to scale. Layers separated along the stack axis; plate contents are schematic."],
  ], { width: 690 });

  const gap = 66, top = (layers.length - 1) * gap;
  const tx = 360, ty = ny + 24 + top;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap, labelX: 250, layers });

  // Call direction, beside the stack.
  const ax = P(W, 0, 0)[0] + 40;
  const [, yTop] = P(W, 0, top);
  const [, yBot] = P(W, D, 0);
  s.comment("Call direction");
  s.path(`M${ax},${yTop}V${yBot}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
  s.text(ax, yTop - 18, "calls go", "sl ink", "middle");
  s.text(ax, yTop - 7, "down", "sl ink", "middle");
  s.nb(ax + 30, yTop - 10.5, 1);

  const left = P(0, D, 0)[0];
  s.viewTitle((left + P(W, 0, 0)[0]) / 2, yBot + 34, "Exploded view · game client", "Axonometric · not to scale · L0 at the bottom");
  s.height = Math.ceil(yBot + 34 + 13 + 28);
  return s.toString();
}
