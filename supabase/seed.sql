-- =============================================================================
-- NEDC Platform — SAMPLE DATA (Phase 2)
--
-- Run this AFTER supabase/migrations/0001_init.sql, in the Supabase SQL editor,
-- to populate the marketing site with realistic placeholder content.
--
-- SAFE TO RE-RUN: every row uses a fixed id with "on conflict (id) do nothing",
-- so running it twice won't create duplicates.
--
-- TO REMOVE THE SAMPLE DATA later, delete these rows in the Table Editor (or
-- run: delete from courses where id = '0c0a5e00-0000-4000-8000-000000000001';
-- the cohorts/sessions cascade automatically).
--
-- Replace the text, prices, dates, and image URLs with your real content — the
-- pages read straight from these tables, so no code changes are needed.
-- =============================================================================

-- ---------- Course (the program) ----------
insert into public.courses (id, slug, title, subtitle, description, curriculum, hero_image_url, is_published)
values (
  '0c0a5e00-0000-4000-8000-000000000001',
  'startup-launch-program',
  'NEDC Startup Launch Program',
  'Go from idea to a launch-ready startup in 6 intensive live days.',
  'A hands-on, cohort-based program for first-time founders. Each day blends a live workshop, a working session on YOUR idea, and mentor Q&A — so you leave with a validated idea, a working MVP plan, and a 90-day action plan.',
  '[
    {"day":1,"title":"Idea & Opportunity","points":["Find a real problem worth solving","Validate the pain with quick research","Define your ideal customer","Frame your opportunity clearly"]},
    {"day":2,"title":"Customer & Market","points":["Run effective customer interviews","Size your market honestly","Map the competition","Sharpen your positioning"]},
    {"day":3,"title":"Product & MVP","points":["Scope a lean MVP","Build with no-code / low-code tools","Pricing fundamentals","Ship something people can use"]},
    {"day":4,"title":"Business Model & Finance","points":["Unit economics made simple","Choose a revenue model","Build a one-page financial plan","Funding options in India"]},
    {"day":5,"title":"Go-to-Market","points":["Pick your acquisition channels","Content & community basics","Sales for founders","Land your first 10 customers"]},
    {"day":6,"title":"Pitch & Next Steps","points":["Craft your story & deck","Deliver a demo-day pitch","Investor & incubator landscape","Your 90-day action plan"]}
  ]'::jsonb,
  'https://picsum.photos/seed/nedc-hero/1200/600',
  true
)
on conflict (id) do nothing;

-- ---------- Cohorts (dated runs — what students buy). Prices are in PAISE. ----------
insert into public.cohorts (id, course_id, name, start_date, end_date, timezone, price_inr, capacity, status, enroll_open)
values
  ('0c0a5e00-0000-4000-8000-000000000011','0c0a5e00-0000-4000-8000-000000000001','July 2026 Batch','2026-07-14','2026-07-19','Asia/Kolkata',499900,40,'open',true),
  ('0c0a5e00-0000-4000-8000-000000000012','0c0a5e00-0000-4000-8000-000000000001','September 2026 Batch','2026-09-08','2026-09-13','Asia/Kolkata',599900,40,'upcoming',true)
on conflict (id) do nothing;

-- ---------- Speakers / mentors ----------
insert into public.speakers (id, name, title, bio, photo_url, sort_order, is_published)
values
  ('0c0a5e00-0000-4000-8000-000000000021','Aarav Mehta','Founder & CEO, LaunchPad','Two-time founder who scaled a SaaS startup to 50,000 users before its acquisition.','https://i.pravatar.cc/400?img=12',1,true),
  ('0c0a5e00-0000-4000-8000-000000000022','Priya Nair','Partner, Seed Ventures','Early-stage investor who has backed 30+ Indian startups across fintech and SaaS.','https://i.pravatar.cc/400?img=5',2,true),
  ('0c0a5e00-0000-4000-8000-000000000023','Rohan Gupta','Head of Growth, ScaleKart','Growth operator specializing in zero-to-one customer acquisition for D2C brands.','https://i.pravatar.cc/400?img=33',3,true),
  ('0c0a5e00-0000-4000-8000-000000000024','Sneha Iyer','Product Lead, BuildLabs','Product leader who has shipped consumer apps used by millions across India.','https://i.pravatar.cc/400?img=20',4,true),
  ('0c0a5e00-0000-4000-8000-000000000025','Vikram Singh','Startup Lawyer, FoundersLegal','Advises early-stage founders on incorporation, fundraising, and compliance.','https://i.pravatar.cc/400?img=51',5,true),
  ('0c0a5e00-0000-4000-8000-000000000026','Ananya Rao','Founder, Craftly (exited)','Bootstrapped a marketplace to profitability and a successful exit in 4 years.','https://i.pravatar.cc/400?img=9',6,true)
