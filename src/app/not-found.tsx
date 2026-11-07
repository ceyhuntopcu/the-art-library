import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { LinkButton } from "@/components/ui-bits";

export default function NotFound() {
  return <div className="container-page py-20"><EmptyState title="We couldn't find that page" description="It may have been removed, or the link is wrong." action={<LinkButton href="/browse" variant="secondary">Browse works</LinkButton>} /></div>;
}
