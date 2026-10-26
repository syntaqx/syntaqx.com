// Renders the resume (lib/resume.ts) as a PDF in the site's type system:
// Big Shoulders for the name, Michroma for section labels, Hanken Grotesk
// for everything you read. One column of real, selectable text, so
// applicant tracking systems can parse it. Used by the /resume.pdf route
// (public contact details) and scripts/resume-pdf.mts (the private copy).
import path from "node:path";
import type { ReactNode } from "react";
import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { resume, type ResumeContact, type ResumeJob } from "@/lib/resume";

const fontFile = (family: string, weight: number) =>
  path.join(
    process.cwd(),
    `node_modules/@fontsource/${family}/files/${family}-latin-${weight}-normal.woff`,
  );

Font.register({
  family: "Hanken Grotesk",
  fonts: [400, 500, 600, 700].map((w) => ({
    src: fontFile("hanken-grotesk", w),
    fontWeight: w,
  })),
});
Font.register({
  family: "Big Shoulders",
  src: fontFile("big-shoulders-display", 800),
  fontWeight: 800,
});
Font.register({ family: "Michroma", src: fontFile("michroma", 400) });
// Break lines between words only; never hyphenate.
Font.registerHyphenationCallback((word) => [word]);

// Print colors: the site's teal, darkened until it holds up on paper.
const INK = "#121718";
const BODY = "#323b3d";
const MUTED = "#6c7779";
const RULE = "#d5dcdb";
const ACCENT = "#00877f";

const s = StyleSheet.create({
  page: {
    fontFamily: "Hanken Grotesk",
    fontSize: 9,
    lineHeight: 1.4,
    color: BODY,
    // Ligatures fuse "fi"/"fl" into one glyph, and text extraction (what an
    // applicant tracking system reads) then drops a letter: "frst".
    fontFeatureSettings: { liga: false, clig: false },
    // A 2/3in top margin. It also lands the page break inside a role, never
    // on a new one (see the page-break test in lib/resume.test.ts).
    paddingTop: 48,
    paddingBottom: 36,
    paddingHorizontal: 54,
  },
  name: {
    fontFamily: "Big Shoulders",
    fontWeight: 800,
    fontSize: 34,
    lineHeight: 1,
    letterSpacing: 0.4,
    color: INK,
    textTransform: "uppercase",
  },
  title: { fontSize: 11.5, fontWeight: 500, color: ACCENT, marginTop: 6 },
  contact: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 9,
    fontSize: 8.8,
    color: MUTED,
  },
  contactLink: { color: INK, textDecoration: "none" },
  sep: { marginHorizontal: 6, color: RULE },
  headerRule: { height: 2, width: 36, backgroundColor: ACCENT, marginTop: 14 },
  section: { marginTop: 18 },
  sectionHead: { flexDirection: "row", alignItems: "center", marginBottom: 9 },
  label: {
    fontFamily: "Michroma",
    fontSize: 7,
    // Wide tracking extracts as "S U M M A R Y", which parsers don't
    // recognize as a section; keep it tight enough to read as one word.
    letterSpacing: 0.5,
    color: ACCENT,
    textTransform: "uppercase",
  },
  labelRule: { flex: 1, height: 0.75, backgroundColor: RULE, marginLeft: 10 },
  para: { marginBottom: 7 },
  skill: {
    flexDirection: "row",
    paddingVertical: 2.5,
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
  },
  skillLabel: { width: 124, fontWeight: 600, color: INK },
  skillItems: { flex: 1 },
  job: { marginBottom: 8 },
  jobHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  headline: { flex: 1, fontSize: 10.8 },
  role: { fontWeight: 700, color: INK },
  company: { fontSize: 9.6, fontWeight: 600, color: ACCENT, marginTop: 1 },
  // Nudged onto the title's baseline (react-pdf aligns tops, not baselines),
  // so text extraction reads the title and its dates as one line.
  dates: {
    fontSize: 8.6,
    color: MUTED,
    marginLeft: 12,
    position: "relative",
    top: 2.2,
  },
  progression: { marginTop: 2, fontSize: 8.6, color: MUTED },
  // Gaps inside an entry stay under 1.4x a line, or parsers split it in two.
  bullets: { marginTop: 2 },
  bullet: { flexDirection: "row", marginBottom: 2 },
  dot: {
    width: 3.5,
    height: 3.5,
    backgroundColor: ACCENT,
    marginTop: 5,
    marginRight: 9,
  },
  bulletText: { flex: 1 },
});

