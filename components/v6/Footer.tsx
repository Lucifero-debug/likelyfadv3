import { content } from "@/lib/content";
import { PARENT_COMPANY, X_HANDLE } from "@/lib/site";
import { PAGE, T, Button, Card, Icon, title } from "./primitives";

/* THE CLOSE, then Polaris's FooterHelp.

   The close is a CALLOUT CARD: a title, one line, one action, left-aligned
   like every other card on the page rather than a centred hero block. Its
   action is the page's other primary button; the rest of the page's actions
   are secondary.

   The footer is FooterHelp — the single centred line every admin page ends
   on, pointing somewhere to learn more — then the parent company in small
   secondary text. The page's section links already live in the nav column,
   so they are not repeated here. */
export function Footer() {
  const { close, brand, footer } = content;
  const year = new Date().getFullYear();

  return (
    <footer>
      <section id="close" aria-labelledby="v6-close-title" className={`${PAGE} pb-10 pt-6 p-lg:pb-16`}>
        <Card className="flex flex-col gap-4 p-md:flex-row p-md:items-center p-md:justify-between p-md:gap-8">
          <div>
            <h2 id="v6-close-title" className={`text-p-text ${T.heading2xl}`}>
              {title(close.heading)}
            </h2>
            <p className={`mt-1 max-w-[52ch] text-pretty text-p-text-secondary ${T.bodyLg}`}>{close.sub}</p>
          </div>
          <Button contact variant="primary">
            {close.cta}
          </Button>
        </Card>
      </section>

      <div className={`${PAGE} pb-10`}>
        <p className={`flex items-center justify-center gap-2 text-center text-p-text ${T.bodyMd}`}>
          <Icon name="info" size={20} className="text-p-icon-secondary" />
          <span>
            Learn more about {brand} on{" "}
            <a
              href={`https://x.com/${X_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-p-text-link underline underline-offset-2 hover:text-p-text-link-hover"
            >
              X
            </a>
          </span>
        </p>
        <p className={`mt-3 text-center text-p-text-secondary ${T.bodySm}`}>
          {footer.tagline} By {PARENT_COMPANY}. © {year} {brand}.
        </p>
      </div>
    </footer>
  );
}
