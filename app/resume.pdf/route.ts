import { PUBLIC_CONTACT } from "@/lib/resume";
import { renderResumePdf } from "@/lib/resume-pdf";

export const dynamic = "force-static";

export async function GET() {
  const pdf = await renderResumePdf(PUBLIC_CONTACT);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Chase Pierce - Resume.pdf"',
    },
  });
}