function SectionHead({ label }: { label: string }) {
  return (
    <View style={s.sectionHead}>
      <Text style={s.label}>{label}</Text>
      <View style={s.labelRule} />
    </View>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode[];
}) {
  const [first, ...rest] = children;
  return (
    <View style={s.section}>
      {/* The heading and its first entry move to a new page together. */}
      <View wrap={false}>
        <SectionHead label={label} />
        {first}
      </View>
      {rest}
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={s.bullet} wrap={false}>
      <View style={s.dot} />
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

function Job({ job, head }: { job: ResumeJob; head?: ReactNode }) {
  const [first, ...rest] = job.highlights ?? [];
  const dates = `${job.start} - ${job.end}`;
  return (
    <View style={s.job}>
      {/* A long entry may break between bullets, but its heading, promotion
          line and first bullet (and any section heading above) stay together. */}
      <View wrap={false}>
        {head}
        {/* Title and company on their own lines, each a single text run:
            parsers glue separately styled runs together ("Engineeringat"). */}
        <View style={s.jobHead}>
          <Text style={[s.headline, s.role]}>{job.title}</Text>
          {first && <Text style={s.dates}>{dates}</Text>}
        </View>
        <Text style={s.company}>{job.company}</Text>
        {/* A role without bullets has nothing full-width between its dates
            and the next role's, so pdftotext stacks them into a column and
            pairs them with the wrong roles. Its dates go under the company. */}
        {!first && <Text style={s.progression}>{dates}</Text>}
        {job.progression && (
          <Text style={s.progression}>{job.progression.join("  ›  ")}</Text>
        )}
        {first && (
          <View style={s.bullets}>
            <Bullet text={first} />
          </View>
        )}
      </View>
      {rest.map((h) => (
        <Bullet key={h} text={h} />
      ))}
    </View>
  );
}

function ResumeDocument({ contact }: { contact: ResumeContact }) {
  // Two lines: where you are and how to reach you, then where to look.
  const reach: { label: string; href?: string }[][] = [
    [
      { label: contact.location },
      { label: contact.email, href: `mailto:${contact.email}` },
      ...(contact.phone
        ? [
            {
              label: contact.phone,
              href: `tel:${contact.phone.replace(/[^\d+]/g, "")}`,
            },
          ]
        : []),
    ],
    resume.links,
  ];
  return (
    <Document
      title={`${resume.name} - Resume`}
      author={resume.name}
      subject={resume.title}
      keywords={resume.keywords.join(", ")}
    >
      <Page size="LETTER" style={s.page}>
        <Text style={s.name}>{resume.name}</Text>
        <Text style={s.title}>{resume.title}</Text>
        {reach.map((line, l) => (
          <View key={l} style={[s.contact, l > 0 ? { marginTop: 2 } : {}]}>
            {line.map((r, i) => (
              <View key={r.label} style={{ flexDirection: "row" }}>
                {i > 0 && <Text style={s.sep}>/</Text>}
                {r.href ? (
                  <Link src={r.href} style={s.contactLink}>
                    {r.label}
                  </Link>
                ) : (
                  <Text>{r.label}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
        <View style={s.headerRule} />

        <Section label="Summary">
          {resume.summary.map((p) => (
            <Text key={p} style={s.para}>
              {p}
            </Text>
          ))}
        </Section>

        <Section label="Technical Skills">
          {[
            <View
              key="skills"
              style={{ borderTopWidth: 0.5, borderTopColor: RULE }}
            >
              {resume.skills.map((k) => (
                <View key={k.label} style={s.skill} wrap={false}>
                  <Text style={s.skillLabel}>{k.label}</Text>
                  <Text style={s.skillItems}>{k.items}</Text>
                </View>
              ))}
            </View>,
          ]}
        </Section>

        <View style={s.section}>
          {resume.experience.map((job, i) => (
            <Job
              key={`${job.company} ${job.title}`}
              job={job}
              head={i === 0 ? <SectionHead label="Experience" /> : undefined}
            />
          ))}
          {/* Same title, dates and company lines as the roles above, so a
              parser reads each as its own role, not one under a heading. */}
          {resume.earlier.map((job) => (
            <Job key={job.company} job={job} />
          ))}
        </View>

        <Section label="Education">
          {[
            <View key="self-taught" wrap={false}>
              <Text style={s.role}>{resume.education.selfTaught.title}</Text>
              <Text>{resume.education.selfTaught.details}</Text>
            </View>,
          ]}
        </Section>

        {/* Last in the tree, so extracted text starts with the name, not this. */}
      </Page>
    </Document>
  );
}

export function renderResumePdf(contact: ResumeContact): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument contact={contact} />);
}
