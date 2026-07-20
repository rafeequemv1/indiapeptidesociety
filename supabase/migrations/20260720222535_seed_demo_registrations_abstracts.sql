-- Demo symposium registrations (3 with abstract metadata, 1 without).
-- File blobs live in Storage after real uploads; paths are placeholders for demos.

insert into public.symposium_registrations (
  id, name, email, phone, affiliation, category,
  payment_status, razorpay_payment_id, amount_label, receipt_no,
  abstract_title, abstract_file_name, abstract_mime_type, abstract_storage_path,
  abstract_file_size, has_abstract, submitted_at
)
select * from (values
  (
    'a1111111-1111-4111-8111-111111111111'::uuid,
    'Dr. Ananya Mehta',
    'ananya.mehta@iiserpune.ac.in',
    '+91 98765 41001',
    'IISER Pune',
    'Academia'::public.registration_category,
    'paid',
    'pay_demo_abstract_001',
    'Academia registration fee',
    'IPS-2026-ABS001',
    'Constrained peptides as modulators of protein–protein interactions',
    'mehta-abstract.pdf',
    'application/pdf',
    'a1111111-1111-4111-8111-111111111111/mehta-abstract.pdf',
    184320,
    true,
    '2026-03-12T10:20:00Z'::timestamptz
  ),
  (
    'a2222222-2222-4222-8222-222222222222'::uuid,
    'Rohan Kapoor',
    'rohan.kapoor@iitb.ac.in',
    '+91 98765 41002',
    'IIT Bombay',
    'Student'::public.registration_category,
    'pending',
    null,
    'Student registration fee',
    'IPS-2026-ABS002',
    'Solid-phase synthesis of cyclic hexapeptides for antimicrobial screening',
    'kapoor-sips-abstract.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'a2222222-2222-4222-8222-222222222222/kapoor-sips-abstract.docx',
    96256,
    true,
    '2026-03-14T14:05:00Z'::timestamptz
  ),
  (
    'a3333333-3333-4333-8333-333333333333'::uuid,
    'Priya Nambiar',
    'priya.nambiar@jnc.ac.in',
    '+91 98765 41003',
    'JNCASR Bengaluru',
    'Academia'::public.registration_category,
    'paid',
    'pay_demo_abstract_003',
    'Academia registration fee',
    'IPS-2026-ABS003',
    'Fluorescent peptide probes for imaging amyloid aggregation',
    'nambiar-abstract.pdf',
    'application/pdf',
    'a3333333-3333-4333-8333-333333333333/nambiar-abstract.pdf',
    221184,
    true,
    '2026-03-18T09:40:00Z'::timestamptz
  ),
  (
    'a4444444-4444-4444-8444-444444444444'::uuid,
    'Vikram Shah',
    'vikram.shah@example.com',
    '+91 98765 41004',
    'Industry — PeptideTech Pvt Ltd',
    'Industry'::public.registration_category,
    'pending',
    null,
    'Industry registration fee',
    'IPS-2026-REG004',
    null,
    null,
    null,
    null,
    null,
    false,
    '2026-03-20T11:15:00Z'::timestamptz
  )
) as v(
  id, name, email, phone, affiliation, category,
  payment_status, razorpay_payment_id, amount_label, receipt_no,
  abstract_title, abstract_file_name, abstract_mime_type, abstract_storage_path,
  abstract_file_size, has_abstract, submitted_at
)
where not exists (
  select 1 from public.symposium_registrations where id = v.id
);
