-- Seed core public content (safe to re-run only on empty tables).
-- Full member/blog dumps can be imported later from the app defaults.

insert into public.announcements (
  lead, dates, venue, coordinator, cta, cta_url, show_cta_button, ticker, is_active
)
select
  'We are pleased to announce the 11th Indian Peptide Symposium, organized in coordination with IIT Gandhinagar.',
  'February 25–27, 2027',
  'IIT Gandhinagar, Gandhinagar, Gujarat',
  'Prof. Sharad Gupta',
  'Stay tuned for updates.',
  '',
  false,
  'The 11th Indian Peptide Symposium will be held from 25–27 February 2027 at IIT Gandhinagar, Gujarat: Stay tuned!',
  true
where not exists (select 1 from public.announcements limit 1);

insert into public.registration_settings (
  enabled, title, subtitle, dates, venue, fee_note, razorpay_url, cta_label
)
select
  true,
  'Symposium Registration',
  'Register for the upcoming Indian Peptide Symposium. Payment via Razorpay will be available shortly.',
  'February 25–27, 2027',
  'IIT Gandhinagar, Gandhinagar, Gujarat',
  'Registration fee details will be confirmed with the Razorpay payment link.',
  '',
  'Register & Pay'
where not exists (select 1 from public.registration_settings limit 1);

insert into public.news_items (tag, display_date, title, excerpt, image_url, sort_order)
select * from (values
  ('Symposium', 'Feb 2027', '11th Indian Peptide Symposium', 'Join us at IIT Gandhinagar, Gujarat from 25–27 February 2027 for the premier peptide science gathering in India.', '', 0),
  ('Student', '2026', 'Student Indian Peptide Symposium', 'The next student symposium will be held in a different region, fostering young talent in peptide research.', '', 1),
  ('Industry', 'Latest', 'Industry Symposium Launch', 'A dedicated Industry Symposium is being discussed to launch, bridging academia and industry in peptide science.', '', 2)
) as v(tag, display_date, title, excerpt, image_url, sort_order)
where not exists (select 1 from public.news_items limit 1);

insert into public.site_stats (value, label, sort_order)
select * from (values
  ('08+', 'No. of Symposia', 0),
  ('16', 'Years since Inception', 1),
  ('352', 'Members', 2),
  ('08', 'LTA Award Winners', 3)
) as v(value, label, sort_order)
where not exists (select 1 from public.site_stats limit 1);

insert into public.team_members (name, role, affiliation, image_url, section, sort_order)
select * from (values
  ('Prof. K N Ganesh', 'President — IPS', 'Former Director — IISER, Pune', '/images/team/ganesh.png', 'executive'::public.team_section, 0),
  ('Prof. Gautam Basu', 'Vice President — IPS', 'Indian Statistical Institute, Kolkata', '/images/team/basu.png', 'executive'::public.team_section, 1),
  ('Prof. H. N. Gopi', 'Secretary — IPS', 'IISER Pune, Maharashtra', '/images/team/gopi.png', 'executive'::public.team_section, 2),
  ('Prof. V S Chauhan', '', 'Former Director — ICGEB, New Delhi', '/images/team/advisor-1.png', 'advisors'::public.team_section, 0),
  ('Prof. P Balaram', '', 'Former Director — IISc., Bengaluru', '/images/team/advisor-2.png', 'advisors'::public.team_section, 1),
  ('Prof. T K Chakraborty', '', 'Former Director — CDRI, Lucknow', '/images/team/advisor-3.png', 'advisors'::public.team_section, 2),
  ('Prof. A A Natu', '', 'Former Faculty — IISER, Pune', '/images/team/advisor-4.png', 'advisors'::public.team_section, 3)
) as v(name, role, affiliation, image_url, section, sort_order)
where not exists (select 1 from public.team_members limit 1);

insert into public.symposia (kind, title, dates, venue, coordinator, status, sort_order)
select * from (values
  ('upcoming'::public.symposium_kind, '11th Indian Peptide Symposium', 'February 25–27, 2027', 'IIT Gandhinagar, Gandhinagar, Gujarat', 'Prof. Sharad Gupta', 'Upcoming', 0),
  ('upcoming'::public.symposium_kind, '10th Indian Peptide Symposium', 'February 26–27, 2025', 'IISER Pune, Pune, Maharashtra', 'Prof. H N Gopi', 'Completed', 1),
  ('past'::public.symposium_kind, '10th Indian Peptide Symposium', 'February 26–27, 2025', 'IISER Pune, Pune', null, null, 0),
  ('past'::public.symposium_kind, '9th Indian Peptide Symposium', 'February 2019', 'India', null, null, 1),
  ('student'::public.symposium_kind, '4th Student Indian Peptide Symposium', '2024', 'Regional venue, India', null, null, 0)
) as v(kind, title, dates, venue, coordinator, status, sort_order)
where not exists (select 1 from public.symposia limit 1);

insert into public.blog_posts (slug, title, display_date, tag, excerpt, body, published, sort_order)
select * from (values
  (
    'welcome-to-the-ips-blog',
    'Welcome to the IPS Blog',
    'March 2026',
    'Society',
    'A quiet space for symposium notes, member stories, and the science that brings our community together.',
    '<p>The Indian Peptide Society has long been a meeting ground for scientists who share a passion for peptides.</p><h2>Why a blog</h2><p>Short, thoughtful pieces that capture what happens between symposia.</p><h2>Looking ahead</h2><p>The 11th Indian Peptide Symposium at IIT Gandhinagar will be a milestone.</p>',
    true,
    0
  ),
  (
    'one-symposium-each-year',
    'One Symposium, Each Year',
    'February 2026',
    'Symposium',
    'How the Indian Peptide Symposium anchors the society calendar — and why a single annual gathering still matters.',
    '<p>For many of us, the Indian Peptide Symposium is the fixed point of the year.</p><h2>A single gathering</h2><p>IPS concentrates energy into one flagship meeting.</p><h2>After the meeting</h2><p>Between symposia we keep the thread unbroken until the next year.</p>',
    true,
    1
  )
) as v(slug, title, display_date, tag, excerpt, body, published, sort_order)
where not exists (select 1 from public.blog_posts limit 1);

insert into public.site_meta (key, value)
values ('total_members', '352'::jsonb)
on conflict (key) do nothing;
