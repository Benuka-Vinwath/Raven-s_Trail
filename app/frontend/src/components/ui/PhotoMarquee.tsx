import { GALLERY, photo } from "../../lib/photos";

// Photos drift sideways on their own; the page scrolls normally. The list is doubled so the -50% loop is seamless.
export default function PhotoMarquee() {
  return (
    <section className="overflow-hidden bg-pine-950 pb-24 pt-20">
      <h2 className="mx-auto max-w-6xl px-6 font-display text-3xl leading-tight text-parchment-50 sm:text-5xl">
        The island, at a glance.
      </h2>

      <div className="mt-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...GALLERY, ...GALLERY].map((g, i) => (
            <figure
              key={i}
              aria-hidden={i >= GALLERY.length}
              className={`relative mr-5 h-[22rem] w-[17rem] shrink-0 overflow-hidden rounded-3xl sm:h-[26rem] sm:w-[22rem] ${i % 2 ? "mt-10" : ""}`}
            >
              <img src={photo(g.id, 800)} alt={i < GALLERY.length ? g.caption : ""} loading="lazy" className="h-full w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pine-950/80 to-transparent p-5 text-sm text-parchment-50">
                {g.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
