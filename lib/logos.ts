/* THE CLIENT LOGOS, AS DATA.

   Every logo wall reads this one list, so adding a brand is one line here and
   one PNG in /public/logos — never an edit to a component.

   THE FILES ARE USED EXACTLY AS DELIVERED. All nine are 1030 x 354 with the
   mark already centred and padded inside that canvas, so every logo shares one
   aspect (2.91) and one box height, and the padding baked into the file is
   what spaces the marks from each other. The file name is the delivered one,
   spaces included; `logoSrc` encodes it for the URL.

   WHY EVERY `h` IS THE SAME. With a trimmed mark the box would be sized per
   logo so a wide wordmark and a compact emblem sat at the same optical weight.
   With a uniform padded canvas that balance was set by whoever exported these,
   and it is left alone. If one brand reads too loud, the fix is in the PNG,
   not here.

   LOGO COLOURS ARE NEVER ALTERED. No tint, mask recolour, filter or opacity
   on a mark, on any wall. Dark walls show each PNG as-is on a white card.

   TWO THINGS TO KNOW ABOUT THE DELIVERED FILES:
   - SOMARA IS ON A SOLID WHITE BOX, not transparent. Every other logo is
     transparent. A knocked-out Somara is in the outputs from the earlier
     pass if you want to swap it.
   - MOVES METHOD IS PALE LIME (220,227,174). Low contrast on paper and on
     the white cards; if it reads too faint, the fix is in the PNG. */

export type Logo = {
  slug: string;
  name: string;
  /** the delivered file name, as-is */
  file: string;
  /** width / height of the delivered canvas */
  aspect: number;
  /** box height in px on a desktop wall */
  h: number;
};

const ASPECT = 1030 / 354;
const H = 44;

export const LOGOS: Logo[] = [
  { slug: "gte", name: "GTE", file: "GTE.png", aspect: ASPECT, h: H },
  { slug: "livingcore", name: "Livingcore", file: "Livingcore.png", aspect: ASPECT, h: H },
  { slug: "lymphoria", name: "Lymphoria", file: "Lymphoria.png", aspect: ASPECT, h: H },
  { slug: "matter", name: "Matter", file: "Matter Daily Beets.png", aspect: ASPECT, h: H },
  { slug: "mone", name: "Moné Eros", file: "Mone Eros.png", aspect: ASPECT, h: H },
  { slug: "moves-method", name: "Moves Method", file: "Moves Method.png", aspect: ASPECT, h: H },
  { slug: "somara", name: "Somara Supplements", file: "Somara.png", aspect: ASPECT, h: H },
  { slug: "sparsa-ai", name: "Sparsa AI", file: "Sparsa AI.png", aspect: ASPECT, h: H },
  { slug: "tryscent", name: "TryScent", file: "Try Scent.png", aspect: ASPECT, h: H },
];

export const logoSrc = (l: Logo) => `/logos/${encodeURIComponent(l.file)}`;
export const logoWidth = (l: Logo) => Math.round(l.h * l.aspect);
