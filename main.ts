// Promo package validator + packager for make.fun's
// "Promote make.fun's make-your-own-bounty post on X" bounty.
//
// The grader runs this as `node /bot/main.ts` (Node 22), with no network,
// the repository read-only at /bot and an empty writable /output.
// It reads POST.json, POST-DRAFT.md and promo.png from the repository,
// validates them against the bounty entry-link rules, and writes a
// deterministic report plus the exact post text to the output directory.
//
// Standard library only. No network, no clock, no randomness: two runs on
// the same repository produce byte-identical output.
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT: string = dirname(fileURLToPath(import.meta.url));
const OUT: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const POST_URL_RE: RegExp =
  /^https:\/\/(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+$/;
const PLAY_CODE_RE: RegExp = /makefun-[a-z]+-[a-z]+-[a-z]+/;
const PNG_MAGIC: Buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const URL_RE: RegExp = /https?:\/\/[^\s]+/g;

function xLength(text: string): number {
  // X counts every URL as 23 characters; every other character counts once.
  const urls: string[] = text.match(URL_RE) ?? [];
  let n: number = [...text].length;
  for (const u of urls) {
    n -= [...u].length - 23;
  }
  return n;
}

function extractPostText(draft: string): string {
  const start: string = "<!-- POST TEXT START -->";
  const end: string = "<!-- POST TEXT END -->";
  const a: number = draft.indexOf(start);
  const b: number = draft.indexOf(end);
  if (a < 0 || b < 0 || b <= a) {
    throw new Error("POST-DRAFT.md has no marked post-text block");
  }
  return draft.slice(a + start.length, b).replace(/^\n+/, "").replace(/\n+$/, "");
}

function main(): void {
  // --- POST.json -----------------------------------------------------------
  const postJsonRaw: string = readFileSync(join(ROOT, "POST.json"), "utf8");
  const postJson: unknown = JSON.parse(postJsonRaw);
  const url: string =
    typeof postJson === "object" && postJson !== null
      ? String((postJson as Record<string, unknown>).url ?? "")
      : "";
  const isPlaceholder: boolean = url.includes("PLACEHOLDER");
  const postUrlStatus: string = isPlaceholder
    ? "pending"
    : POST_URL_RE.test(url)
      ? "valid"
      : "invalid";

  // --- promo.png -----------------------------------------------------------
  const photoPath: string = join(ROOT, "promo.png");
  const photoBytes: Buffer = readFileSync(photoPath);
  const photoSize: number = statSync(photoPath).size;
  const photoIsPng: boolean = photoBytes.subarray(0, 4).equals(PNG_MAGIC);
  const photoSha256: string = createHash("sha256").update(photoBytes).digest("hex");

  // --- post text -----------------------------------------------------------
  const draft: string = readFileSync(join(ROOT, "POST-DRAFT.md"), "utf8");
  const postText: string = extractPostText(draft);
  const playCodeMatch: RegExpMatchArray | null = postText.match(PLAY_CODE_RE);
  const lower: string = postText.toLowerCase();
  const hasMakeFunLink: boolean = URL_RE.test(postText) &&
    (postText.match(URL_RE) ?? []).some((u: string) => {
      try {
        const host: string = new URL(u).hostname.toLowerCase();
        return host === "make.fun" || host.endsWith(".make.fun");
      } catch {
        return false;
      }
    });
  const hasMakeFunWritten: boolean = /(^|[^a-z0-9])make\.fun([^a-z0-9]|$)/.test(lower);
  const hasMakefunai: boolean = /(^|[^a-z0-9])@makefunai([^a-z0-9]|$)/.test(lower);
  const chars: number = xLength(postText);

  const checks: Record<string, boolean> = {
    postUrlValid: postUrlStatus === "valid",
    photoIsPng,
    photoPresent: photoSize > 0,
    textHasMakeFun: hasMakeFunLink || hasMakeFunWritten || hasMakefunai,
    textHasPlayCode: playCodeMatch !== null,
    textFits280: chars <= 280,
  };
  const allPass: boolean = Object.values(checks).every(Boolean);

  const report: Record<string, unknown> = {
    bounty: "post-x-promote-make-your-own-bounty-01",
    quotedPost: "https://x.com/makefunai/status/2124915864336236646",
    post: {
      url,
      status: postUrlStatus,
    },
    photo: {
      file: "promo.png",
      bytes: photoSize,
      sha256: photoSha256,
      format: photoIsPng ? "png" : "unknown",
    },
    text: {
      chars,
      hasMakeFunLink,
      hasMakeFunWritten,
      hasMakefunai,
      playCode: playCodeMatch ? playCodeMatch[0] : null,
    },
    checks,
    verdict: allPass ? "pass" : postUrlStatus === "pending" ? "pending-post" : "fail",
  };

  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "promo-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  writeFileSync(join(OUT, "post.txt"), postText + "\n", "utf8");

  console.log(`post url: ${postUrlStatus}`);
  console.log(`photo: promo.png ${photoSize} bytes sha256 ${photoSha256.slice(0, 12)}...`);
  console.log(`text: ${chars} chars (X rules), play code ${playCodeMatch ? playCodeMatch[0] : "MISSING"}`);
  console.log(`verdict: ${String(report.verdict)}`);
}

main();
