// Renders the resume (lib/resume.ts) as a PDF: one column, monospace, real
// selectable text so applicant tracking systems can parse it. Used by the
// /resume.pdf route (public contact details) and scripts/resume-pdf.mts
// (the private copy).
import path from "node:path";
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

const fontFile = (weight: number) =>
  path.join(
    process.cwd(),
    `node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-${weight}-normal.woff`,
  );

Font.register({
  family: "Roboto Mono",
  fonts: [
    { src: fontFile(400), fontWeight: 400 },
    { src: fontFile(700), fontWeight: 700 },
  ],
});
// Break lines between words only; never hyphenate.
Font.registerHyphenationCallback((word) => [word]);

const INK = "#1f1f1f";
const MUTED = "#666666";
const LINK = "#1155cc";

const s = StyleSheet.create({
  page: {
    fontFamily: "Roboto Mono",
    fontSize: 8.6,
    lineHeight: 1.5,
    color: INK,
    paddingVertical: 40,
    paddingHorizontal: 44,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  name: { fontSize: 21, lineHeight: 1.2 },
  title: { fontSize: 10.5, color: MUTED, marginTop: 4 },
  contact: { alignItems: "flex-end", color: MUTED },
  link: { color: LINK },
  h2: { fontSize: 11.5, fontWeight: 700, marginTop: 14, marginBottom: 6 },
  para: { marginBottom: 6 },
  bullet: { flexDirection: "row", marginBottom: 2, paddingLeft: 10 },
  dot: { width: 12 },
  bulletText: { flex: 1 },
  job: { marginTop: 9 },
  jobHead: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  role: { fontSize: 10, fontWeight: 700, color: "#444444" },
  dates: { fontSize: 10, color: MUTED },
  sub: {
    marginTop: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  more: { marginTop: 18, textAlign: "center" },
});

// Roboto Mono has no "→", so the arrow is drawn.
function Arrow({ size = 9, color = INK }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size + 4}
      height={size * 0.6}
      viewBox="0 0 16 10"
      style={{ marginHorizontal: 4 }}
    >
      <Path
        d="M0 5 H14 M10 1 L14 5 L10 9"
        stroke={color}
        strokeWidth={1.2}
        fill="none"
      />
    </Svg>
  );
}

function Steps({
  steps,
  textStyle,
  arrow,
}: {
  steps: string[];
  textStyle?: typeof s.role;
  arrow?: { size?: number; color?: string };
}) {
  return steps.map((step, i) => (
    <View key={step} style={{ flexDirection: "row", alignItems: "center" }}>
      {i > 0 && <Arrow {...arrow} />}
      <Text style={textStyle}>{step}</Text>
    </View>
  ));
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={s.bullet} wrap={false}>
      <Text style={s.dot}>•</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

function Job({ job }: { job: ResumeJob }) {
  return (
    <View style={s.job} wrap={!!job.highlights}>
      <View style={s.jobHead}>
        {/* Separate text runs drop leading spaces, so "at" joins the last role. */}
        <Steps
          steps={[
            ...job.roles.slice(0, -1),
            `${job.roles.at(-1)} at ${job.company}`,
          ]}
          textStyle={s.role}
          arrow={{ size: 10, color: "#444444" }}
        />
        <Text style={[s.dates, { marginLeft: 6 }]}>
          - {job.start} - {job.end}
        </Text>
      </View>
      {job.progression && (
        <View style={s.sub}>
          <Steps steps={job.progression} arrow={{ size: 8 }} />
        </View>
      )}
      {job.highlights && (
        <View style={{ marginTop: 6 }}>
          {job.highlights.map((h) => (
            <Bullet key={h}>{h}</Bullet>
          ))}
        </View>
      )}
      {job.stack && <Text style={{ marginTop: 2 }}>{job.stack}</Text>}
    </View>
  );
}

function ResumeDocument({ contact }: { contact: ResumeContact }) {
  return (
    <Document
      title={`${resume.name} - Resume`}
      author={resume.name}
      subject={resume.title}
    >
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.name}>{resume.name}</Text>
            <Text style={s.title}>{resume.title}</Text>
          </View>
          <View style={s.contact}>
            <Text>{contact.location}</Text>
            <Link src={`mailto:${contact.email}`} style={s.link}>
              {contact.email}
            </Link>
            {contact.phone && <Text>{contact.phone}</Text>}
          </View>
        </View>
        {resume.links.map((l) => (
          <Link key={l.href} src={l.href} style={s.link}>
            {l.label}
          </Link>
        ))}

        <Text style={s.h2}>Summary</Text>
        {resume.summary.map((p) => (
          <Text key={p} style={s.para}>
            {p}
          </Text>
        ))}

        <View wrap={false}>
          <Text style={s.h2}>Technical Skills</Text>
          <Text style={s.para}>{resume.skillsIntro}</Text>
          {resume.skills.map((k) => (
            <View key={k.label} style={s.bullet}>
              <Text style={s.dot}>•</Text>
              <Text style={s.bulletText}>
                <Text style={{ fontWeight: 700 }}>{k.label}:</Text> {k.items}
              </Text>
            </View>
          ))}
        </View>

        <Text style={s.h2} break>
          Experience
        </Text>
        {resume.experience.map((job) => (
          <Job key={job.company} job={job} />
        ))}
        <Text style={s.more}>
          {resume.more.text}{" "}
          <Link src={resume.more.href} style={s.link}>
            {resume.more.label}
          </Link>
        </Text>
      </Page>
    </Document>
  );
}

export function renderResumePdf(contact: ResumeContact): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument contact={contact} />);
}
