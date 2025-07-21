import { TeamManager } from "./team-manager";

export default function TeamPage() {
  return <TeamManager artist={{
    id: "",
    name: "",
    bio: null,
    email: "",
    slug: "",
    ses_domain_verified: false,
    ses_domain: undefined,
    ses_status: undefined,
    clerk_user_id: "",
    created_at: "",
    updated_at: "",
    settings: undefined,
    subscription: undefined
  }} />;
}