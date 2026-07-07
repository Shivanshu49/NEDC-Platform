-- =============================================================================
-- REAL MENTOR CONTENT  (run this in the Supabase SQL Editor → Run)
-- =============================================================================
-- This is real, consented mentor content — NOT sample/placeholder data (that
-- lives in seed.sql). Re-runnable: the insert upserts by id, so running it again
-- just refreshes the row. The mentor appears automatically in the home page
-- "Mentors" section (#mentors) and on the /speakers page.
--
-- Photos: served from the repo under public/speakers/ (one file per mentor), so
-- they work once this branch is deployed (no Supabase Storage upload needed).
--
-- NOTE: your live `speakers` table may still hold the 6 placeholder rows from
-- seed.sql (Aarav Mehta, Priya Nair, …). The landing copy promises "real people
-- only; no placeholders", so once your real mentors are in, delete the samples:
--   delete from public.speakers where id::text like '0c0a5e00-%';
-- =============================================================================

insert into public.speakers (id, name, title, bio, photo_url, sort_order, is_published)
values
  (
    '5a715000-0000-4000-8000-000000000001',
    'Satish Kumar Shervan',
    'Ex-Chief Manager, Punjab National Bank',
    'A career banker with over three decades at Punjab National Bank, retiring as Chief Manager, across credit portfolio, foreign exchange, and HR. He brings deep expertise in export-import finance, credit-risk rating, and NPA resolution, and has served over 10 years on the faculty of NSIC and NIESBUD. A certified Master Trainer in Entrepreneurship Development for MSMEs under Skill India and NIESBUD (2025), he now mentors new entrepreneurs and exporters on building and funding globally competitive ventures.',
    '/speakers/satish-kumar-shervan.jpg',
    1,
    true
  ),
  (
    '5a715000-0000-4000-8000-000000000002',
    'Ravi Gupta',
    'MSME Growth Strategist and Entrepreneurship Mentor',
    'An MSME growth strategist and entrepreneurship mentor with more than 20 years of experience helping MSMEs, start-ups, government bodies, and institutions design and run scalable business growth programs. He specializes in turning government schemes such as PMEGP, CM Yuva, NABARD, and SIDBI into real businesses and livelihoods. He has trained over 1,75,000 people across India and abroad, delivered programs in more than 500 institutions, and conducted 200+ Entrepreneurship Development Programs and 175+ Training of Trainers programs. He serves as a Subject Matter Expert with the Quality Council of India, Senior Faculty at NSIC, and Mentor and Trainer at NIESBUD, and has mentored MSMEs under the Walmart Vriddhi program.',
    '/speakers/ravi-gupta.jpg',
    2,
    true
  ),
  (
    '5a715000-0000-4000-8000-000000000003',
    'S M Rounaque Mustafa',
    'Startup Coach and Technology Business Incubation Expert',
    'A startup coach with over 25 years of experience in program development, technology commercialisation, technology business incubation, and early-stage venture funding. He has been instrumental in setting up and running five government-approved Technology Business Incubators, including those at IIM Lucknow and Delhi Technological University, and has incubated more than 1,000 startups while impacting over 15,000 aspiring entrepreneurs. He has managed a SEED corpus of over 300 crores and helped startups raise SEED to Series A funding through angel investors, venture capitalists, and corporate VCs. He has advised leading Indian PSUs and corporates such as IOCL, HPCL, ONGC, GAIL, BHEL, and Physics Wallah on open innovation and corporate venturing, and has delivered large public-private partnership programs with UNDP, NSTEDB-DST, Intel, BIRAC, MeitY, Startup India, and AIC-NITI Aayog. An MBA in Information Technology with a certificate in Entrepreneurship from the University of California, Berkeley, he is pursuing a PhD at DTU and teaches innovation, IPR, entrepreneurship, and venture financing at IIMs and IITs. He is the Founding President of the Indo Arab Angel Network.',
    '/speakers/s-m-rounaque-mustafa.jpg',
    3,
    true
  )
on conflict (id) do update set
  name         = excluded.name,
  title        = excluded.title,
  bio          = excluded.bio,
  photo_url    = excluded.photo_url,
  sort_order   = excluded.sort_order,
  is_published = excluded.is_published;

-- Optional: pin him to a specific program's mentor lineup (course_speakers join).
-- Only needed if a course/program page filters mentors by course. Replace the
-- course id with your real course's id from the `courses` table first.
-- insert into public.course_speakers (course_id, speaker_id, sort_order)
-- values ('<your-course-id>', '5a715000-0000-4000-8000-000000000001', 1)
-- on conflict (course_id, speaker_id) do nothing;


-- =============================================================================
-- FULL PROFILE — reference (source: his EDP mentor profile PDF, 2026-06-21)
-- Kept here so the complete CV is preserved; the public card shows the short bio
-- above. Contact details are intentionally NOT published on the site.
-- -----------------------------------------------------------------------------
-- Name:     Satish Kumar Shervan
-- Role:     Ex-Chief Manager, Punjab National Bank
-- LinkedIn: http://www.linkedin.com/in/satish-kumar-shervan-01867733/
-- (Phone & personal email are in the source PDF — kept OUT of this repo for privacy.)
--
-- 1. EDUCATIONAL & PROFESSIONAL QUALIFICATIONS / CERTIFICATIONS
--   a. Bachelor's Degree in Economics, Guru Nanak University, Amritsar (1978)
--   b. CAIIB — Certified by the Indian Institute of Banking & Finance (1990)
--   c. Diploma in Export & Import Trade (1999)
--   d. Intensive Training on Credit Portfolio & Foreign Exchange Business (2000)
--   e. Master's in Personnel Management & Industrial Relations, Alagappa
--      University, Karaikudi (2003)
--   f. Merchant banking business & security training, UTI Security Institute,
--      Navi Mumbai (2006)
--   g. UCC 600 — CITI Bank & J.P. Morgan sponsored course (2013)
--   h. MBA in International Business, Central University, Pondicherry (2016)
--   i. Talent Management certification, IIM / XLRI-Jamshedpur (2017)
--   j. Master Trainer in Entrepreneurship Development for MSME — jointly by
--      Skill India & NIESBUD (2025)
--
-- 2. EXPERIENCE & SKILLS
--   a. Three decades across banking — Branch Manager to Senior Management in
--      credit portfolio, FOREX management & HRD.
--   b. Credit-risk rating of large/exceptionally large borrowers via CARE, ICRA,
--      FITCH and Brickwork, plus the bank's internal credit-risk model.
--   c. International business / FOREX — documentation for SEZ (Mumbai),
--      International Banking Branch (Delhi) and large corporate branches.
--   d. 10 years on the faculty of MSME / Govt enterprises — NSIC (Okhla, Delhi)
--      and NIESBUD (Noida).
--   e. Export credit proposals; packing credit & post-shipment credit
--      (purchase/discounting/collection of export docs, import remittances,
--      buyer's credit).
--   f. Stressed assets, SMA and NPA resolution — bankable One-Time-Settlement
--      proposals via borrower dialogue.
--   g. Venture-capital fund proposals for new start-ups and existing businesses.
--
-- 3. PRESENT ACTIVITIES
--   1. Training new entrepreneurs & exporters to start and grow businesses with
--      global market reach.
--   2. Addressing seminars for Chambers of Commerce, NGOs, companies & MSME
--      forums.
--   3. Handling credit proposals for new MSME projects — large-ticket, domestic
--      and international.
-- =============================================================================


-- =============================================================================
-- FULL PROFILE — reference (source: his one-pager mentor profile PDF, 2026-06-24)
-- Kept here so the complete profile is preserved; the public card shows the short
-- bio above. Contact details are intentionally NOT published on the site.
-- -----------------------------------------------------------------------------
-- Name:  Ravi Gupta
-- Role:  MSME Growth Strategist | Govt Schemes Expert | Entrepreneurship Mentor
-- (Phone & personal email are in the source PDF — kept OUT of this repo for privacy.)
--
-- PROFILE SNAPSHOT
--   20+ years helping MSMEs, start-ups, government bodies and institutions design
--   and implement scalable business growth and entrepreneurship programs.
--   Specialises in bridging policy with execution — turning government schemes,
--   training programs and ideas into real business outcomes and livelihoods.
--
-- 1. CORE SERVICES
--   a. MSME & start-up consulting — business setup & scaling strategy; govt scheme
--      advisory (PMEGP, CM Yuva, NABARD, SIDBI); market linkage & revenue growth;
--      AI in business.
--   b. Training & workshops — Entrepreneurship Development Programs (EDP); skill
--      development & employability; Training of Trainers (ToT); IIBF training;
--      Management & Faculty Development Programs.
--   c. Government & CSR projects — program design & execution; capacity building;
--      livelihood & rural development.
--   d. Institutional engagement — start-up incubation support; college/university
--      entrepreneurship programs; industry-academia collaboration.
--
-- 2. IMPACT & ACHIEVEMENTS
--   a. Trained 1,75,000+ individuals across India & internationally.
--   b. Delivered programs in 500+ institutions.
--   c. Supported thousands of MSMEs & start-ups.
--   d. Worked with international participants (SAARC & Africa).
--   e. Conducted 200+ EDPs & 175+ ToT programs.
--   f. Enabled 500+ job placements.
--
-- 3. KEY ASSOCIATIONS & EXPERIENCE
--   a. Subject Matter Expert — Quality Council of India (QCI).
--   b. Senior Faculty — NSIC.
--   c. Mentor & Trainer — NIESBUD.
--   d. MSME Mentor — Walmart Vriddhi Program.
--   e. Trainer — Delhi Police Project YUVA.
--   f. Experience with NABARD, SIDBI, banks and government departments.
-- =============================================================================


-- =============================================================================
-- FULL PROFILE — reference (source: his CV / mentor profile, 2026-07-07)
-- Kept here so the complete profile is preserved; the public card shows the short
-- bio above. Contact details are intentionally NOT published on the site.
-- -----------------------------------------------------------------------------
-- Name:     S M Rounaque Mustafa
-- Role:     Startup Coach | Technology Business Incubation & Early-Stage Venture Funding
-- LinkedIn: https://in.linkedin.com/in/srmustafa/
-- (Phone & personal email are in the source document — kept OUT of this repo for privacy.)
--
-- PROFILE SNAPSHOT
--   A passionate startup coach with 25+ years of experience in program development,
--   technology commercialisation, technology business incubation and early-stage
--   venture funding. Highly networked across the IT industry, startup ecosystem and
--   investment world (VCs, incubators, angel networks, industry forums & associations).
--
-- 1. INCUBATION & ECOSYSTEM
--   a. Set up & ran 5 Govt-approved Technology Business Incubators — JSSATE-STEP,
--      NIET, CHITKARA, IIM Lucknow, and Delhi Technological University / DCE —
--      supported by various central ministries of the Govt of India.
--   b. Incubated 1000+ startups; impacted 15,000+ aspiring entrepreneurs / startups
--      through research and technology commercialisation.
--   c. Managed a SEED corpus of more than 300+ crores; helped startups raise SEED
--      to Series 'A' funding through Angels, VCs & Corporate VCs.
--
-- 2. CORPORATE & GOVERNMENT ADVISORY
--   a. Advised many Indian PSUs and large corporates (IOCL, HPCL, ONGC, GAIL, NFL,
--      BHEL, Physics Wallah) on open innovation and corporate venturing programs.
--   b. Designed & developed startup policy, joint IP / technology development
--      programs with startups & academia, and SEBI-regulated Corporate Venture
--      Capital funds for strategically aligned startups.
--   c. Worked on large PPP programs of national & global organizations promoting
--      SMEs and startups — UNDP, InfoDev, NSTEDB-DST, Lockheed Martin, Intel,
--      Indo US S&T Forum, DC-MSME, BIRAC, MeitY, TePP, DSIR, Startup India,
--      AIC-NITI Aayog, Business Blaster, etc.
--
-- 3. ACADEMIA & RESEARCH
--   a. MBA in Information Technology (India); Certificate course on Entrepreneurship
--      (Theory to Practice), University of California, Berkeley, USA.
--   b. Pursuing PhD (part time) at DTU — research: "Examining the factors affecting
--      financial sustainability of Business Incubators: Indian Perspective".
--   c. Speaks at conferences; teaches Innovation & technology management, IPR
--      management, Entrepreneurship and Venture Financing at IIMs and IITs.
--   d. Sits on advisory boards of incubators & startups and on investment
--      committees of funding agencies.
--
-- 4. MEMBERSHIPS & ASSOCIATIONS
--   a. TiE Delhi, ISBA, nBIA, IVCA (Indian Venture Capital Association), CII Startup.
--   b. Founding President — Indo Arab Angel Network.
--   c. Curator — CorporateVentureHub.com, a global platform for sourcing IP,
--      technologies and startups for corporates.
--
-- 5. EDUCATION
--   a. PhD in Entrepreneurship (to be awarded).
--   b. Master of Business Administration in Information Technology.
--   c. Post Graduate Diploma in Computer Application.
--   d. B.A. (Hons).
--
-- 6. OTHER CERTIFICATE COURSES
--   a. Certificate in Entrepreneurship Development, UC Berkeley, USA.
--   b. Executive Leadership Development program, IIM Lucknow.
--   c. Faculty Development Program, NIESBUD, Govt. of India.
--   d. Open Innovation and Corporate Venturing (Oxymoronic Strategy), IIM Lucknow.
--   e. Developer Program on Machine Learning, NVIDIA.
-- =============================================================================
