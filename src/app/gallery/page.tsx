import PageShell from "@/components/PageShell";
import { pageMetadata } from "@/lib/seo";
import { getGallery } from "@/lib/api";
import GalleryBrowser from "@/components/GalleryBrowser";

export const metadata = pageMetadata("/gallery");
export const revalidate = 0;

export default async function GalleryPage() {
  const albums = await getGallery();

  return (
    <PageShell title="Our Photo Gallery">
      {albums.length === 0 ? (
        <p className="Main_header three">
          Our gallery is being updated. Please check back soon for photos from school life.
        </p>
      ) : (
        <GalleryBrowser albums={albums} />
      )}
    </PageShell>
  );
}
