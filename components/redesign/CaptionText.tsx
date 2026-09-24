import { Fragment } from "react";

/* TEXT SET AS ON-SCREEN AD CAPTIONS — solid boxes behind each line, the way
   the ads themselves put text on screen. The site's signature type treatment:
   the hero headline (ink boxes, popping in word by word) and the Work heading
   (white boxes over the wall).

   Each word is its own inline-block, so it can scale when animated. The
   box-shadow pair extends each word's fill 0.2em sideways without moving the
   layout: enough to cover the space to the next word, so a line reads as one
   continuous box, and to pad the line's two ends. The parent needs the
   matching px-[0.2em] to keep that padding inside its column. The radius stays
   under the overlap, or two neighbours' rounded corners leave a notch.

   Screen readers get the sentence once, from the sr-only copy. */

const TONE = {
  ink: "bg-ink text-paper shadow-[0.2em_0_0_var(--color-ink),-0.2em_0_0_var(--color-ink)]",
  white: "bg-white text-ink shadow-[0.2em_0_0_#fff,-0.2em_0_0_#fff]",
} as const;

export function CaptionText({
  text,
  tone = "ink",
  pop,
}: {
  text: string;
  tone?: keyof typeof TONE;
  /** Pop the words in on load: ms before the first word, ms between words.
      Uses .caption-pop from globals.css, which reduced motion switches off. */
  pop?: { start: number; step: number };
}) {
  return (
    <>
      <span className="sr-only">{text}</span>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span
            aria-hidden
            className={`${pop ? "caption-pop " : ""}inline-block rounded-[0.06em] py-[0.03em] leading-[1.14] ${TONE[tone]}`}
            style={pop ? { animationDelay: `${pop.start + i * pop.step}ms` } : undefined}
          >
            {word}
          </span>
        </Fragment>
      ))}
    </>
  );
}
