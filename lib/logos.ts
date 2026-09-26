/* THE CLIENT LOGOS, AS DATA.

   Every logo wall reads this one list, so adding a brand is one line here and
   one file in /public/logos — never an edit to a component.

   ONE FILE PER LOGO, /logos/<slug>.svg. Each is the brand's own mark, cleaned
   and trimmed to its alpha bounds, wrapped in an SVG. Light-ground walls tint
   it to ink by painting currentColor through the file's alpha with
   `mask-image`; dark-ground walls do the same with white. The WebGL wall
   derives its white texture from the same file at mount. So there is no
   separate mono set to keep in sync.

   `aspect` IS MEASURED FROM THE TRIMMED FILE, not typed. `h` is the optical
   height a logo renders at on a desktop wall — and it is NOT the same for
   every brand. Equal height makes a wide wordmark like Matter (6.6:1) read as
   huge beside a compact one like Moné (2.5:1). Wide marks are set shorter so
   all nine carry about the same visual weight; that is the number to adjust
   when one brand is shouting.

   SOMARA WAS THE ONLY LOGO THAT ARRIVED ON A WHITE BOX; it has been knocked
   out to transparency. MOVES METHOD is pale lime (220,227,174) — invisible on
   paper at full colour, which is why the light-ground walls tint at rest and
   only reveal true colour on hover. */

export type Logo = {
  slug: string;
  name: string;
  /** width / height of the trimmed mark */
  aspect: number;
  /** optical height in px on a desktop wall */
  h: number;
};

export const LOGOS: Logo[] = [
  { slug: "gte", name: "GTE", aspect: 3.18, h: 34 },
  { slug: "livingcore", name: "Livingcore", aspect: 3.72, h: 32 },
  { slug: "lymphoria", name: "Lymphoria", aspect: 5.85, h: 24 },
  { slug: "matter", name: "Matter", aspect: 6.58, h: 22 },
  { slug: "mone", name: "Moné Eros", aspect: 2.45, h: 40 },
  { slug: "moves-method", name: "Moves Method", aspect: 2.51, h: 36 },
  { slug: "somara", name: "Somara Supplements", aspect: 2.91, h: 36 },
  { slug: "sparsa-ai", name: "Sparsa AI", aspect: 4.82, h: 28 },
  { slug: "tryscent", name: "TryScent", aspect: 3.78, h: 32 },
];

export const logoSrc = (l: Logo) => `/logos/${l.slug}.svg`;
export const logoWidth = (l: Logo) => Math.round(l.h * l.aspect);
