export interface Announcement {
  lead: string;
  dates: string;
  venue: string;
  coordinator: string;
  cta: string;
  ctaUrl: string;
  ticker: string;
}

export interface NewsItem {
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface LifetimeAward {
  image: string;
  caption: string;
}

export interface ServiceItem {
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  affiliation: string;
  image: string;
  section: "executive" | "advisors";
}

/** @deprecated Legacy shape — migrated on load */
export interface TeamGroup {
  title: string;
  description: string;
  members: string[];
}

export interface SymposiumEvent {
  title: string;
  dates: string;
  venue: string;
  coordinator?: string;
  status?: string;
}

export interface FounderMember {
  name: string;
  role: string;
  title: string;
}

export interface DirectoryMember {
  name: string;
  membershipNo: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SiteContent {
  announcement: Announcement;
  news: NewsItem[];
  stats: StatItem[];
  lifetimeAwards: LifetimeAward[];
  services: ServiceItem[];
  team: TeamMember[];
  upcomingSymposia: SymposiumEvent[];
  pastSymposia: SymposiumEvent[];
  pastStudentSymposia: SymposiumEvent[];
  founderMembers: FounderMember[];
  directoryMembers: DirectoryMember[];
  totalMembers: number;
  faqItems: FaqItem[];
}

export const defaultContent: SiteContent = {
  announcement: {
    lead: "We are pleased to announce the 11th Indian Peptide Symposium, organized in coordination with IIT Gandhinagar.",
    dates: "February 25–27, 2027",
    venue: "IIT Gandhinagar, Gandhinagar, Gujarat",
    coordinator: "Prof. Sharad Gupta",
    cta: "Stay tuned for updates.",
    ctaUrl: "",
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
  directoryMembers: [
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

const STORAGE_KEY = "ips-site-content";

export function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SiteContent>;
      return normalizeContent(parsed);
    }
  } catch {
    /* use defaults */
  }
  return structuredClone(defaultContent);
}

function normalizeContent(parsed: Partial<SiteContent>): SiteContent {
  const base = structuredClone(defaultContent);
  const merged: SiteContent = {
    ...base,
    ...parsed,
    announcement: { ...base.announcement, ...parsed.announcement },
    news: (parsed.news ?? base.news).map((item, i) => ({
      ...base.news[i],
      ...item,
      image: item.image ?? "",
    })),
    lifetimeAwards: parsed.lifetimeAwards?.length ? parsed.lifetimeAwards : base.lifetimeAwards,
    team: normalizeTeam(parsed.team),
  };
  return merged;
}

function normalizeTeam(team: unknown): TeamMember[] {
  if (!Array.isArray(team) || team.length === 0) return defaultContent.team;
  const first = team[0] as Record<string, unknown>;
  if ("members" in first) return defaultContent.team;

  const members = team as TeamMember[];
  const executives = members.filter((m) => m.section === "executive");
  const advisors = members.filter((m) => m.section === "advisors");
  const defaultAdvisors = defaultContent.team.filter((m) => m.section === "advisors");

  const mergedAdvisors = defaultAdvisors.map((fallback, i) => {
    const saved = advisors[i];
    if (!saved) return fallback;
    const isPlaceholder = !saved.name || saved.name === "Scientific Advisor";
    return {
      ...fallback,
      ...saved,
      name: isPlaceholder ? fallback.name : saved.name,
      affiliation: saved.affiliation || fallback.affiliation,
      image: saved.image && !saved.image.includes("advisor-") && !saved.image.includes("chauhan") ? saved.image : fallback.image,
    };
  });

  const defaultExecutives = defaultContent.team.filter((m) => m.section === "executive");
  const mergedExecutives = defaultExecutives.map((fallback, i) => ({
    ...fallback,
    ...(executives[i] ?? {}),
  }));

  return [...mergedExecutives, ...mergedAdvisors];
}

export function saveContent(content: SiteContent): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

export function resetContent(): SiteContent {
  localStorage.removeItem(STORAGE_KEY);
  return structuredClone(defaultContent);
}

export const PAGE_SIZE = 32;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
