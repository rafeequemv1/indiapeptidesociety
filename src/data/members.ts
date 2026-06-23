export interface FounderMember {
  name: string;
  role: string;
  title: string;
}

export interface DirectoryMember {
  name: string;
  membershipNo: number;
}

export const founderMembers: FounderMember[] = [
  {
    name: "Mr. Venkat R. Kalavakolanu",
    title: "CEO, Jupiter Biosciences Limited, Secunderabad (Telangana)",
    role: "Treasurer",
  },
  {
    name: "Dr. Sudhanand Prasad",
    title: "GM — Dabur Research Foundation",
    role: "Joint Secretary",
  },
  {
    name: "Dr. Dinkar Sahal",
    title: "Scientist, ICGEB New Delhi",
    role: "Executive Member",
  },
  {
    name: "Dr. Shirshendu Mukherjee",
    title: "Scientist, ICGEB New Delhi",
    role: "Executive Member",
  },
];

export const directoryMembers: DirectoryMember[] = [
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
];

export const TOTAL_MEMBERS = 352;
export const PAGE_SIZE = 32;
