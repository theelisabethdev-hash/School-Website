import PageShell from "@/components/PageShell";
import FormSubmissionForm from "@/components/FormSubmissionForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/form-submission");

export default function FormSubmissionPage() {
  return (
    <PageShell
      title="Registration Form Submission"
      intro="If you have downloaded, printed and filled the registration form offline, please use this form to upload the filled PDF, payment receipt screenshot, and any supporting files."
    >
      <FormSubmissionForm />
    </PageShell>
  );
}
