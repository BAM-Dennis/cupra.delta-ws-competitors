/* eslint-disable @next/next/no-img-element */

/**
 * Kreis-Avatar der Persona: Portrait, wenn eins konfiguriert ist, sonst der
 * Anfangsbuchstabe auf Kupfer. Wird überall genutzt, wo die Persona klein auftaucht.
 */
export function PersonaAvatar({ name, image, size = "md" }: { name: string; image?: string; size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "size-10 text-[16px]", md: "size-14 text-[22px]", lg: "size-24 text-[40px]" }[size];
  if (image) {
    return (
      <span className={`block shrink-0 overflow-hidden rounded-full ring-2 ring-copper/60 ${dims}`}>
        <img alt={name} src={image} className="size-full object-cover object-top" />
      </span>
    );
  }
  return <span className={`flex shrink-0 items-center justify-center rounded-full bg-copper-gradient font-medium ${dims}`}>{name[0]}</span>;
}
