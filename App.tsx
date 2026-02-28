
import React, { useState, useEffect } from 'react';
import { dbService } from './services/db';
import { SiteData, Activity, Magazine, MagazineCategory } from './types';
import { 
  X, Calendar, Eye, EyeOff, Home, ArrowRight, Instagram, Mail, Phone, Lock, ChevronRight, Menu
} from 'lucide-react';
import AdminPanel from './components/Admin';

const SECTIONS = [
  { id: 'home', label: '홈' },
  { id: 'about', label: '동아리 소개' },
  { id: 'activities', label: '활동 소개' },
  { id: 'magazine', label: '이음 매거진' },
  { id: 'society', label: '전국고교인문정치학회' },
  { id: 'contact', label: '문의 및 연락처' },
  { id: 'exchange', label: '2026 학술교류회' },
  { id: 'directions', label: '오시는 길' },
];

const App: React.FC = () => {
  const [data, setData] = useState<SiteData | null>(dbService.getCachedData());
  const [activeSection, setActiveSection] = useState('home');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);
  const [magazineFilter, setMagazineFilter] = useState<MagazineCategory | '전체'>('전체');

  useEffect(() => {
    const unsubscribe = dbService.subscribe((newData) => {
      setData(newData);
    });

    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const revealTop = el.getBoundingClientRect().top;
        if (revealTop < windowHeight - 100) el.classList.add('active');
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleAdminLogin = () => {
    if (passwordInput === 'ieum73413243') {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setPasswordInput('');
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
  };

  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-black">
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-2xl font-black tracking-tighter uppercase">IEUM</p>
        <p className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase animate-pulse">데이터 동기화 중...</p>
      </div>
    </div>
  );

  if (isAdminMode) {
    return <AdminPanel data={data} onSave={dbService.saveData} onClose={() => setIsAdminMode(false)} />;
  }

  const sortedActivities = [...data.activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filteredMagazines = data.magazines
    .filter(m => magazineFilter === '전체' || m.category === magazineFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100">
      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[110] bg-white/95 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-6 overflow-x-auto hide-scrollbar shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-10 whitespace-nowrap h-full">
          {SECTIONS.map(s => (
            <button 
              key={s.id} 
              onClick={() => scrollTo(s.id)} 
              className={`relative h-full flex items-center text-[13px] font-black tracking-tighter transition-all duration-300 ${activeSection === s.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <span className="relative z-10">{s.label}</span>
              {activeSection === s.id && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation (Desktop) */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 hidden lg:flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => scrollTo('home')}>
          {data.config.logo && <img src={data.config.logo} className="w-12 h-12 rounded-full object-cover shadow-sm group-hover:rotate-12 transition-all" />}
          <span className="text-2xl font-black tracking-tighter">{data.config.name}</span>
        </div>
        <div className="hidden lg:flex items-center gap-10">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)} className={`text-sm font-black transition-colors ${activeSection === s.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}>{s.label}</button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="relative h-screen flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 hidden md:block" style={{ backgroundImage: `url(${data.config.heroBg})` }}>
          <div className="absolute inset-0 hero-overlay"></div>
        </div>
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 md:hidden" style={{ backgroundImage: `url(${data.config.heroBgMobile || data.config.heroBg})` }}>
          <div className="absolute inset-0 hero-overlay"></div>
        </div>
        <div className="relative z-10 max-w-5xl">
          <span className="inline-block px-5 py-2 mb-8 text-[11px] font-black tracking-widest text-white/80 bg-white/10 backdrop-blur-md rounded-full border border-white/20 uppercase">
            {data.config.heroBadge}
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-10 leading-[1.1] tracking-tighter whitespace-pre-line animate-fade-in">
            {data.config.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed whitespace-pre-wrap">{data.config.heroDesc}</p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-40 px-4 md:px-6 reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 uppercase tracking-tighter">동아리 소개</h2>
            <div className="w-12 md:w-16 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-8">
            {data.departments.map(dept => (
              <div key={dept.id} className="p-4 md:p-12 rounded-2xl md:rounded-[3rem] bg-gray-50 border border-gray-100 hover:shadow-2xl transition-all group flex flex-col min-h-[200px] md:min-h-[550px]">
                <div className="text-2xl md:text-5xl mb-3 md:mb-10 group-hover:scale-110 transition-transform text-center md:text-left">{dept.icon}</div>
                <h3 className="text-xs md:text-2xl font-black mb-2 md:mb-6 text-center md:text-left">{dept.name}</h3>
                <p className="hidden md:block text-gray-500 font-medium leading-relaxed mb-4 whitespace-pre-wrap">{dept.description}</p>
                <p className="hidden md:block text-sm font-bold text-gray-400 italic mb-1">-{dept.leaderName}-</p>
                <div className="mt-auto pt-2 border-t border-gray-200 hidden md:block">
                  <p className="text-xl font-black italic text-gray-900 leading-tight">"{dept.vision}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="py-20 md:py-40 bg-gray-50 px-4 md:px-6 reveal">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 md:mb-20 px-2 md:px-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">활동 소개</h2>
            <p className="text-gray-400 font-bold italic text-[10px] md:text-sm">학술적 발자취</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
            {sortedActivities.map(act => (
              <div key={act.id} className="bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl transition-all" onClick={() => setSelectedActivity(act)}>
                <div className="aspect-4-5 relative overflow-hidden">
                  {act.images[0] && <img src={act.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button className="px-4 md:px-8 py-2 md:py-3 bg-white text-black font-black rounded-full text-[8px] md:text-xs">더 읽어보기</button>
                  </div>
                </div>
                <div className="p-4 md:p-10">
                  <span className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase mb-2 md:mb-4 block tracking-widest">{act.date}</span>
                  <h3 className="text-sm md:text-xl font-black mb-2 md:mb-4 line-clamp-1">{act.title}</h3>
                  <p className="hidden md:block text-gray-400 text-sm line-clamp-2 whitespace-pre-wrap">{act.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Magazine Section */}
      <section id="magazine" className="py-20 md:py-40 bg-white px-4 md:px-6 reveal">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-8 md:mb-12 uppercase tracking-tighter">이음 매거진</h2>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12 md:mb-24">
            {['활동소식', '인터뷰', '칼럼', '탐구자료'].map(cat => (
              <button key={cat} onClick={() => setMagazineFilter(cat as any)} className={`px-5 md:px-8 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-black transition-all ${magazineFilter === cat ? 'bg-black text-white shadow-xl' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{cat}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-20">
            {filteredMagazines.map(mag => (
              <div key={mag.id} className="text-left group cursor-pointer" onClick={() => setSelectedMagazine(mag)}>
                <div className="aspect-[16/10] rounded-2xl md:rounded-[3rem] overflow-hidden mb-4 md:mb-10 shadow-lg group-hover:shadow-2xl transition-all relative">
                  {mag.highlightImage && <img src={mag.highlightImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button className="px-4 md:px-8 py-2 md:py-3 bg-white text-black font-black rounded-full text-[8px] md:text-xs">더 읽어보기</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-black text-gray-400 mb-2 md:mb-6 uppercase tracking-widest">
                  <span>{mag.date}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                  <span className="text-blue-500">{mag.author}</span>
                </div>
                <h3 className="text-sm md:text-3xl font-black mb-2 md:mb-6 group-hover:text-blue-600 transition-colors line-clamp-1">{mag.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed line-clamp-2 text-sm md:text-base whitespace-pre-wrap">{mag.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Society Section */}
      <section id="society" className="py-20 md:py-40 bg-gray-50 px-4 md:px-6 reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-24">
            <h2 className="text-[24px] sm:text-3xl md:text-5xl font-black mb-6 md:mb-10 uppercase tracking-tighter whitespace-nowrap">전국고교인문정치학회</h2>
            <p className="max-w-3xl mx-auto text-gray-500 font-medium leading-relaxed italic mb-10 md:mb-16 px-4 text-sm md:text-base whitespace-pre-wrap">{data.societyDesc}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            <div className="space-y-10">
              <h3 className="text-2xl font-black tracking-tighter border-l-4 border-blue-600 pl-4">주요 활동 소개</h3>
              <div className="space-y-6">
                {data.societyActivities?.map(sa => (
                  <div key={sa.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h4 className="text-lg font-black mb-3 text-blue-600">{sa.title}</h4>
                    <p className="text-gray-500 font-medium leading-relaxed whitespace-pre-wrap">{sa.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-10">
              <h3 className="text-2xl font-black tracking-tighter border-l-4 border-blue-600 pl-4">학회 소속 동아리</h3>
              <div className="flex flex-wrap gap-4">
                {data.societyMembers?.map(m => (
                  <div key={m.id} className="bg-white px-4 md:px-6 py-3 md:py-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 md:gap-4 hover:scale-105 transition-all w-full md:w-[calc(50%-1rem)]">
                    <div className="text-left">
                      <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{m.schoolName}</p>
                      <p className="text-xs md:text-sm font-black text-gray-900 leading-none">{m.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-40 bg-white px-4 md:px-6 reveal">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-12 md:mb-24 uppercase tracking-widest">문의 및 연락처</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {data.contacts.map(c => (
              <div key={c.id} className="p-6 md:p-12 rounded-2xl md:rounded-[2.5rem] bg-gray-50 border border-gray-100 group hover:bg-black transition-all flex flex-col items-center">
                <div className="mb-4 text-blue-600 group-hover:text-white transition-colors">
                  {c.label.includes('이메일') || c.label.includes('Email') ? <Mail size={18} /> : 
                   c.label.includes('전화') || c.label.includes('연락처') || c.label.includes('Phone') ? <Phone size={18} /> : 
                   c.label.includes('인스타') || c.label.includes('Instagram') ? <Instagram size={18} /> : <ArrowRight size={18} />}
                </div>
                <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase mb-2 md:mb-4 group-hover:text-gray-500">{c.label}</p>
                <p className="text-sm md:text-lg font-black group-hover:text-white break-all">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Exchange Section */}
      <section id="exchange" className="py-20 md:py-40 bg-gray-50 px-4 md:px-6 reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black mb-8 md:mb-12 uppercase tracking-tighter">2026 전국고교인문사회학술교류회</h2>
            <p className="max-w-3xl mx-auto text-gray-500 font-medium leading-relaxed italic mb-12 md:mb-20 px-4 text-sm md:text-base whitespace-pre-wrap">{data.academicExchange?.desc || "새로운 소식이 곧 업데이트 됩니다."}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
            <div className="lg:col-span-1 space-y-8">
              <h3 className="text-xl font-black tracking-tighter border-l-4 border-blue-600 pl-4">참가 동아리</h3>
              <div className="grid grid-cols-1 gap-3">
                {data.academicExchange?.participatingClubs?.map(p => (
                  <div key={p.id} className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:scale-105 transition-all">
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{p.schoolName}</p>
                      <p className="text-sm font-black text-gray-900 leading-none">{p.clubName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-8">
              <h3 className="text-xl font-black tracking-tighter border-l-4 border-blue-600 pl-4">교류회 매거진</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.academicExchange?.magazines?.map(mag => (
                  <div key={mag.id} className="bg-white rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all" onClick={() => setSelectedMagazine(mag)}>
                    <div className="aspect-[16/9] relative overflow-hidden">
                      {mag.highlightImage && <img src={mag.highlightImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button className="px-6 py-2 bg-white text-black font-black rounded-full text-[10px]">읽어보기</button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                        <span>{mag.date}</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                        <span className="text-blue-500">{mag.author}</span>
                      </div>
                      <h4 className="text-lg font-black mb-2 line-clamp-1">{mag.title}</h4>
                      <p className="text-gray-500 text-xs line-clamp-2 whitespace-pre-wrap">{mag.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directions Section */}
      <section id="directions" className="py-20 md:py-40 bg-white px-4 md:px-6 reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-10 uppercase tracking-tighter">오시는 길</h2>
            <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full mb-10"></div>
            <p className="text-gray-500 font-bold text-lg">충청남도 천안시 동남구 망향로 101 (북일고등학교)</p>
          </div>
          <div className="w-full h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.560411132213!2d127.1648023152876!3d36.82901397994334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ad76648710389%3A0x633e08f5193f357b!2z67aB7J286rOg65Ox7ZWZ6rWQ!5e0!3m2!1sko!2skr!4v1646035200000!5m2!1sko!2skr" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer & Admin Toggle */}
      <footer className="py-20 border-t border-gray-100 bg-white px-8 flex flex-col md:flex-row items-center justify-between gap-10">
        <div>
          <h4 className="text-2xl font-black tracking-tighter">북일고등학교 이음(IEUM)</h4>
          <p className="text-[10px] font-black text-gray-300 uppercase mt-1 tracking-widest">Official Academic Club Website</p>
        </div>
        <button onClick={() => setShowAdminLogin(true)} className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-300 rounded-full font-black text-[10px] hover:bg-black hover:text-white transition-all uppercase tracking-widest">
          <Lock size={12}/> 관리자 페이지
        </button>
      </footer>

      {/* Detail Modal */}
      {(selectedActivity || selectedMagazine) && (
        <div className="fixed inset-0 z-[200] bg-white overflow-y-auto animate-fade-in">
          <nav className="fixed top-0 left-0 right-0 h-24 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-10 flex items-center justify-between z-[210]">
            <span className="text-2xl font-black italic tracking-tighter">IEUM ARCHIVE</span>
            <button onClick={() => { setSelectedActivity(null); setSelectedMagazine(null); }} className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all">✕</button>
          </nav>
          <div className="pt-40 pb-60 px-6 max-w-4xl mx-auto">
            {selectedActivity && (
              <>
                <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tighter leading-tight">{selectedActivity.title}</h1>
                <p className="text-sm font-black text-blue-600 mb-16 uppercase tracking-widest">{selectedActivity.date}</p>
                <div className="space-y-12">
                  {/* 활동 이미지 크기 조정: 50% (w-1/2 mx-auto) */}
                  {selectedActivity.images.map((img, idx) => img ? <img key={idx} src={img} className="w-1/2 mx-auto rounded-[3rem] shadow-2xl" /> : null)}
                  <p className="text-lg md:text-xl leading-[2.2] font-medium whitespace-pre-wrap border-l-4 border-blue-600 pl-8 text-gray-700">{selectedActivity.content}</p>
                </div>
              </>
            )}
            {selectedMagazine && (
              <>
                <h1 className="text-4xl md:text-5xl font-black mb-12 tracking-tighter leading-tight italic">{selectedMagazine.title}</h1>
                <div className="flex items-center gap-4 mb-16">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-black">{selectedMagazine.author[0]}</div>
                  <p className="text-sm font-black italic text-gray-400 uppercase tracking-widest">Written by {selectedMagazine.author}</p>
                </div>
                <div className="space-y-16">
                  {/* 매거진 하이라이트 이미지 크기 조정: 70% (w-[70%] mx-auto) */}
                  {selectedMagazine.highlightImage && <img src={selectedMagazine.highlightImage} className="w-[70%] mx-auto max-h-[600px] object-contain rounded-[3rem] shadow-2xl bg-gray-50" />}
                  <p className="text-lg md:text-2xl leading-[2.4] font-medium whitespace-pre-wrap text-gray-800">{selectedMagazine.content}</p>
                  {/* 매거진 추가 이미지 크기 조정: 70% (w-[70%] mx-auto) */}
                  {selectedMagazine.images.map((img, idx) => img ? <img key={idx} src={img} className="w-[70%] mx-auto max-h-[600px] object-contain rounded-[2rem] shadow-xl bg-gray-50" /> : null)}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[3rem] p-12 text-center animate-fade-in">
            <h2 className="text-3xl font-black mb-10 tracking-tighter">시스템 접속</h2>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="비밀번호 입력" className="w-full px-8 py-5 bg-gray-100 rounded-2xl text-center text-2xl font-black tracking-[0.5em] mb-8 outline-none focus:ring-4 focus:ring-blue-100 transition-all" onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} />
            <div className="flex gap-4">
              <button onClick={() => setShowAdminLogin(false)} className="flex-1 py-5 bg-gray-100 rounded-2xl font-black text-gray-400 uppercase tracking-widest text-xs">취소</button>
              <button onClick={handleAdminLogin} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl uppercase tracking-widest text-xs">접속</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
