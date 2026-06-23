export interface SymposiumEvent {
  title: string;
  dates: string;
  venue: string;
  coordinator?: string;
  status?: string;
}

export const upcomingSymposia: SymposiumEvent[] = [
  {
    title: "11th Indian Peptide Symposium",
    dates: "February 25–27, 2027",
    venue: "IIT Gandhinagar, Gandhinagar, Gujarat",
    coordinator: "Prof. Sharad Gupta",
    status: "Upcoming",
  },
  {
    title: "10th Indian Peptide Symposium",
    dates: "February 26–27, 2025",
    venue: "IISER Pune, Pune, Maharashtra",
    coordinator: "Prof. H N Gopi",
    status: "Completed",
  },
];

export const pastSymposia: SymposiumEvent[] = [
  { title: "10th Indian Peptide Symposium", dates: "February 26–27, 2025", venue: "IISER Pune, Pune" },
  { title: "9th Indian Peptide Symposium", dates: "February 2019", venue: "India" },
  { title: "8th Indian Peptide Symposium", dates: "February 2017", venue: "India" },
  { title: "7th Indian Peptide Symposium", dates: "February 2015", venue: "India" },
  { title: "6th Indian Peptide Symposium", dates: "February 2013", venue: "India" },
  { title: "5th Indian Peptide Symposium", dates: "February 2011", venue: "India" },
  { title: "4th Indian Peptide Symposium", dates: "February 2009", venue: "India" },
  { title: "3rd Indian Peptide Symposium", dates: "February 2007", venue: "India" },
];

export const pastStudentSymposia: SymposiumEvent[] = [
  { title: "4th Student Indian Peptide Symposium", dates: "2024", venue: "Regional venue, India" },
  { title: "3rd Student Indian Peptide Symposium", dates: "2022", venue: "Regional venue, India" },
  { title: "2nd Student Indian Peptide Symposium", dates: "2020", venue: "Regional venue, India" },
  { title: "1st Student Indian Peptide Symposium", dates: "2018", venue: "Regional venue, India" },
];
