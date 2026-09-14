import { TrainerApp } from "@/components/trainer/TrainerApp";

export default async function TrainerPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <TrainerApp code={code.toLowerCase()} />;
}
