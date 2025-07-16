import { CampaignEditor } from "./campaign-editor";

export default function EditCampaignPage({ params }: { params: { id: string } }) {
  return <CampaignEditor campaignId={params.id} />;
}