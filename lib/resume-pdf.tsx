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
  Path,
  StyleSheet,
  Svg,
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
    fontSize: 9.4,
    lineHeight: 1.5,
    color: BODY,
    // Ligatures fuse "fi"/"fl" into one glyph, and text extraction (what an
    // applicant tracking system reads) then drops a letter: "frst".
    fontFeatureSettings: { liga: false, clig: false },
    paddingTop: 46,
    paddingBottom: 54,
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
  section: { marginTop: 20 },
  sectionHead: { flexDirection: "row", alignItems: "center", marginBottom: 9 },
  label: {
    fontFamily: "Michroma",
    fontSize: 7,
    letterSpacing: 1.8,
    color: ACCENT,
    textTransform: "uppercase",
  },
  labelRule: { flex: 1, height: 0.75, backgroundColor: RULE, marginLeft: 10 },
  para: { marginBottom: 7 },
  intro: { color: MUTED, marginBottom: 6 },
  skill: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
  },
  skillLabel: { width: 112, fontWeight: 600, color: INK },
  skillItems: { flex: 1 },
  job: { marginBottom: 14 },
  jobHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  roles: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    flex: 1,
  },
  role: { fontSize: 10.8, fontWeight: 700, color: INK },
  company: { fontSize: 10.8, fontWeight: 600, color: ACCENT },
  dates: { fontSize: 8.6, color: MUTED, marginLeft: 12 },
  progression: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 2,
    fontSize: 8.6,
    color: MUTED,
  },
  bullets: { marginTop: 6 },
  bullet: { flexDirection: "row", marginBottom: 3.5 },
  dot: {
    width: 3.5,
    height: 3.5,
    backgroundColor: ACCENT,
    marginTop: 5,
    marginRight: 9,
  },
  bulletText: { flex: 1 },
  stack: { marginTop: 2, fontSize: 8.8, color: MUTED },
  more: { marginTop: 4, fontSize: 8.8, color: MUTED },
  moreLink: { color: INK, textDecoration: "none" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 54,
    right: 54,
    fontSize: 7.5,
    color: MUTED,
  },
});

// None of the brand fonts has "→", so the arrow is drawn.
function Arrow({ size = 9, color = MUTED }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size * 0.62}
      viewBox="0 0 16 10"
      style={{ marginHorizontal: 5 }}
    >
      <Path
        d="M0 5 H14 M10 1.2 L14 5 L10 8.8"
        stroke={color}
        strokeWidth={1.4}
        fill="none"
      />
    </Svg>
  );
}

function Steps({
  steps,
  style,
  arrow,
}: {
  steps: string[];
  style?: typeof s.role;
  arrow?: number;
}) {
  return steps.map((step, i) => (
    <View key={step} style={{ flexDirection: "row", alignItems: "center" }}>
      {i > 0 && <Arrow size={arrow} />}
      <Text style={style}>{step}</Text>
    </View>
  ));
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
        <View style={s.sectionHead}>
          <Text style={s.label}>{label}</Text>
          <View style={s.labelRule} />
        </View>
        {first}
      </View>
      {rest}
    </View>
  );
}

function Job({ job }: { job: ResumeJob }) {
  return (
    // An entry never splits across pages.
    <View style={s.job} wrap={false}>
      <View style={s.jobHead}>
        <View style={s.roles}>
          <Steps steps={job.roles} style={s.role} arrow={10} />
          <Text style={[s.company, { marginLeft: 6 }]}>{job.company}</Text>
        </View>
        <Text style={s.dates}>
          {job.start} – {job.end}
        </Text>
      </View>
      {job.progression && (
        <View style={s.progression}>
          <Steps steps={job.progression} arrow={8} />
        </View>
      )}
      {job.highlights && (
        <View style={s.bullets}>
          {job.highlights.map((h) => (
            <View key={h} style={s.bullet} wrap={false}>
              <View style={s.dot} />
              <Text style={s.bulletText}>{h}</Text>
            </View>
          ))}
        </View>
      )}
      {job.stack && <Text style={s.stack}>{job.stack}</Text>}
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
    >
      <Page size="LETTER" style={s.page}>
        <Text style={s.footer} fixed>
          {resume.name}
        </Text>
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
          <Text style={s.intro}>{resume.skillsIntro}</Text>
          <View style={{ borderTopWidth: 0.5, borderTopColor: RULE }}>
            {resume.skills.map((k) => (
              <View key={k.label} style={s.skill} wrap={false}>
                <Text style={s.skillLabel}>{k.label}</Text>
                <Text style={s.skillItems}>{k.items}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section label="Experience">
          {[
            ...resume.experience.map((job) => (
              <Job key={job.company} job={job} />
            )),
            <Text key="more" style={s.more}>
              {resume.more.text}{" "}
              <Link src={resume.more.href} style={s.moreLink}>
                {resume.more.label}
              </Link>
            </Text>,
          ]}
        </Section>
      </Page>
    </Document>
  );
}

export function renderResumePdf(contact: ResumeContact): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument contact={contact} />);
}
