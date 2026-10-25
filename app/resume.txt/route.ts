import { PUBLIC_CONTACT } from "@/lib/resume";
import { renderResumeText } from "@/lib/resume-text";

export const dynamic = "force-static";

export function GET() {
  return new Response(renderResumeText(PUBLIC_CONTACT), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
