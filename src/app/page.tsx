import { pageMetadata, faqJsonLd } from "@/lib/seo";
import { getBanners, getNews, getGallery, getFaqs, DEFAULT_NEWS } from "@/lib/api";
import AdmissionPopup from "@/components/AdmissionPopup";
import HeroCarousel from "@/components/HeroCarousel";
import FaqSection from "@/components/FaqSection";
import ContactForm from "@/components/ContactForm";

export const metadata = pageMetadata("/");

// The rolling-admissions marquee is reproduced verbatim from the legacy page.
// Rendered as raw HTML so the (non-standard) <marquee> element stays identical.
const MARQUEE_HTML = `
<marquee behavior="alternate" scrolldelay="100" scrollamount="3" onmouseover="this.stop();" onmouseout="this.start();">
  <p class="fl_left">
    <a href="#"><font style="text-shadow: 0 0 1px;">Rolling admissions against vacancies. Transfer cases accepted.</font></a>
    <img width="33" height="16" src="/images/new_red.gif" alt="new" />&nbsp;
  </p>
</marquee>`;

export default async function HomePage() {
  const [banners, rawNews, gallery, faqsData] = await Promise.all([
    getBanners(),
    getNews(true),
    getGallery(),
    getFaqs(),
  ]);

  const news = rawNews && rawNews.length > 0 ? rawNews : DEFAULT_NEWS;


  const galleryImages = gallery
    .flatMap((a) => a.images.map((i) => i.image))
    .slice(0, 8);

  const heroImages = banners.map((b) => b.image);
  const homeFaqs = faqsData?.home || [];

  return (
    <div id="body">
      {/* Bottom-right admission popup (legacy #onload modal) */}
      <AdmissionPopup />

      {/* Home Page Slider */}
      <section className="content-wrapper main-content clear-fix">
        <div className="banner-silder">
          <div className="carousel fade-carousel slide" style={{ position: "relative" }}>
            <div className="overlay"></div>
            <HeroCarousel images={heroImages} />
          </div>
        </div>

        {/* Quick links */}
        <div className="banner-silder">
          <div className="container">
            <div className="BannerBoxMargin">
              <div className="col-md-3 BannerBox">
                <p className="boxMargin">
                  <svg width="40" height="30" viewBox="0 0 95 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M94.359 57.1872C94.359 53.6157 92.0409 50.5994 88.8301 49.4632V21.0457L94.359 18.7837L47.1795 0L0 18.7837L47.1795 37.5676L83.3013 23.2486V49.4632C80.0905 50.5994 77.7724 53.6157 77.7724 57.1872C77.7724 60.457 79.7186 63.2638 82.509 64.5901L77.9156 78.2642L83.1583 80L86.0657 71.3448L88.9731 80L94.2158 78.2642L89.6224 64.5901C92.4128 63.2639 94.359 60.4572 94.359 57.1872Z" fill="#214AB3" />
                    <path d="M47.1795 43.4797L22.2997 33.5665V40.7286C22.2997 48.5481 32.9956 54.4441 47.1795 54.4441C61.3634 54.4441 72.0593 48.5481 72.0593 40.7286V33.5665L47.1795 43.4797Z" fill="#214AB3" />
                  </svg>
                  <a className="textMargin" href="/admissions">Admissions &amp; Eligibility</a>
                </p>
              </div>
              <div className="col-md-3 BannerBox">
                <p className="boxMargin">
                  <svg width="35" height="30" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M96.0459 55.2102C95.2041 56.2293 94.2092 57.1465 93.1122 57.8854V69.2994H94.5408C97.551 69.2994 99.9745 66.879 100 63.8981V50.1147L96.0459 55.2102Z" fill="#214AB3" />
                    <path d="M71.9388 30.828H86.6582C87.0918 30.828 87.551 30.7771 88.0102 30.6752V16.1019C88.0102 13.0955 85.5612 10.7006 82.5765 10.7006H5.45918C2.44898 10.7006 0.0255102 13.121 0 16.1019V74.5223C0.0255102 77.5287 2.44898 79.9745 5.45918 80H82.5765C85.5867 79.9745 88.0102 77.5287 88.0102 74.5223L87.9847 59.7197C87.551 59.7707 87.0918 59.8217 86.6327 59.8471H71.9388C63.9286 59.8217 57.4235 53.3248 57.4235 45.3248C57.4235 37.3248 63.9286 30.828 71.9388 30.828Z" fill="#214AB3" />
                    <path d="M94.5408 0H17.4235C14.4133 0.0254777 11.9898 2.47134 11.9898 5.47771V5.6051H82.5765C88.3929 5.6051 93.1122 10.293 93.1122 16.1019V26.7516L100 17.8853V5.47771C99.9745 2.47134 97.551 0.0254777 94.5408 0Z" fill="#214AB3" />
                    <path d="M99.9745 26.2166L96.0204 31.3121C94.8724 32.7898 93.3929 33.9873 91.7092 34.7771C90.1275 35.5414 88.3929 35.9236 86.6327 35.9236H71.9388C66.7347 35.949 62.5255 40.1529 62.5255 45.3503C62.5255 50.5478 66.7347 54.7516 71.9388 54.7771H86.6582C88.75 54.7516 90.7398 53.7834 92.0153 52.1274L100 41.7834L99.9745 26.2166ZM77.6531 47.8981H71.5306C70.1275 47.8981 68.9796 46.7516 68.9796 45.3503C68.9796 43.949 70.1275 42.8025 71.5306 42.8025H77.6531C79.0561 42.8025 80.2041 43.949 80.2041 45.3503C80.2041 46.7516 79.0561 47.8981 77.6531 47.8981Z" fill="#214AB3" />
                  </svg>
                  <a className="textMargin" href="/fee-structure">Fee Structure &amp; Payment</a>
                </p>
              </div>
              <div className="col-md-3 BannerBox">
                <p className="boxMargin">
                  <svg width="40" height="30" viewBox="0 0 73 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M64.1545 8.00006H60.145V0H52.1256V8.00006H20.0483V0H12.029V8.00006H8.01937C3.58876 8.00006 0.0402219 11.58 0.0402219 16.0001L0 71.9999C0 76.4199 3.58858 80 8.01937 80H64.1545C68.5851 80 72.1739 76.4201 72.1739 71.9999V15.9999C72.1737 11.58 68.5851 8.00006 64.1545 8.00006ZM64.1545 71.9999H8.01937V27.9999H64.1545V71.9999Z" fill="#214AB3" />
                    <path d="M54.2506 40.2399L50.0004 36L30.4333 55.52L21.9329 47.04L17.6826 51.2799L30.4333 63.9999L54.2506 40.2399Z" fill="#214AB3" />
                  </svg>
                  <a className="textMargin" href="/activities">Activities</a>
                </p>
              </div>
              <div className="col-md-3 BannerBox">
                <p className="boxMargin">
                  <svg width="40" height="30" viewBox="0 0 80 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.8157 11.497C23.8157 9.65438 24.126 7.88297 24.6959 6.2314H7.07614e-06V49.5471H15.204V46.3311C15.204 39.2678 20.6215 33.447 27.5195 32.8032H19.4187V28.1157C21.8434 28.1157 23.8159 26.143 23.8159 23.7185L23.8157 11.497Z" fill="#214AB3" />
                    <path d="M28.2781 69.84H20.464V74.5275H59.5311V69.84H51.7168V64.3913H28.2781V69.84Z" fill="#214AB3" />
                    <path d="M0 54.2346H80V59.704H0V54.2346Z" fill="#214AB3" />
                    <path d="M51.2033 37.4307H47.7752C47.7189 41.6714 44.2538 45.1042 40.0002 45.1042C35.7465 45.1042 32.2812 41.6714 32.2251 37.4307H28.7918C23.8842 37.4307 19.8915 41.4234 19.8915 46.3311V49.547H60.1037V46.3311C60.1037 41.4234 56.111 37.4307 51.2033 37.4307Z" fill="#214AB3" />
                    <path d="M36.9151 37.4307C36.9707 39.0862 38.3312 40.4167 40.0001 40.4167C41.669 40.4167 43.0295 39.0862 43.0851 37.4307H36.9151Z" fill="#214AB3" />
                    <path d="M56.1846 23.7187C56.1846 26.1433 58.1571 28.1159 60.5818 28.1159V32.8034H52.4759C59.3739 33.447 64.7914 39.268 64.7914 46.3313V49.5473H80.0002V6.23146H55.3045C55.8743 7.88302 56.1846 9.65444 56.1846 11.4971V23.7187Z" fill="#214AB3" />
                    <path d="M40 32.7431C46.3394 32.7431 51.4969 27.5856 51.4969 21.2462V15.4033H46.4996C43.9322 15.4033 41.6171 14.3036 40 12.5506C38.383 14.3036 36.0677 15.4033 33.5003 15.4033H28.5032V21.2462C28.5032 27.5856 33.6607 32.7431 40 32.7431Z" fill="#214AB3" />
                    <path d="M37.6562 6.56H42.3438C42.3438 8.85156 44.2081 10.7158 46.4995 10.7158H51.4673C51.0641 4.73969 46.0766 0 40 0C33.9234 0 28.9359 4.73969 28.5327 10.7158H33.5003C35.7919 10.7159 37.6562 8.85156 37.6562 6.56Z" fill="#214AB3" />
                  </svg>
                  <a className="textMargin" href="/setu-project"><strong>Shiv Niketan Setu Project</strong> - Community Outreach</a>
                </p>
              </div>
            </div>
          </div>
          <div className="clearfix"></div>
        </div>

        {/* Rolling admissions marquee */}
        <div dangerouslySetInnerHTML={{ __html: MARQUEE_HTML }} />

        <div className="banner-bottom Welcome-section">
          <div className="container">
            <div className="clearfix"></div>
          </div>
        </div>

        {/* Welcome + notices */}
        <div className="banner-bottom Welcome-section">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <div className="wthree-heading">
                  <h1 className="welcome_header">Welcome to The Elisabeth Gauba School</h1>
                </div>
                <p className="Main_header three">
                  The School is a living example of the dedication and hard work of Mrs. Gauba who devoted her whole life to the cause of children’s education.
                  She had a great vision of creating a separate world for children abounding in beauty and peaceful coexistence. Although she has passed into eternal
                  sleep but she lives on in Shiv Niketan and through all her “children”.
                </p>
                <p className="Main_header three">
                  It is a school that does not believe in rigid structuring of classes. The development of each child as an individual and the flourishing of their
                  personalities is our primary concern. The School, therefore, seeks to use teaching towards helping each child to grow and mature intellectually
                  and spiritually at their own pace and give expression to their creative urges. It is not surprising, therefore, that learning is a joyful and
                  creative experience for our students.
                  <a href="/about-us" className="Redcolor">&nbsp;&nbsp;&nbsp;Read More..</a>
                </p>
              </div>
              <div className="col-md-4">
                <div className="ideaboxNewsMain" style={{ height: "330px", overflow: "hidden" }}>
                  <a href="/notices" style={{ textDecoration: "none", display: "block" }}>
                    <div className="ideaboxNews-heading" style={{ cursor: "pointer" }}>
                      <b>New &amp; Noteworthy</b>
                    </div>
                  </a>
                  <div id="home_notice" className={news.length > 3 ? "notices-marquee-container" : ""}>
                    {news.length === 0 ? (
                      <p style={{ padding: "10px" }}>No notices at the moment.</p>
                    ) : news.length > 3 ? (
                      <div className="notices-marquee-content">
                        <ul style={{ listStyle: "none", padding: "10px 15px", margin: 0 }}>
                          {news.slice(0, 15).map((n) => (
                            <li key={n.id} style={{ paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid #e2e8f0", lineHeight: "1.4" }}>
                              <a href="/notices" style={{ textDecoration: "none", color: "#1e293b", display: "block" }}>
                                {n.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                        <ul style={{ listStyle: "none", padding: "10px 15px", margin: 0 }} aria-hidden="true">
                          {news.slice(0, 15).map((n) => (
                            <li key={`${n.id}-dup`} style={{ paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid #e2e8f0", lineHeight: "1.4" }}>
                              <a href="/notices" style={{ textDecoration: "none", color: "#1e293b", display: "block" }}>
                                {n.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <ul style={{ listStyle: "none", padding: "10px 15px", margin: 0 }}>
                        {news.map((n) => (
                          <li key={n.id} style={{ paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid #e2e8f0", lineHeight: "1.4" }}>
                            <a href="/notices" style={{ textDecoration: "none", color: "#1e293b", display: "block" }}>
                              {n.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="TextRight"><a href="/notices">Read More..</a></div>
                </div>
              </div>
            </div>
            <div className="clearfix"></div>
          </div>
        </div>

        {/* Founder */}
        <div className="popular-section-wthree">
          <div className="box container">
            <div className="row">
              <div className="col-md-12">
                <div className="wthree-heading">
                  <h2 className="welcome_header">Few words from our Founder</h2>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-10">
                <p className="Main_header three">
                  I met a famous lawyer Krishna Menon regarding some personal issue. It was his humanity, his concern and his willingness to help
                  that I developed a great regard for him. So, the next time when I got confused regarding what to do,
                  I again went to him for his advice. He asked, “What is it you yourself want to do?” I though and said,
                  “I hate to see my own young children feel miserably bored at school and I always felt I would love to teach and make school fun for
                  them as well as other children too.” He grinned and said, “Here is your answer and it is a good one too for it is something our country
                  needs very badly.”
                </p>
                <p className="Main_header three">
                  So I went ahead and took the training. I eventually started the school to bring shine to the faces of all the children.
                  Independence of work left me free in every way to experiment and invent my own ways approach and realized that years of experience are never wasted.
                  <a href="/founder" className="Redcolor">&nbsp;&nbsp;&nbsp;Read More..</a>
                </p>
              </div>
              <div className="col-md-2">
                <img src="/images/Aunty2.jpg" alt="Mrs. Elisabeth Gauba, founder of The Elisabeth Gauba School" className="img-thumbnail" />
              </div>
            </div>
            <div className="clearfix"></div>
          </div>
        </div>

        {/* Gallery */}
        <section className="section">
          <div className="container">
            <div className="row element-animate">
              <div className="col-md-8 mb-4">
                <h2 className="welcome_header">Our Gallery</h2>
              </div>
              <div id="home_gallery" style={{ width: "100%" }}>
                {galleryImages.length > 0 && (
                  <div className="row">
                    {galleryImages.map((src, i) => (
                      <div className="col-md-3 col-xs-6" key={i} style={{ marginBottom: "15px" }}>
                        <img src={src} alt="School gallery" className="img-responsive" style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="banner-bottom Welcome-section">
          <div className="container">
            <div className="clearfix"></div>
          </div>
        </div>

        {/* FAQ — also seeds FAQPage JSON-LD for AI/answer-engine visibility */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(homeFaqs)) }}
        />
        <FaqSection items={homeFaqs} />

        {/* Contact */}
        <div className="contact-w3ls">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="wthree-heading">
                  <h2 className="welcome_header">Contact Us</h2>
                </div>
                <div className="bs-docs-example">
                  <table className="table">
                    <tbody>
                      <tr>
                        <td>
                          <p>
                            <svg width="25" height="45" viewBox="0 0 51 67" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M25.5 0C11.441 0 0 11.3509 0 25.3065C0 45.1357 23.103 65.6097 24.0862 66.4696C24.4913 66.8241 24.9957 67 25.5 67C26.0043 67 26.5087 66.8241 26.9138 66.4724C27.897 65.6097 51 45.1357 51 25.3065C51 11.3509 39.559 0 25.5 0ZM25.5 39.0833C17.6885 39.0833 11.3333 32.8216 11.3333 25.125C11.3333 17.4284 17.6885 11.1667 25.5 11.1667C33.3115 11.1667 39.6667 17.4284 39.6667 25.125C39.6667 32.8216 33.3115 39.0833 25.5 39.0833Z" fill="#214AB3" />
                            </svg>
                          </p>
                        </td>
                        <td>&nbsp;</td>
                        <td>
                          <a href="https://goo.gl/maps/KMxgfUTnkhYQaNyR7" target="_blank" rel="noreferrer">
                            The Elisabeth Gauba School, Sector-II, DIZ Area, Kali Bari Marg,<br />New Delhi-110001. (Entry from Gate No-9 on Kali Bari Lane)<br />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3}>&nbsp;</td>
                      </tr>
                      <tr>
                        <td>
                          <p>
                            <svg width="25" height="45" viewBox="0 0 60 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M59.4715 3.00078L41.2747 21L59.4715 38.9992C59.8004 38.3147 60 37.558 60 36.75V5.25C60 4.44185 59.8004 3.68527 59.4715 3.00078Z" fill="#214AB3" />
                              <path d="M54.7266 0H5.27344C4.46168 0 3.70172 0.198684 3.01418 0.526167L26.2716 23.5635C28.328 25.6108 31.672 25.6108 33.7284 23.5635L56.9858 0.526167C56.2983 0.198684 55.5383 0 54.7266 0Z" fill="#214AB3" />
                              <path d="M0.528516 3.00078C0.19957 3.68527 0 4.44185 0 5.25V36.75C0 37.5581 0.19957 38.3148 0.528516 38.9992L18.7253 21L0.528516 3.00078Z" fill="#214AB3" />
                              <path d="M38.7891 23.4746L36.2141 26.0381C32.7877 29.4493 27.2122 29.4493 23.7858 26.0381L21.2109 23.4746L3.01418 41.4738C3.70172 41.8013 4.46168 42 5.27344 42H54.7266C55.5383 42 56.2983 41.8013 56.9858 41.4738L38.7891 23.4746Z" fill="#214AB3" />
                            </svg>
                          </p>
                        </td>
                        <td>&nbsp;</td>
                        <td>
                          <a href="mailto:theelisabethgaubaschool@gmail.com">theelisabethgaubaschool@gmail.com</a>
                          <br />
                          <a href="mailto:shivniketan1@rediffmail.com">shivniketan1@rediffmail.com</a>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3}>&nbsp;</td>
                      </tr>
                      <tr>
                        <td>
                          <p>
                            <svg width="25" height="45" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M46.2778 34.0278C43.0111 34.0278 39.7444 33.4833 36.4778 32.3944C35.6611 32.1222 34.5721 32.3944 33.7556 32.9389L27.7667 38.9278C20.1446 35.1167 13.8833 28.5833 9.8 20.9611L15.7889 14.9722C16.6056 14.1556 16.8778 13.0667 16.3333 12.25C15.5167 9.25556 14.9722 5.98889 14.9722 2.72222C14.9722 1.08889 13.8833 0 12.25 0H2.72222C1.08889 0 0 1.08889 0 2.72222C0 28.3111 20.6889 49 46.2778 49C47.9111 49 49 47.9111 49 46.2778V36.75C49 35.1167 47.9111 34.0278 46.2778 34.0278ZM43.5556 24.5H49C49 10.8889 38.1111 0 24.5 0V5.44444C35.1167 5.44444 43.5556 13.8833 43.5556 24.5ZM32.6667 24.5H38.1111C38.1111 16.8778 32.1222 10.8889 24.5 10.8889V16.3333C29.1278 16.3333 32.6667 19.8722 32.6667 24.5Z" fill="#214AB3" />
                            </svg>
                          </p>
                        </td>
                        <td>&nbsp;</td>
                        <td>
                          <a href="tel:+918800541280">+91-8800541280</a>
                          <br />
                          <a href="tel:011-23367633">011-23367633</a>
                          <br />
                          <a href="tel:011-41646990">011-41646990</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-md-6">
                <h2 className="Main_header" style={{ marginBottom: "20px", marginTop: "10px" }}>Leave a Message</h2>
                <ContactForm />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">&nbsp;</div>
            </div>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1751.026819473637!2d77.20189775794539!3d28.628154449909182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5178d7f5f3%3A0x78e84ed048246160!2sElisabeth+Gauba+School!5e0!3m2!1sen!2sin!4v1517739510402"
            width="100%"
            height="350"
            frameBorder="0"
            allowFullScreen
            title="School location map"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
