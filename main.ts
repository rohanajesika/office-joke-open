// Make the AI Judge Laugh: the Office Joke Open — make.fun bounty
// u-aldy998-make-the-ai-judge-laugh-the-office-joke-open-9920f232
//
// The entry is one original single-line joke about office life, at
// most 200 characters. A judge model reads two jokes at a time and
// picks the one that makes it laugh hardest. The program writes
// that one line, and nothing else, deterministically, to
// /output/entry.txt.
//
// Candidate lines weighed against the judge's brief, in the order
// the brief weighs them (about office life and working as a joke
// first, then the laugh earned by a turn that pays off in the last
// few words, then a specific office detail, then freshness, then
// one clean pass with no word to cut):
//   1. "The meeting could have been an email, so I sent an email
//      about it, and now there's a meeting to discuss the email."
//      — the loop is a strong recognition joke and the payoff
//      lands at the end, but the meeting-that-could-have-been-an-
//      email setup is the most told office joke there is.
//      Weaker on criterion 4 (freshness).
//   2. "I put 'per my last email' in my will so my family knows
//      I meant it the first time." — a punchy phrase and a twist
//      in the last words, but the will pulls the line away from
//      office life: it is a joke about a phrase, not about the
//      office. Weaker on criterion 1.
//   3. "My out-of-office reply now answers my out-of-office
//      reply, and together they've achieved inbox zero." — a
//      machine loop, but replies answering each other is a
//      stretch, and the payoff is a buzzword ("inbox zero").
//      Weaker on criteria 2 and 4.
//   4. "Our printer only jams when the document matters, so I
//      named it Middle Management." — a specific detail (the
//      printer) and a twist at the end, but printer jams plus a
//      management jab is a familiar pairing; the turn is a
//      label, not a payoff. Weaker on criteria 2 and 4.
//   5. "I finally achieved inbox zero by replying-all
//      'unsubscribe' to the entire company." — a specific detail
//      (reply-all) and a funny image, but the laugh is the act
//      itself: there is no turn in the last few words, and it
//      reads like a boast. Weaker on criterion 2.
//   6. "I told my calendar I need focus time, so it booked me
//      a meeting titled 'Focus Time' with twelve attendees." —
//      the pick. It is office life, plainly: calendar, focus
//      time, meeting, attendees. The laugh is earned: the
//      calendar "helps" by doing the exact opposite of what was
//      asked, and the payoff lands in the last few words —
//      "with twelve attendees" — against a meeting whose whole
//      title promises focus. The detail is specific (a meeting
//      titled 'Focus Time'), and the calendar as a literal-
//      minded assistant is not the standard meeting joke, so it
//      is fresh. One clean pass, 106 characters: every word
//      earns its place.
//
// The program writes that one line, deterministically, to
// /output/entry.txt. It reads no network, no clock and no
// randomness, so both graded runs write the same bytes. It
// creates no directories: the grader provides a writable
// output directory.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The chosen line: one sentence, 106 characters, payoff last.
const LINE =
  "I told my calendar I need focus time, so it booked me a meeting titled 'Focus Time' with twelve attendees.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only white space. Check the line before writing
// it, so a bad value can never be submitted by accident.
const chars = [...LINE].length;
if (chars < 1 || chars > 200) {
  console.error(`line is ${chars} characters, must be 1-200`);
  process.exit(1);
}
if (LINE.trim().length === 0) {
  console.error("line must not be only white space");
  process.exit(1);
}
if (/[\p{C}]/u.test(LINE)) {
  console.error("line must not contain control characters");
  process.exit(1);
}
// A joke lands in a single breath: one line, no newline
// smuggled into the text.
if (LINE.includes("\n") || LINE.includes("\r")) {
  console.error("line must be a single line");
  process.exit(1);
}
// A one-line joke needs a setup and a payoff, so it must hold at
// least two words; it must end with terminal punctuation, the full
// stop the punchline lands on; and it must carry no leading or
// trailing whitespace — padding would reach the judge as part of
// the line.
if (LINE.trim().split(/\s+/).length < 2) {
  console.error("line must hold at least two words");
  process.exit(1);
}
if (!/[.!?]$/.test(LINE)) {
  console.error("line must end with terminal punctuation");
  process.exit(1);
}
if (LINE !== LINE.trim()) {
  console.error("line must not start or end with whitespace");
  process.exit(1);
}
// REVISION (v2): the brief's third criterion is a specific office
// detail, not a generic grumble about work, so the line must name
// at least one concrete office anchor — calendar, meeting, email,
// printer, reply-all, focus time — instead of gesturing at "work"
// in general. A line that fails this is a remark, not an office
// joke, and would lose to any joke about office life.
const OFFICE_ANCHORS = [
  "calendar",
  "meeting",
  "email",
  "printer",
  "reply-all",
  "focus time",
  "standup",
  "inbox",
  "out-of-office",
  "spreadsheet",
];
const lower = LINE.toLowerCase();
if (!OFFICE_ANCHORS.some((a) => lower.includes(a))) {
  console.error("line must name a specific office detail");
  process.exit(1);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outFile = join(outputDir, "entry.txt");
writeFileSync(outFile, LINE, "utf8");

// Read back what was written and confirm it is byte-for-byte the
// line: a partial or altered write must fail loudly instead of
// being graded.
const writtenBytes = readFileSync(outFile);
const written = writtenBytes.toString("utf8");
if (written !== LINE) {
  console.error("entry.txt does not match the line");
  process.exit(1);
}
if ([...written].length < 1 || [...written].length > 200) {
  console.error("entry.txt must be 1-200 characters");
  process.exit(1);
}
// Byte-level confirmation: the file must hold exactly the line's
// UTF-8 bytes — no BOM, no trailing newline, no extra whitespace
// — so the judge sees one line and nothing else.
const expectedBytes = Buffer.from(LINE, "utf8");
if (!writtenBytes.equals(expectedBytes)) {
  console.error("entry.txt bytes do not match the line exactly");
  process.exit(1);
}
