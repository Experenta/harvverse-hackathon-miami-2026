import { notFound } from "next/navigation";
import { ConfigureFlow } from "./ConfigureFlow";
import { getLotByCode } from "~~/lib/mock/lots";
import { getPlanForLot } from "~~/lib/mock/plans";
import { getActivePendingProposal } from "~~/lib/mock/proposals";

type ConfigurePageProps = { params: Promise<{ lotCode: string }> };

const ConfigurePage = async ({ params }: ConfigurePageProps) => {
  const { lotCode } = await params;
  const lot = getLotByCode(lotCode);
  if (!lot) notFound();
  const plan = getPlanForLot(lot.code);
  if (!plan) notFound();
  // proposal preview reused for the deterministic numbers (Maria's pessimistic Y1)
  const pendingProposal = getActivePendingProposal();
  if (!pendingProposal) notFound();

  return <ConfigureFlow lot={lot} plan={plan} proposal={pendingProposal} />;
};

export default ConfigurePage;
