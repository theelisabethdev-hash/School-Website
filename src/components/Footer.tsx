"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <footer>
        <div className="agileinfo_copyright" style={{ marginTop: "30px" }}>
          <div className="container" style={{ textAlign: "center", color: "#fff" }}>
            <p>© {new Date().getFullYear()} The Elisabeth Gauba School — Administration Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer>
      <div className="footer">
        <div className="container">
          <div className="col-md-3 agile_footer_grid">
            <h3>About Us</h3>
            <ul className="w3_address">
              <li><a href="/school-history">School History</a></li>
              <li><a href="/mission">Mission</a></li>
            </ul>
          </div>
          <div className="col-md-3 agile_footer_grid">
            <h3>Curriculum</h3>
            <ul className="w3_address">
              <li><a href="/academic-calendar">Academic Calendar</a></li>
              <li><a href="/approach">Approach</a></li>
            </ul>
          </div>
          <div className="col-md-4 agile_footer_grid">
            <h3>Admissions</h3>
            <ul className="w3_address">
              <li><a href="/admissions">Admissions and Eligibility</a></li>
              <li><a href="/fee-structure">Fees Structure</a></li>
            </ul>
          </div>
          <div className="col-md-2 agile_footer_grid">
            <h3>Useful Links</h3>
            <ul className="w3_address">
              <li><a href="/activities">Activities</a></li>
              <li><a href="/notices">Notices</a></li>
              <li><a href="/gallery">Gallery</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="agileinfo_copyright">
        <div className="container">
          <div className="col-md-1 agile_footer_grid">
            <a href="https://www.instagram.com/theelisabethgaubaschool/" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.4453 17.5C21.4453 19.35 19.9028 20.8496 18 20.8496C16.0972 20.8496 14.5547 19.35 14.5547 17.5C14.5547 15.65 16.0972 14.1504 18 14.1504C19.9028 14.1504 21.4453 15.65 21.4453 17.5Z" fill="white" />
                <path d="M26.0574 11.5736C25.8918 11.1372 25.6275 10.7423 25.2842 10.4181C24.9508 10.0843 24.5448 9.82746 24.0958 9.66644C23.7316 9.52892 23.1844 9.36523 22.1767 9.32064C21.0866 9.27231 20.7598 9.26189 18 9.26189C15.24 9.26189 14.9131 9.27204 13.8233 9.32037C12.8156 9.36523 12.2682 9.52892 11.9042 9.66644C11.4552 9.82746 11.049 10.0843 10.7158 10.4181C10.3725 10.7423 10.1082 11.137 9.94235 11.5736C9.8009 11.9276 9.63254 12.4598 9.58667 13.4396C9.53696 14.4991 9.52625 14.8169 9.52625 17.5003C9.52625 20.1834 9.53696 20.5011 9.58667 21.561C9.63254 22.5407 9.8009 23.0726 9.94235 23.4267C10.1082 23.8633 10.3722 24.258 10.7155 24.5821C11.049 24.9159 11.4549 25.1728 11.904 25.3338C12.2682 25.4716 12.8156 25.6353 13.8233 25.6799C14.9131 25.7282 15.2397 25.7384 17.9997 25.7384C20.76 25.7384 21.0869 25.7282 22.1765 25.6799C23.1842 25.6353 23.7316 25.4716 24.0958 25.3338C24.9972 24.9958 25.7097 24.3031 26.0574 23.4267C26.1988 23.0726 26.3672 22.5407 26.4133 21.561C26.463 20.5011 26.4735 20.1834 26.4735 17.5003C26.4735 14.8169 26.463 14.4991 26.4133 13.4396C26.3675 12.4598 26.1991 11.9276 26.0574 11.5736ZM18 22.6601C15.0686 22.6601 12.6922 20.35 12.6922 17.5C12.6922 14.65 15.0686 12.3399 18 12.3399C20.9312 12.3399 23.3075 14.65 23.3075 17.5C23.3075 20.35 20.9312 22.6601 18 22.6601ZM23.5173 13.3418C22.8323 13.3418 22.277 12.8019 22.277 12.1359C22.277 11.47 22.8323 10.93 23.5173 10.93C24.2023 10.93 24.7577 11.47 24.7577 12.1359C24.7574 12.8019 24.2023 13.3418 23.5173 13.3418Z" fill="white" />
                <path d="M18 0C8.06039 0 0 7.83649 0 17.5C0 27.1635 8.06039 35 18 35C27.9396 35 36 27.1635 36 17.5C36 7.83649 27.9396 0 18 0ZM28.2736 21.643C28.2236 22.7127 28.0486 23.443 27.7932 24.0823C27.2563 25.4321 26.1587 26.4991 24.7703 27.0212C24.1131 27.2695 23.3616 27.4393 22.2616 27.4882C21.1594 27.5371 20.8073 27.5488 18.0003 27.5488C15.193 27.5488 14.8412 27.5371 13.7387 27.4882C12.6387 27.4393 11.8872 27.2695 11.2299 27.0212C10.54 26.7688 9.91544 26.3734 9.39908 25.862C8.87338 25.3603 8.46661 24.7528 8.20706 24.0823C7.95163 23.4433 7.77667 22.7127 7.72668 21.6432C7.67587 20.5714 7.66406 20.229 7.66406 17.5C7.66406 14.771 7.67587 14.4286 7.72641 13.357C7.7764 12.2873 7.95108 11.557 8.20651 10.9177C8.46606 10.2472 8.87311 9.63974 9.39908 9.13799C9.91516 8.62663 10.54 8.23116 11.2297 7.97882C11.8872 7.73048 12.6384 7.56065 13.7387 7.51179C14.8409 7.46292 15.193 7.45117 18 7.45117C20.807 7.45117 21.1591 7.46292 22.2613 7.51205C23.3616 7.56065 24.1128 7.73048 24.7703 7.97855C25.46 8.2309 26.0848 8.62663 26.6012 9.13799C27.1269 9.64001 27.5339 10.2472 27.7932 10.9177C28.0489 11.557 28.2236 12.2873 28.2739 13.357C28.3241 14.4286 28.3359 14.771 28.3359 17.5C28.3359 20.229 28.3241 20.5714 28.2736 21.643Z" fill="white" />
              </svg> &nbsp;&nbsp;
            </a>
            <a href="https://m.facebook.com/The-Elisabeth-Gauba-School-101013958058942/" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 17.5C35 7.83399 27.166 0 17.5 0C7.83399 0 0 7.83399 0 17.5C0 27.166 7.83399 35 17.5 35C17.6025 35 17.7051 35 17.8076 34.9932V21.376H14.0479V16.9941H17.8076V13.7676C17.8076 10.0283 20.0908 7.99121 23.4268 7.99121C25.0264 7.99121 26.4004 8.10742 26.7969 8.16211V12.0723H24.5C22.6885 12.0723 22.333 12.9336 22.333 14.1982V16.9873H26.6738L26.1064 21.3691H22.333V34.3232C29.6475 32.2246 35 25.4912 35 17.5Z" fill="white" />
              </svg>
            </a>
          </div>
          <div className="col-md-4 agile_footer_grid">
            <ul>
              <li style={{ color: "#ffffff" }}>
                <i className="fa fa-map-marker" aria-hidden="true"></i>&nbsp;&nbsp;
                <a style={{ color: "#ffffff" }} href="https://goo.gl/maps/KMxgfUTnkhYQaNyR7" target="_blank" rel="noreferrer">
                  Entry from Gate No-9, Kali Bari Lane, New Delhi
                </a>
              </li>
            </ul>
          </div>
          <div className="col-md-4 agile_footer_grid">
            <a style={{ color: "#ffffff" }} href="mailto:shivniketan1@rediffmail.com">
              <i className="fa fa-envelope" aria-hidden="true"></i>&nbsp;&nbsp;shivniketan1@rediffmail.com
            </a>
          </div>
          <div className="col-md-3 agile_footer_grid">
            <i className="fa fa-phone" style={{ color: "#ffffff" }} aria-hidden="true">
              &nbsp;&nbsp;
              <a style={{ color: "#ffffff" }} href="tel:011-23367633">011-23367633</a> &nbsp;/ &nbsp;
              <a style={{ color: "#ffffff" }} href="tel:011-41646990">011-41646990</a>
            </i>
          </div>
        </div>
      </div>
    </footer>
  );
}
