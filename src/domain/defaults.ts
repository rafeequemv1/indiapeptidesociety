import type { SiteContent } from "./types";

export const defaultContent: SiteContent = {
  announcement: {
    lead: "We are pleased to announce the 11th Indian Peptide Symposium, organized in coordination with IIT Gandhinagar.",
    dates: "February 25–27, 2027",
    venue: "IIT Gandhinagar, Gandhinagar, Gujarat",
    coordinator: "Prof. Sharad Gupta",
    cta: "Stay tuned for updates.",
    ctaUrl: "",
    showCtaButton: false,
    ticker: "The 11th Indian Peptide Symposium will be held from 25–27 February 2027 at IIT Gandhinagar, Gujarat: Stay tuned!",
  },
  news: [
    { tag: "Symposium", date: "Feb 2027", title: "11th Indian Peptide Symposium", excerpt: "Join us at IIT Gandhinagar, Gujarat from 25–27 February 2027 for the premier peptide science gathering in India.", image: "" },
    { tag: "Student", date: "2026", title: "Student Indian Peptide Symposium", excerpt: "The next student symposium will be held in a different region, fostering young talent in peptide research.", image: "" },
    { tag: "Industry", date: "Latest", title: "Industry Symposium Launch", excerpt: "A dedicated Industry Symposium is being discussed to launch, bridging academia and industry in peptide science.", image: "" },
  ],
  stats: [
    { value: "08+", label: "No. of Symposia" },
    { value: "16", label: "Years since Inception" },
    { value: "352", label: "Members" },
    { value: "08", label: "LTA Award Winners" },
  ],
  lifetimeAwards: [
    { image: "/images/awards/award-1.png", caption: "Lifetime Achievement Award presentation" },
    { image: "/images/awards/award-2.png", caption: "Honouring distinguished peptide scientists" },
    { image: "/images/awards/award-3.png", caption: "Indian Peptide Society award ceremony" },
    { image: "/images/awards/award-4.png", caption: "Prof. S. B. Mathur — Lifetime Achievement Award" },
  ],
  services: [
    { title: "Platform to Network", description: "IPS provides a platform to network across its members and other researchers." },
    { title: "Forum to Collaborate", description: "IPS is a forum to exchange ideas among peptide scientists." },
    { title: "Biennial Symposium", description: "IPS organises biennial Indian Peptide Symposium every alternate year." },
    { title: "Student Symposium", description: "Student symposium is organised every alternate year in different regions." },
    { title: "Industry Symposium", description: "A dedicated Industry Symposium is being discussed to launch." },
    { title: "Scientific Recognitions", description: "IPS recognise and award Lifetime Achievement and Young Scientist Awards." },
    { title: "International Collaboration", description: "IPS collaborates with other societies to help its members." },
    { title: "Research Updates", description: "Encourage members to contribute their research updates on IPS website." },
  ],
  team: [
    { name: "Prof. K N Ganesh", role: "President — IPS", affiliation: "Former Director — IISER, Pune", image: "/images/team/ganesh.png", section: "executive" },
    { name: "Prof. Gautam Basu", role: "Vice President — IPS", affiliation: "Indian Statistical Institute, Kolkata", image: "/images/team/basu.png", section: "executive" },
    { name: "Prof. H. N. Gopi", role: "Secretary — IPS", affiliation: "IISER Pune, Maharashtra", image: "/images/team/gopi.png", section: "executive" },
    { name: "Prof. V S Chauhan", role: "", affiliation: "Former Director — ICGEB, New Delhi", image: "/images/team/advisor-1.png", section: "advisors" },
    { name: "Prof. P Balaram", role: "", affiliation: "Former Director — IISc., Bengaluru", image: "/images/team/advisor-2.png", section: "advisors" },
    { name: "Prof. T K Chakraborty", role: "", affiliation: "Former Director — CDRI, Lucknow", image: "/images/team/advisor-3.png", section: "advisors" },
    { name: "Prof. A A Natu", role: "", affiliation: "Former Faculty — IISER, Pune", image: "/images/team/advisor-4.png", section: "advisors" },
  ],
  upcomingSymposia: [
    { title: "11th Indian Peptide Symposium", dates: "February 25–27, 2027", venue: "IIT Gandhinagar, Gandhinagar, Gujarat", coordinator: "Prof. Sharad Gupta", status: "Upcoming" },
    { title: "10th Indian Peptide Symposium", dates: "February 26–27, 2025", venue: "IISER Pune, Pune, Maharashtra", coordinator: "Prof. H N Gopi", status: "Completed" },
  ],
  pastSymposia: [
    { title: "10th Indian Peptide Symposium", dates: "February 26–27, 2025", venue: "IISER Pune, Pune" },
    { title: "9th Indian Peptide Symposium", dates: "February 2019", venue: "India" },
    { title: "8th Indian Peptide Symposium", dates: "February 2017", venue: "India" },
    { title: "7th Indian Peptide Symposium", dates: "February 2015", venue: "India" },
    { title: "6th Indian Peptide Symposium", dates: "February 2013", venue: "India" },
    { title: "5th Indian Peptide Symposium", dates: "February 2011", venue: "India" },
    { title: "4th Indian Peptide Symposium", dates: "February 2009", venue: "India" },
    { title: "3rd Indian Peptide Symposium", dates: "February 2007", venue: "India" },
  ],
  pastStudentSymposia: [
    { title: "4th Student Indian Peptide Symposium", dates: "2024", venue: "Regional venue, India" },
    { title: "3rd Student Indian Peptide Symposium", dates: "2022", venue: "Regional venue, India" },
    { title: "2nd Student Indian Peptide Symposium", dates: "2020", venue: "Regional venue, India" },
    { title: "1st Student Indian Peptide Symposium", dates: "2018", venue: "Regional venue, India" },
  ],
  founderMembers: [
    { name: "Mr. Venkat R. Kalavakolanu", title: "CEO, Jupiter Biosciences Limited, Secunderabad (Telangana)", role: "Treasurer" },
    { name: "Dr. Sudhanand Prasad", title: "GM — Dabur Research Foundation", role: "Joint Secretary" },
    { name: "Dr. Dinkar Sahal", title: "Scientist, ICGEB New Delhi", role: "Executive Member" },
    { name: "Dr. Shirshendu Mukherjee", title: "Scientist, ICGEB New Delhi", role: "Executive Member" },
  ],
  permanentMembers: [
    { name: "Mr. Venkat R. Kalavakolanu", membershipNo: 1, isFounder: true },
    { name: "Dr. Sudhanand Prasad", membershipNo: 2, isFounder: true },
    { name: "Dr. Dinkar Sahal", membershipNo: 3, isFounder: true },
    { name: "Dr. Shirshendu Mukherjee", membershipNo: 4, isFounder: true },
    { name: "Ravindra Singh", membershipNo: 469 },
    { name: "Sharad Bohra", membershipNo: 468 },
    { name: "Chinmaya Panda", membershipNo: 467 },
    { name: "Jayappa Jogappa", membershipNo: 457 },
    { name: "Jayanta Chatterjee", membershipNo: 456 },
    { name: "Sandhya Sadanandan", membershipNo: 455 },
    { name: "Tapan Kumar Mohanta", membershipNo: 451 },
    { name: "Dimpy Kalia", membershipNo: 450 },
    { name: "Subhasish Roy", membershipNo: 449 },
    { name: "Gaurav Jerath", membershipNo: 448 },
    { name: "Ganesh Krishna", membershipNo: 447 },
    { name: "Kalpana Kumari", membershipNo: 446 },
    { name: "Kannan RR Rengasamy", membershipNo: 444 },
    { name: "Drishty Satpati", membershipNo: 443 },
    { name: "Sujit Basak", membershipNo: 442 },
    { name: "Sudhir Shukla", membershipNo: 441 },
    { name: "Priyanka Kushwaha", membershipNo: 440 },
    { name: "Priyadip Das", membershipNo: 439 },
    { name: "Prema Vasudev", membershipNo: 438 },
    { name: "Subhankar Sahu", membershipNo: 437 },
    { name: "Surya Dev Mishra", membershipNo: 436 },
    { name: "Vellaikumar Sampathrajan", membershipNo: 435 },
    { name: "Mohan Kumar", membershipNo: 434 },
    { name: "Bani Kanta Sarma", membershipNo: 433 },
    { name: "Bishwajit Paul", membershipNo: 432 },
    { name: "Vikas Dighe", membershipNo: 431 },
    { name: "Aishwarya Vijayakumar", membershipNo: 430 },
    { name: "Feba Francis", membershipNo: 429 },
    { name: "Nitin Yadav", membershipNo: 428 },
    { name: "Bappaditya Gole", membershipNo: 427 },
    { name: "Bichismita Sahu", membershipNo: 426 },
    { name: "Bhalchandra Kulkarni", membershipNo: 425 },
  ],
  symposiumAttendees: [
    { name: "Ananya Sharma", affiliation: "IISER Pune", symposiumYear: 2025, symposiumTitle: "10th Indian Peptide Symposium" },
    { name: "Rohan Mehta", affiliation: "IIT Bombay", symposiumYear: 2025, symposiumTitle: "10th Indian Peptide Symposium" },
    { name: "Priya Nair", affiliation: "IISc Bengaluru", symposiumYear: 2025, symposiumTitle: "10th Indian Peptide Symposium" },
    { name: "Karthik Reddy", affiliation: "CSIR-IICT Hyderabad", symposiumYear: 2025, symposiumTitle: "10th Indian Peptide Symposium" },
    { name: "Meera Joshi", affiliation: "JNCASR Bengaluru", symposiumYear: 2019, symposiumTitle: "9th Indian Peptide Symposium" },
    { name: "Arjun Desai", affiliation: "IIT Delhi", symposiumYear: 2019, symposiumTitle: "9th Indian Peptide Symposium" },
  ],
  recognizedPeople: [
    { name: "Prof. S. B. Mathur", honor: "Lifetime Achievement Award", year: "2019", affiliation: "Peptide chemistry pioneer" },
    { name: "Prof. P Balaram", honor: "Lifetime Achievement Award", year: "2017", affiliation: "Former Director — IISc., Bengaluru" },
    { name: "Prof. V S Chauhan", honor: "Lifetime Achievement Award", year: "2015", affiliation: "Former Director — ICGEB, New Delhi" },
    { name: "Dr. Neha Kapoor", honor: "Young Scientist Award", year: "2025", affiliation: "IISER Pune" },
  ],
  blogPosts: [
    {
      slug: "welcome-to-the-ips-blog",
      title: "Welcome to the IPS Blog",
      date: "March 2026",
      tag: "Society",
      excerpt: "A quiet space for symposium notes, member stories, and the science that brings our community together.",
      coverImage: "",
      body: `
        <p>The Indian Peptide Society has long been a meeting ground for scientists who share a passion for peptides — in the lab, at the podium, and across collaborations that span institutions and industries.</p>
        <p>This blog is a simple extension of that spirit: short, thoughtful pieces that capture what happens between symposia, and what we hope to carry forward into the next gathering.</p>
        <h2>Why a blog</h2>
        <p>Not every insight needs a full paper. Sometimes a reflection from the symposium floor, a note on membership, or a spotlight on recognition is enough to keep the conversation alive.</p>
        <h2>What you will find here</h2>
        <p>Expect updates around our annual symposium, profiles of permanent and executive members, and occasional essays from the community. We aim for clarity over volume — fewer posts, carefully written.</p>
        <h3>For members</h3>
        <p>If you are a life member or a recent symposium attendee, this is also a place to see how the society continues to grow between events.</p>
        <h3>For newcomers</h3>
        <p>Start with our membership page, browse the directory, and consider joining us at the next Indian Peptide Symposium.</p>
        <h2>Looking ahead</h2>
        <p>The 11th Indian Peptide Symposium at IIT Gandhinagar will be a milestone. Until then, we will share context, history, and practical notes here — so that when we meet again, we arrive with a shared thread of ideas.</p>
      `.trim(),
    },
    {
      slug: "one-symposium-each-year",
      title: "One Symposium, Each Year",
      date: "February 2026",
      tag: "Symposium",
      excerpt: "How the Indian Peptide Symposium anchors the society calendar — and why a single annual gathering still matters.",
      coverImage: "",
      body: `
        <p>For many of us, the Indian Peptide Symposium is the fixed point of the year: a few intense days of talks, posters, and conversations that rarely fit into email.</p>
        <p>We organise primarily one symposium per year — a deliberate choice that keeps the focus sharp and the community intact.</p>
        <h2>A single gathering</h2>
        <p>Rather than scattering attention across many events, IPS concentrates energy into one flagship meeting. That rhythm makes travel planning simpler for attendees and gives organisers room to craft a coherent scientific programme.</p>
        <h2>Who attends</h2>
        <p>Symposium attendees range from long-standing permanent members to students presenting their first poster. Executive members help shape the programme; recognised scientists are honoured for careers that defined the field in India.</p>
        <h3>Permanent members</h3>
        <p>Life and continuing members form the backbone of the society — voting in elections, mentoring newcomers, and returning year after year.</p>
        <h3>The wider circle</h3>
        <p>Each symposium also welcomes guests and first-time participants. Their names appear in our attendees list so the year’s community remains visible long after the closing session.</p>
        <h2>After the meeting</h2>
        <p>Proceedings fade; relationships do not. Between symposia we rely on this website, membership updates, and occasional writing — including posts like this — to keep the thread unbroken until the next year.</p>
      `.trim(),
    },
  ],
  symposiumRegistration: {
    enabled: true,
    title: "Symposium Registration",
    subtitle: "Register for the upcoming Indian Peptide Symposium. Payment via Razorpay will be available shortly.",
    dates: "February 25–27, 2027",
    venue: "IIT Gandhinagar, Gandhinagar, Gujarat",
    feeNote: "Registration fee details will be confirmed with the Razorpay payment link.",
    razorpayUrl: "",
    ctaLabel: "Register & Pay",
  },
  contactMessages: [],
  symposiumRegistrations: [
    {
      id: "demo-reg-abstract-1",
      name: "Dr. Ananya Mehta",
      email: "ananya.mehta@iiserpune.ac.in",
      phone: "+91 98765 41001",
      affiliation: "IISER Pune",
      category: "Academia",
      submittedAt: "2026-03-12T10:20:00.000Z",
      paymentStatus: "paid",
      razorpayPaymentId: "pay_demo_abstract_001",
      amountLabel: "Academia registration fee",
      receiptNo: "IPS-2026-ABS001",
      abstractTitle: "Constrained peptides as modulators of protein–protein interactions",
      abstractFileName: "mehta-abstract.pdf",
      abstractMimeType: "application/pdf",
      abstractStoragePath: "demo-reg-abstract-1/mehta-abstract.pdf",
      hasAbstract: true,
      abstractFileSize: 184320,
    },
    {
      id: "demo-reg-abstract-2",
      name: "Rohan Kapoor",
      email: "rohan.kapoor@iitb.ac.in",
      phone: "+91 98765 41002",
      affiliation: "IIT Bombay",
      category: "Student",
      submittedAt: "2026-03-14T14:05:00.000Z",
      paymentStatus: "pending",
      amountLabel: "Student registration fee",
      receiptNo: "IPS-2026-ABS002",
      abstractTitle: "Solid-phase synthesis of cyclic hexapeptides for antimicrobial screening",
      abstractFileName: "kapoor-sips-abstract.docx",
      abstractMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      abstractStoragePath: "demo-reg-abstract-2/kapoor-sips-abstract.docx",
      hasAbstract: true,
      abstractFileSize: 96256,
    },
    {
      id: "demo-reg-abstract-3",
      name: "Priya Nambiar",
      email: "priya.nambiar@jnc.ac.in",
      phone: "+91 98765 41003",
      affiliation: "JNCASR Bengaluru",
      category: "Academia",
      submittedAt: "2026-03-18T09:40:00.000Z",
      paymentStatus: "paid",
      razorpayPaymentId: "pay_demo_abstract_003",
      amountLabel: "Academia registration fee",
      receiptNo: "IPS-2026-ABS003",
      abstractTitle: "Fluorescent peptide probes for imaging amyloid aggregation",
      abstractFileName: "nambiar-abstract.pdf",
      abstractMimeType: "application/pdf",
      abstractStoragePath: "demo-reg-abstract-3/nambiar-abstract.pdf",
      hasAbstract: true,
      abstractFileSize: 221184,
    },
    {
      id: "demo-reg-no-abstract-1",
      name: "Vikram Shah",
      email: "vikram.shah@example.com",
      phone: "+91 98765 41004",
      affiliation: "Industry — PeptideTech Pvt Ltd",
      category: "Industry",
      submittedAt: "2026-03-20T11:15:00.000Z",
      paymentStatus: "pending",
      amountLabel: "Industry registration fee",
      receiptNo: "IPS-2026-REG004",
      hasAbstract: false,
    },
  ],
  totalMembers: 352,
  faqItems: [
    { question: "What is Indian Peptide Society all about?", answer: "Indian Peptide Society was founded in 2006 under Societies Registration Act XXI of 1860 under Registrar of Societies Government of NCT of Delhi Registration No. S-59874. Objective of the society is to provide a platform & common forum to the scientists working on peptides in India and abroad to network, communicate and share knowledge and resources." },
    { question: "Who can become the member of Indian Peptide Society?", answer: "Any one who is preferably of Indian origin and working in the field of peptide, its application and related area of research in academic or industry." },
    { question: "Being a student, can I become the member of society?", answer: "Yes, we have student membership at very nominal cost of Rs.1000/- and valid for 05 years. Once a student membership is taken, that can not be renewed. However, after expiry of student membership or even before expiry, one can renew it with Life membership - Academia or Life membership - Corporate." },
    { question: "What are the benefits of becoming a member of Indian Peptide Society?", answer: "All the members of Indian Peptide Society are given privileges of informing ongoing activities, upcoming events, free webinar participations, newsletters and special pricing of events organized by Indian Peptide society. Only Life members have privileges to upload positions, access to minutes of the meetings and various proceedings of society." },
    { question: "How are the office bearers and executive members elected?", answer: "Elections are held every fourth year on the last day of biennial symposium organized by Indian Peptide Society. The Life members can nominate their names for respective candidature and participate in the election by normal voting as per the bye-laws of society. Voting happens after Annual General Body Meeting by manual method. Once elected, they can resume the respective activities." },
    { question: "Where can I find the bye-laws of society?", answer: "A copy of bye-laws can be accessed by the Life members of society only. They can login to their account and can have access to bye-laws." },
    { question: "I am an Indian and pursuing my research career in United States. Can I pay in INR?", answer: "If you are having any of the two Indian IDs like valid passport or Aadhar, then you can pay in INR, else you need to pay in USD only. Our payment gateway can accept USD payments, still if you have any query regarding this, you may email at indianpeptidesociety@gmail.com" },
    { question: "When is the symposium organized by Indian Peptide Society?", answer: "Indian Peptide Society organise 02 days biennial peptide symposium every alternate year. Last symposium held in 2019 and next symposium has been announced for 2021. Indian Peptide Society also organize student-Indian Peptide Symposium (sIPS) in different regions of country to encourage student participation." },
  ],
};

