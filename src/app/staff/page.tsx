import { pageMetadata } from "@/lib/seo";
import { getStaff, getStaffCarousel, type StaffMember } from "@/lib/api";
import StaffPageClient from "./StaffPageClient";

export const metadata = pageMetadata("/staff");
export const dynamic = "force-dynamic";

const FALLBACK_STAFF: StaffMember[] = [
  // Administration
  { id: "f1", name: "Mrs. Monica Ahuja Rao", title: "Administration", role: "Principal", order: 1 },
  { id: "f2", name: "Mrs. Meenakshi Aggarwal", title: "Administration", role: "Account Head", order: 2 },
  { id: "f3", name: "Mr. Mayank Singh Rawat", title: "Administration", role: "IT & Admin Officer", order: 3 },
  { id: "f4", name: "Mrs. Kanchan Sharma", title: "Administration", role: "Receptionist", order: 4 },
  
  // Coordinators
  { id: "f5", name: "Mrs. Karishma Manchanda", title: "Coordinators", role: "Pre-Primary", order: 1 },

  // Co-Curricular Teachers
  { id: "f6", name: "Mrs. Priyanka Khanna", title: "Co-Curricular Teachers", order: 1 },
  { id: "f7", name: "Mrs. Soma Saha", title: "Co-Curricular Teachers", order: 2 },
  { id: "f8", name: "Mrs. Bharti", title: "Co-Curricular Teachers", order: 3 },
  { id: "f9", name: "Ms. Sharon Bhardwaj", title: "Co-Curricular Teachers", order: 4 },
  { id: "f10", name: "Ms. Prerna Negi", title: "Co-Curricular Teachers", order: 5 },
  { id: "f11", name: "Ms. Bhavya Sharma", title: "Co-Curricular Teachers", order: 6 },
  { id: "f12", name: "Mr. Garv Solanki", title: "Co-Curricular Teachers", role: "Sport Teacher", order: 7 },

  // Special Educator
  { id: "f13", name: "Ms. Shikha Awasthi", title: "Special Educator", order: 1 },

  // Teachers (I-V)
  { id: "f14", name: "Ms. Jeevika Lamba", title: "Teachers (I-V)", order: 1 },
  { id: "f15", name: "Ms. Nanda Devi", title: "Teachers (I-V)", order: 2 },
  { id: "f16", name: "Ms. Neeru Kalra", title: "Teachers (I-V)", order: 3 },
  { id: "f17", name: "Ms. Sundus Khan", title: "Teachers (I-V)", order: 4 },
  { id: "f18", name: "Ms. Rakhi Datta", title: "Teachers (I-V)", order: 5 },

  // Support Staff
  { id: "f19", name: "Asha Tomar", title: "Support Staff", order: 1 },
  { id: "f20", name: "Ranjeeta", title: "Support Staff", order: 2 },
  { id: "f21", name: "Geeta", title: "Support Staff", order: 3 },
  { id: "f22", name: "Aarti", title: "Support Staff", order: 4 },
  { id: "f23", name: "Manisha", title: "Support Staff", order: 5 },
  { id: "f24", name: "Soban Singh", title: "Support Staff", order: 6 },
  { id: "f25", name: "Ramesh Chand", title: "Support Staff", order: 7 },
];

const FALLBACK_CAROUSEL = [
  { id: "s1", image: "/images/st-1.jpg" },
  { id: "s2", image: "/images/st-2.jpg" },
  { id: "s3", image: "/images/st-3.jpg" },
  { id: "s4", image: "/images/st-4.jpg" },
];

export default async function Page() {
  const apiStaff = await getStaff();
  const apiCarousel = await getStaffCarousel();

  const staff = apiStaff.length > 0 ? apiStaff : FALLBACK_STAFF;
  const carousel = apiCarousel.length > 0 ? apiCarousel : FALLBACK_CAROUSEL;

  return (
    <div id="body">
      <section className="content-wrapper main-content clear-fix">
        <StaffPageClient staff={staff} carousel={carousel} />
      </section>
    </div>
  );
}

