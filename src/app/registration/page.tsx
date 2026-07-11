import PageShell from "@/components/PageShell";
import RegistrationForm from "@/components/RegistrationForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/registration");

export default function RegistrationPage() {
  return (
    <PageShell
      title="Online Registration"
      intro="Please complete the form below and upload the required documents. Fields marked * are required."
    >
      <RegistrationForm />
    </PageShell>
  );
}
