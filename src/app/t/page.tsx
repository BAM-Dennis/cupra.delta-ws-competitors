import { redirect } from "next/navigation";

/** Phase 0: es gibt nur die Demo-Session. Phase 1: Session anlegen. */
export default function TrainerIndex() {
  redirect("/t/demo");
}