on conflict (id) do nothing;

-- Link speakers to the course (which mentors appear on this program).
insert into public.course_speakers (course_id, speaker_id, sort_order)
values
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000021',1),
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000022',2),
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000023',3),
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000024',4),
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000025',5),
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000026',6)
on conflict (course_id, speaker_id) do nothing;

-- ---------- Team ----------
insert into public.team_members (id, name, role, bio, photo_url, sort_order, is_published)
values
  ('0c0a5e00-0000-4000-8000-000000000031','Dr. Kavita Sharma','Program Director','Leads NEDC programs with 15 years in entrepreneurship education.','https://i.pravatar.cc/400?img=45',1,true),
  ('0c0a5e00-0000-4000-8000-000000000032','Arjun Verma','Head of Cohorts','Runs day-to-day operations and keeps every cohort on track.','https://i.pravatar.cc/400?img=14',2,true),
  ('0c0a5e00-0000-4000-8000-000000000033','Meera Joshi','Community & Mentors','Connects founders with the right mentors and alumni.','https://i.pravatar.cc/400?img=32',3,true),
  ('0c0a5e00-0000-4000-8000-000000000034','Sahil Khan','Curriculum Lead','Designs the hands-on workshops and resources.','https://i.pravatar.cc/400?img=60',4,true)
on conflict (id) do nothing;

-- ---------- Gallery (placeholder photos; varied sizes for the masonry layout) ----------
insert into public.gallery_images (id, image_url, caption, sort_order, is_published)
values
  ('0c0a5e00-0000-4000-8000-000000000041','https://picsum.photos/seed/nedc-g1/800/600','Demo day, March 2026',1,true),
  ('0c0a5e00-0000-4000-8000-000000000042','https://picsum.photos/seed/nedc-g2/800/1000','A live working session',2,true),
  ('0c0a5e00-0000-4000-8000-000000000043','https://picsum.photos/seed/nedc-g3/800/700','Mentor Q&A',3,true),
  ('0c0a5e00-0000-4000-8000-000000000044','https://picsum.photos/seed/nedc-g4/800/600','Cohort kickoff',4,true),
  ('0c0a5e00-0000-4000-8000-000000000045','https://picsum.photos/seed/nedc-g5/800/900','Founders networking',5,true),
  ('0c0a5e00-0000-4000-8000-000000000046','https://picsum.photos/seed/nedc-g6/800/600','Pitch practice',6,true),
  ('0c0a5e00-0000-4000-8000-000000000047','https://picsum.photos/seed/nedc-g7/800/800','Team brainstorming',7,true),
  ('0c0a5e00-0000-4000-8000-000000000048','https://picsum.photos/seed/nedc-g8/800/650','Graduation',8,true)
on conflict (id) do nothing;

-- ---------- FAQs ----------
insert into public.faqs (id, question, answer, sort_order, is_published)
values
  ('0c0a5e00-0000-4000-8000-000000000051','Who is this program for?','First-time founders, students, and professionals with a startup idea (or the itch to find one). No prior experience is required — just commitment for the week.',1,true),
  ('0c0a5e00-0000-4000-8000-000000000052','How are the sessions delivered?','Live on Zoom, scheduled in IST. You join from your dashboard each day. There is no pre-recorded course to binge — it is real-time and interactive.',2,true),
  ('0c0a5e00-0000-4000-8000-000000000053','What if I miss a session?','Every session is recorded and added to your dashboard, so you can catch up. Live attendance is recommended to get the most out of mentor Q&A.',3,true),
  ('0c0a5e00-0000-4000-8000-000000000054','How much time should I set aside each day?','Plan for roughly 3–4 hours per day: the live workshop plus a working session on your own idea.',4,true),
  ('0c0a5e00-0000-4000-8000-000000000055','How do I pay?','Securely via Razorpay — UPI, debit/credit cards, or netbanking. All prices are in INR.',5,true),
  ('0c0a5e00-0000-4000-8000-000000000056','Do I get a certificate?','Yes. You receive a certificate of completion at the end of the program.',6,true),
  ('0c0a5e00-0000-4000-8000-000000000057','What is your refund policy?','If you change your mind before the cohort starts, contact us for a full refund. Once the program begins, fees are non-refundable.',7,true),
  ('0c0a5e00-0000-4000-8000-000000000058','I have another question — how do I reach you?','Email us at hello@nedc.example and we will get back to you quickly.',8,true)
on conflict (id) do nothing;
