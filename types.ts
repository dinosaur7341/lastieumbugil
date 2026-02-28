
export type MagazineCategory = '활동소식' | '인터뷰' | '칼럼' | '탐구자료';

export interface ClubConfig {
  name: string;
  logo: string;
  heroBadge: string;
  heroTitle: string;
  heroDesc: string;
  heroBg: string;
  heroBgMobile?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  leaderName: string; // Added leader name field
  vision: string;
  color: string;
  icon?: string;
}

export interface Activity {
  id: string;
  title: string;
  content: string;
  date: string;
  images: string[];
}

export interface Magazine {
  id: string;
  title: string;
  author: string;
  category: MagazineCategory;
  highlightImage: string;
  images: string[];
  content: string;
  date: string;
  volume?: string;
}

export interface SocietyMember {
  id: string;
  name: string;
  schoolLogo: string;
  schoolName: string;
}

export interface SocietyActivity {
  id: string;
  title: string;
  description: string;
}

export interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
}

export interface PartnerClub {
  id: string;
  schoolName: string;
  clubName: string;
  logo: string;
}

export interface SiteData {
  config: ClubConfig;
  departments: Department[];
  activities: Activity[];
  magazines: Magazine[];
  societyDesc: string;
  societyMembers: SocietyMember[];
  societyActivities: SocietyActivity[];
  contacts: ContactInfo[];
  partners: PartnerClub[];
}
