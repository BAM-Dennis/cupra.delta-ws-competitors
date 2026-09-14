/* eslint-disable @next/next/no-img-element */

/**
 * Hintergrund aus dem Figma-Design. "start" ist die scharfe Nachtaufnahme mit
 * Overlay und Farbverlauf, "blur" die stark weichgezeichnete Variante aller
 * anderen Screens. Fixiert und auf die App-Spalte begrenzt.
 */
export function Background({ variant }: { variant: "start" | "blur" }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-night"
    >
      {variant === "start" ? (
        <>
          <img
            alt=""
            src="/design/bg-start.webp"
            className="absolute left-[-79%] top-[-20%] h-[155%] w-[254%] max-w-none object-cover"
          />
          <img
            alt=""
            src="/design/bg-overlay.webp"
            className="absolute left-[-24%] top-[-17.5%] aspect-square w-[148%] max-w-none object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-[23%] bg-gradient-to-b from-transparent to-black/50 backdrop-blur-[5px]" />
        </>
      ) : (
        <>
          <img
            alt=""
            src="/design/bg-blur.webp"
            className="absolute left-[-61%] top-[-18%] h-[135%] w-[222%] max-w-none object-cover blur-[24px]"
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      )}
    </div>
  );
}
