const DEPARTMENT_PREFIXES = {
  CSE: "BCS",
  ME: "BME",
  CE: "BCE",
  EE: "BEE",
  ECE: "BEC",
  MNC: "BMA",
  "ENGINEERING PHYSICS": "BPH",
  "MATERIAL SCIENCE": "BMS",
  "CHEMICAL ENGINEERING": "BCH",
  CHEMICAL: "BCH",
  CH: "BCH",
  ARCHITECTURE: "BAR",
  BAR: "BAR",
  "DUAL DEGREE CSE": "DCS",
  "DUAL DEGREE ELECTRONICS": "DEC",
};

const DEPARTMENT_ALIASES = {
  "COMPUTER SCIENCE ENGINEERING": "CSE",
  "COMPUTER SCIENCE & ENGINEERING": "CSE",
  CSE: "CSE",
  "MECHANICAL ENGINEERING": "ME",
  ME: "ME",
  "CIVIL ENGINEERING": "CE",
  CE: "CE",
  "ELECTRICAL ENGINEERING": "EE",
  EE: "EE",
  "ELECTRONICS & COMMUNICATION ENGINEERING": "ECE",
  "ELECTRONICS AND COMMUNICATION ENGINEERING": "ECE",
  ECE: "ECE",
  "MATHEMATICS & COMPUTING": "MNC",
  "MATHEMATICS AND COMPUTING": "MNC",
  MNC: "MNC",
  "ENGINEERING PHYSICS": "ENGINEERING PHYSICS",
  BPH: "ENGINEERING PHYSICS",
  "MATERIAL SCIENCE": "MATERIAL SCIENCE",
  BMS: "MATERIAL SCIENCE",
  "CHEMICAL ENGINEERING": "CHEMICAL ENGINEERING",
  CHEMICAL: "CHEMICAL ENGINEERING",
  CH: "CHEMICAL ENGINEERING",
  ARCHITECTURE: "ARCHITECTURE",
  BAR: "ARCHITECTURE",
  "DUAL DEGREE CSE": "DUAL DEGREE CSE",
  DCS: "DUAL DEGREE CSE",
  "DUAL DEGREE ELECTRONICS": "DUAL DEGREE ELECTRONICS",
  DEC: "DUAL DEGREE ELECTRONICS",
};

export function normalizeDepartment(department) {
  if (!department) return "";

  const trimmed = String(department).trim().toUpperCase();
  return DEPARTMENT_ALIASES[trimmed] || DEPARTMENT_ALIASES[String(department).trim()] || "";
}

export function getDepartmentPrefix(department) {
  const normalizedDepartment = normalizeDepartment(department);
  return DEPARTMENT_PREFIXES[normalizedDepartment] || null;
}

export function validateDepartmentRollNumber(department, rollno) {
  if (!department || !rollno) return false;

  const prefix = getDepartmentPrefix(department);
  if (!prefix) return false;

  const normalizedRollNo = String(rollno).trim().toUpperCase();
  const pattern = new RegExp(`^(?:\\d{2,4})?${prefix}`);
  return pattern.test(normalizedRollNo);
}

export function validateStudentEmail(email, rollno) {
  if (!email || !rollno) return false;

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedRollNo = String(rollno).trim().toLowerCase();

  if (!normalizedEmail.endsWith("@nith.ac.in")) return false;

  const localPart = normalizedEmail.split("@")[0];
  return localPart === normalizedRollNo;
}

export const NITH_HOSTELS = [
  { id: 'kailash', name: 'Kailash Boys Hostel' },
  { id: 'himgiri', name: 'Himgiri Boys Hostel' },
  { id: 'udaygiri', name: 'Udaygiri Boys Hostel' },
  { id: 'neelkanth', name: 'Neelkanth Boys Hostel' },
  { id: 'dhauladhar', name: 'Dhauladhar Boys Hostel' },
  { id: 'vindhyachal', name: 'Vindhyachal Boys Hostel' },
  { id: 'shivalik', name: 'Shivalik Boys Hostel' },
  { id: 'satpura', name: 'Satpura Hostel' },
  { id: 'ambika', name: 'Ambika Girls Hostel' },
  { id: 'parvati', name: 'Parvati Girls Hostel' },
  { id: 'mani-mahesh', name: 'Mani-Mahesh Girls Hostel' },
  { id: 'aravali', name: 'Aravali Girls Hostel' },
];
