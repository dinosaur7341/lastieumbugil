
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { SiteData } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyConoGFaV1g4pye_E9coiI5trrEczBUlfo",
  authDomain: "ieum-89a92.firebaseapp.com",
  projectId: "ieum-89a92",
  storageBucket: "ieum-89a92.firebasestorage.app",
  messagingSenderId: "142226548762",
  appId: "1:142226548762:web:ed24a3f3cce20bcc30c9a3",
  measurementId: "G-J5H8XR2ZH2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const DOC_REF = doc(db, "siteData", "main");

const CACHE_KEY = 'ieum_site_data_cache';

const initialData: SiteData = {
  config: {
    name: "이음",
    logo: "https://images.unsplash.com/photo-1543269664-76bc3997d9ea?q=80&w=200&h=200&auto=format&fit=crop",
    heroBadge: "BUKIL HIGH SCHOOL OFFICIAL CLUB",
    heroTitle: "새로운 소식이 곧 업데이트 됩니다.",
    heroDesc: "북일고등학교 공식 동아리 '이음'은 상경, 정치외교, 인문학을 통합하여 더 나은 사회를 꿈꾸는 인재들의 학술 공동체입니다.",
    heroBg: "https://images.unsplash.com/photo-1523050853064-8504a21d8175?auto=format&fit=crop&q=80"
  },
  departments: [
    { id: '1', name: '상경부', description: '경제적 논리와 경영적 통찰 분석.', leaderName: '김재현', vision: '가치 창출', color: '', icon: '📊' },
    { id: '2', name: '정치외교학과', description: '사회의 정의와 법치주의 탐구.', leaderName: '김연우', vision: '정의 사회', color: '', icon: '⚖️' },
    { id: '3', name: '통합부', description: '학문의 경계를 넘는 인문학적 소양.', leaderName: '박우영', vision: '융합 통찰', color: '', icon: '🧩' }
  ],
  activities: [],
  magazines: [],
  societyDesc: "전국고교인문정치학회는 고등학생들의 학술적 교류를 위해 설립되었습니다.",
  societyMembers: [],
  societyActivities: [],
  contacts: [
    { id: '1', type: 'Email', label: '공식 이메일', value: 'ieum_official@example.com' }
  ],
  academicExchange: {
    desc: "2026 전국고교인문사회학술교류회는 고등학생들의 학술적 성장을 도모합니다.",
    participatingClubs: [],
    magazines: []
  }
};

export const dbService = {
  // 캐시된 데이터 가져오기
  getCachedData(): SiteData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  },

  // 실시간 구독 함수
  subscribe(callback: (data: SiteData) => void) {
    return onSnapshot(DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteData;
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        callback(data);
      } else {
        // 데이터가 없으면 초기값 생성
        setDoc(DOC_REF, initialData);
      }
    });
  },

  async saveData(newData: SiteData): Promise<void> {
    await setDoc(DOC_REF, newData);
  }
};
