
import React, { useState } from 'react';
import { SiteData, Activity, Magazine, MagazineCategory, SocietyMember, ContactInfo, PartnerClub, SocietyActivity } from '../types';
import { Trash2, Plus, Save, Home, CheckCircle2, Image as ImageIcon, Upload, Menu } from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  onSave: (data: SiteData) => Promise<void>;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ data, onSave, onClose }) => {
  const [localData, setLocalData] = useState<SiteData>(JSON.parse(JSON.stringify(data)));
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'depts' | 'activities' | 'magazine' | 'society' | 'contacts' | 'partners'>('main');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 데이터 크기 체크 (Firestore 1MB 제한)
      const dataStr = JSON.stringify(localData);
      const sizeInBytes = new Blob([dataStr]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      console.log(`Current data size: ${sizeInMB.toFixed(2)} MB`);
      
      if (sizeInMB > 0.95) {
        alert(`데이터 용량이 너무 큽니다 (${sizeInMB.toFixed(2)}MB). \n이미지 수를 줄이거나 더 작은 이미지를 사용해주세요. (Firestore 제한: 1MB)`);
        setIsSaving(false);
        return;
      }

      await onSave(localData);
      setFeedback('서버 데이터 업데이트 성공!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error('Save error details:', err);
      let msg = '저장 중 오류가 발생했습니다.';
      if (err.code === 'permission-denied') {
        msg = '권한이 없습니다. Firebase 보안 규칙이나 API 키 제한을 확인해주세요.';
      } else if (err.message?.includes('too large')) {
        msg = '데이터 용량이 너무 커서 저장할 수 없습니다. 이미지를 줄여주세요.';
      }
      alert(`${msg}\n\n상세 오류: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const compressImage = (file: File, maxDim: number = 800, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void, maxDim?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, maxDim || 800, 0.6);
        callback(compressed);
        // Reset input value to allow re-uploading the same file
        e.target.value = '';
      } catch (err) {
        console.error('Image upload error:', err);
        alert('이미지 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  const InputStyle = "w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-bold text-gray-800";
  const LabelStyle = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic";
  const SectionTitle = "text-2xl font-black italic tracking-tighter text-blue-600 mb-8 flex items-center gap-3";
  const TabBtn = (id: typeof activeTab, label: string) => (
    <button onClick={() => setActiveTab(id)} className={`px-6 py-3 rounded-full text-xs font-black transition-all ${activeTab === id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{label}</button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 z-50 h-24 bg-white border-b border-gray-100 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors"><Home size={24}/></button>
          <h1 className="text-xl font-black italic tracking-tighter">IEUM REALTIME CMS</h1>
        </div>
        <div className="flex gap-4">
            <button onClick={handleSave} disabled={isSaving} className="px-10 py-4 bg-blue-600 text-white rounded-full font-black text-sm shadow-xl hover:bg-blue-700 transition-all disabled:bg-gray-200 flex items-center gap-2">
            <Save size={18}/> {isSaving ? '업로드 중...' : '서버에 반영하기'}
            </button>
        </div>
      </nav>

      <div className="bg-white border-b border-gray-100 px-8 py-4 flex flex-wrap gap-2 overflow-x-auto sticky top-24 z-40">
        {TabBtn('main', '메인 설정')}
        {TabBtn('depts', '부서 소개')}
        {TabBtn('activities', '활동 관리')}
        {TabBtn('magazine', '매거진')}
        {TabBtn('society', '학회 관리')}
        {TabBtn('contacts', '연락처')}
        {TabBtn('partners', '협력 동아리')}
      </div>

      <div className="max-w-6xl mx-auto w-full p-8 pb-60 flex-grow">
        
        {activeTab === 'main' && (
          <div className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-sm space-y-10 animate-fade-in">
            <h2 className={SectionTitle}>기본 정보 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className={LabelStyle}>동아리 이름</label>
                <input type="text" value={localData.config.name} onChange={e => {
                  const val = e.target.value;
                  setLocalData(prev => ({...prev, config: {...prev.config, name: val}}));
                }} className={InputStyle}/>
              </div>
              <div className="space-y-4">
                <label className={LabelStyle}>로고 이미지</label>
                <div className="flex items-center gap-4">
                    {localData.config.logo && <img src={localData.config.logo} className="w-16 h-16 rounded-full border bg-gray-50 object-cover" />}
                    <label className="flex-1 cursor-pointer bg-gray-100 p-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black hover:bg-gray-200 transition-all">
                        <Upload size={16}/> 파일 선택
                        <input type="file" className="hidden" onChange={e => handleImageUpload(e, (base) => setLocalData(prev => ({...prev, config: {...prev.config, logo: base}})))} />
                    </label>
                </div>
              </div>
              <div className="space-y-4">
                <label className={LabelStyle}>상단 뱃지 텍스트</label>
                <input type="text" value={localData.config.heroBadge} onChange={e => {
                  const val = e.target.value;
                  setLocalData(prev => ({...prev, config: {...prev.config, heroBadge: val}}));
                }} className={InputStyle}/>
              </div>
              <div className="space-y-4">
                <label className={LabelStyle}>메인 배경 이미지 (PC)</label>
                <div className="flex items-center gap-4">
                    {localData.config.heroBg && <img src={localData.config.heroBg} className="w-16 h-10 rounded-lg border bg-gray-50 object-cover" />}
                    <label className="flex-1 cursor-pointer bg-gray-100 p-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black hover:bg-gray-200 transition-all">
                        <Upload size={16}/> 파일 선택
                        <input type="file" className="hidden" onChange={e => handleImageUpload(e, (base) => setLocalData(prev => ({...prev, config: {...prev.config, heroBg: base}})))} />
                    </label>
                </div>
              </div>
              <div className="space-y-4">
                <label className={LabelStyle}>메인 배경 이미지 (모바일 전용)</label>
                <div className="flex items-center gap-4">
                    {(localData.config.heroBgMobile || localData.config.heroBg) && <img src={localData.config.heroBgMobile || localData.config.heroBg} className="w-10 h-16 rounded-lg border bg-gray-50 object-cover" />}
                    <label className="flex-1 cursor-pointer bg-gray-100 p-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black hover:bg-gray-200 transition-all">
                        <Upload size={16}/> 파일 선택
                        <input type="file" className="hidden" onChange={e => handleImageUpload(e, (base) => setLocalData(prev => ({...prev, config: {...prev.config, heroBgMobile: base}})))} />
                    </label>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <label className={LabelStyle}>메인 타이틀 (실시간 텍스트)</label>
                <textarea value={localData.config.heroTitle} onChange={e => {
                  const val = e.target.value;
                  setLocalData(prev => ({...prev, config: {...prev.config, heroTitle: val}}));
                }} className={`${InputStyle} min-h-[150px] text-3xl font-black`} />
              </div>
              <div className="md:col-span-2 space-y-4">
                <label className={LabelStyle}>메인 설명</label>
                <textarea value={localData.config.heroDesc} onChange={e => {
                  const val = e.target.value;
                  setLocalData(prev => ({...prev, config: {...prev.config, heroDesc: val}}));
                }} className={`${InputStyle} min-h-[100px]`} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'depts' && (
          <div className="space-y-10 animate-fade-in">
             <h2 className={SectionTitle}>부서별 소개 관리</h2>
             {localData.departments.map((dept, i) => (
               <div key={dept.id} className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className={LabelStyle}>아이콘 (이모지)</label>
                        <input type="text" value={dept.icon} onChange={e => { const updated = [...localData.departments]; updated[i].icon = e.target.value; setLocalData({...localData, departments: updated}); }} className={InputStyle} />
                    </div>
                    <div className="space-y-4">
                        <label className={LabelStyle}>부서 이름</label>
                        <input type="text" value={dept.name} onChange={e => { const updated = [...localData.departments]; updated[i].name = e.target.value; setLocalData({...localData, departments: updated}); }} className={InputStyle} />
                    </div>
                    <div className="space-y-4">
                        <label className={LabelStyle}>부장 이름</label>
                        <input type="text" value={dept.leaderName} onChange={e => { const updated = [...localData.departments]; updated[i].leaderName = e.target.value; setLocalData({...localData, departments: updated}); }} className={InputStyle} />
                    </div>
                    <div className="space-y-4">
                        <label className={LabelStyle}>비전 (명언)</label>
                        <input type="text" value={dept.vision} onChange={e => { const updated = [...localData.departments]; updated[i].vision = e.target.value; setLocalData({...localData, departments: updated}); }} className={InputStyle} />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <label className={LabelStyle}>부서 설명</label>
                        <textarea value={dept.description} onChange={e => { 
                          const val = e.target.value;
                          setLocalData(prev => {
                            const updated = [...prev.departments];
                            if (updated[i]) updated[i].description = val;
                            return { ...prev, departments: updated };
                          });
                        }} className={`${InputStyle} min-h-[100px]`} />
                    </div>
                 </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className={SectionTitle}>활동 내역 관리 (4:5 카드뉴스)</h2>
              <button onClick={() => setLocalData({...localData, activities: [{id: Date.now().toString(), title: '', content: '', date: new Date().toISOString().split('T')[0], images: []}, ...localData.activities]})} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-black transition-all shadow-lg flex items-center gap-2 text-sm font-black"><Plus size={20}/> 새 활동 추가</button>
            </div>
            {localData.activities.map((act, i) => (
              <div key={act.id} className="p-10 bg-white rounded-[3rem] border border-gray-100 relative group shadow-sm">
                <button onClick={() => { 
                  if(confirm('삭제할까요?')){ 
                    setLocalData(prev => {
                      const updated = [...prev.activities];
                      updated.splice(i, 1);
                      return { ...prev, activities: updated };
                    });
                  }
                }} className="absolute top-8 right-8 text-red-300 hover:text-red-500"><Trash2 size={24}/></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <input type="text" value={act.title} onChange={e => { 
                      const val = e.target.value;
                      setLocalData(prev => {
                        const updated = [...prev.activities];
                        if (updated[i]) updated[i].title = val;
                        return { ...prev, activities: updated };
                      });
                    }} className={InputStyle} placeholder="활동 제목"/>
                    <input type="date" value={act.date} onChange={e => { 
                      const val = e.target.value;
                      setLocalData(prev => {
                        const updated = [...prev.activities];
                        if (updated[i]) updated[i].date = val;
                        return { ...prev, activities: updated };
                      });
                    }} className={InputStyle}/>
                    <textarea value={act.content} onChange={e => { 
                      const val = e.target.value;
                      setLocalData(prev => {
                        const updated = [...prev.activities];
                        if (updated[i]) updated[i].content = val;
                        return { ...prev, activities: updated };
                      });
                    }} className={`${InputStyle} min-h-[200px]`} placeholder="활동 설명"/>
                  </div>
                  <div className="space-y-4">
                    <label className={LabelStyle}>사진 업로드 (여러 장 가능)</label>
                    <label className="cursor-pointer bg-gray-100 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-sm font-black text-gray-400 hover:bg-gray-200 transition-all">
                        <Upload size={32}/> 활동 사진 선택하기
                        <input type="file" multiple className="hidden" onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            try {
                                const bases = await Promise.all(files.map((f: File) => compressImage(f)));
                                setLocalData(prev => {
                                  const updated = [...prev.activities];
                                  if (updated[i]) updated[i].images = [...updated[i].images, ...bases];
                                  return { ...prev, activities: updated };
                                });
                                e.target.value = '';
                            } catch (err) {
                                console.error('Multi-image upload error:', err);
                            }
                        }} />
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {act.images.map((img, imgI) => (
                            <div key={imgI} className="aspect-[4/5] rounded-2xl overflow-hidden relative group/img shadow-sm">
                                {img && <img src={img} className="w-full h-full object-cover" />}
                                <button onClick={() => { const updated = [...localData.activities]; updated[i].images.splice(imgI, 1); setLocalData({...localData, activities: updated}); }} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white"><Trash2 size={20}/></button>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'magazine' && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className={SectionTitle}>이음 매거진 관리</h2>
              <button onClick={() => setLocalData({...localData, magazines: [{id: Date.now().toString(), title: '', author: '', category: '칼럼', highlightImage: '', images: [], content: '', date: new Date().toISOString().split('T')[0]}, ...localData.magazines]})} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-black transition-all shadow-lg flex items-center gap-2 text-sm font-black"><Plus size={20}/> 새 매거진 추가</button>
            </div>
            {localData.magazines.map((mag, i) => (
              <div key={mag.id} className="p-10 bg-white rounded-[3rem] border border-gray-100 relative shadow-sm">
                <button onClick={() => { 
                  if(confirm('삭제할까요?')){ 
                    setLocalData(prev => {
                      const updated = [...prev.magazines];
                      updated.splice(i, 1);
                      return { ...prev, magazines: updated };
                    });
                  }
                }} className="absolute top-8 right-8 text-red-300 hover:text-red-500"><Trash2 size={24}/></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <input type="text" value={mag.title} onChange={e => { 
                      const val = e.target.value;
                      setLocalData(prev => {
                        const updated = [...prev.magazines];
                        if (updated[i]) updated[i].title = val;
                        return { ...prev, magazines: updated };
                      });
                    }} className={InputStyle} placeholder="매거진 제목"/>
                    <div className="flex gap-4">
                      <input type="text" value={mag.author} onChange={e => { 
                        const val = e.target.value;
                        setLocalData(prev => {
                          const updated = [...prev.magazines];
                          if (updated[i]) updated[i].author = val;
                          return { ...prev, magazines: updated };
                        });
                      }} className={InputStyle} placeholder="작성자"/>
                      <input type="date" value={mag.date} onChange={e => { 
                        const val = e.target.value;
                        setLocalData(prev => {
                          const updated = [...prev.magazines];
                          if (updated[i]) updated[i].date = val;
                          return { ...prev, magazines: updated };
                        });
                      }} className={InputStyle}/>
                    </div>
                    <select value={mag.category} onChange={e => { 
                      const val = e.target.value as MagazineCategory;
                      setLocalData(prev => {
                        const updated = [...prev.magazines];
                        if (updated[i]) updated[i].category = val;
                        return { ...prev, magazines: updated };
                      });
                    }} className={InputStyle}>
                        <option value="활동소식">활동소식</option><option value="인터뷰">인터뷰</option><option value="칼럼">칼럼</option><option value="탐구자료">탐구자료</option>
                    </select>
                    <textarea value={mag.content} onChange={e => { 
                      const val = e.target.value;
                      setLocalData(prev => {
                        const updated = [...prev.magazines];
                        if (updated[i]) updated[i].content = val;
                        return { ...prev, magazines: updated };
                      });
                    }} className={`${InputStyle} min-h-[300px]`} placeholder="본문 내용"/>
                  </div>
                  <div className="space-y-6">
                    <label className={LabelStyle}>하이라이트 (썸네일)</label>
                    <label className="cursor-pointer bg-gray-100 p-6 rounded-3xl flex items-center justify-center gap-3 text-xs font-black hover:bg-gray-200 transition-all border-2 border-dashed border-gray-200">
                        {mag.highlightImage ? <img src={mag.highlightImage} className="w-full h-40 object-cover rounded-xl" /> : <><Upload size={20}/> 썸네일 업로드</>}
                        <input type="file" className="hidden" onChange={e => handleImageUpload(e, (base) => { 
                          setLocalData(prev => {
                            const updated = [...prev.magazines];
                            if (updated[i]) updated[i].highlightImage = base;
                            return { ...prev, magazines: updated };
                          });
                        })} />
                    </label>
                    <label className={LabelStyle}>본문 추가 사진</label>
                    <label className="cursor-pointer bg-gray-100 p-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black hover:bg-gray-200 transition-all">
                        <Upload size={16}/> 사진 추가 선택
                        <input type="file" multiple className="hidden" onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            try {
                                const bases = await Promise.all(files.map((f: File) => compressImage(f)));
                                setLocalData(prev => {
                                  const updated = [...prev.magazines];
                                  if (updated[i]) updated[i].images = [...updated[i].images, ...bases];
                                  return { ...prev, magazines: updated };
                                });
                                e.target.value = '';
                            } catch (err) {
                                console.error('Multi-image upload error:', err);
                            }
                        }} />
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {mag.images.map((img, imgI) => (
                            <div key={imgI} className="aspect-square rounded-xl overflow-hidden relative group/img shadow-sm">
                                {img && <img src={img} className="w-full h-full object-cover" />}
                                <button onClick={() => { const updated = [...localData.magazines]; updated[i].images.splice(imgI, 1); setLocalData({...localData, magazines: updated}); }} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'society' && (
          <div className="space-y-16 animate-fade-in">
            <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
              <h2 className={SectionTitle}>학회 설명 및 소속 학교</h2>
              <textarea value={localData.societyDesc} onChange={e => {
                const val = e.target.value;
                setLocalData(prev => ({...prev, societyDesc: val}));
              }} className={`${InputStyle} min-h-[120px]`} placeholder="학회 소개 글을 작성하세요." />
              <div className="flex items-center justify-between mt-10">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest italic">소속 동아리/학교 리스트</h3>
                <button onClick={() => setLocalData(prev => ({...prev, societyMembers: [...prev.societyMembers, {id: Date.now().toString(), name: '', schoolName: '', schoolLogo: ''}]}))} className="p-3 bg-gray-100 rounded-xl hover:bg-black hover:text-white transition-all"><Plus size={20}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localData.societyMembers.map((m, i) => (
                  <div key={m.id} className="p-6 bg-gray-50 rounded-3xl flex items-center gap-6 relative group">
                    <button onClick={() => { 
                      setLocalData(prev => {
                        const updated = [...prev.societyMembers];
                        updated.splice(i, 1);
                        return { ...prev, societyMembers: updated };
                      });
                    }} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                    <label className="w-16 h-16 rounded-full border bg-white flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0">
                        {m.schoolLogo && m.schoolLogo !== "" ? <img src={m.schoolLogo} className="w-full h-full object-contain" /> : <Upload size={16} className="text-gray-300"/>}
                        <input type="file" className="hidden" onChange={e => handleImageUpload(e, (base) => { 
                          setLocalData(prev => {
                            const updated = [...prev.societyMembers];
                            if (updated[i]) updated[i].schoolLogo = base;
                            return { ...prev, societyMembers: updated };
                          });
                        }, 500)} />
                    </label>
                    <div className="flex-grow space-y-2">
                        <input type="text" value={m.schoolName} onChange={e => { 
                          const val = e.target.value;
                          setLocalData(prev => {
                            const updated = [...prev.societyMembers];
                            if (updated[i]) updated[i].schoolName = val;
                            return { ...prev, societyMembers: updated };
                          });
                        }} className="w-full bg-white px-4 py-2 rounded-xl text-xs font-black border border-gray-100" placeholder="학교명"/>
                        <input type="text" value={m.name} onChange={e => { 
                          const val = e.target.value;
                          setLocalData(prev => {
                            const updated = [...prev.societyMembers];
                            if (updated[i]) updated[i].name = val;
                            return { ...prev, societyMembers: updated };
                          });
                        }} className="w-full bg-white px-4 py-2 rounded-xl text-sm font-black border border-gray-100" placeholder="동아리명"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h2 className={SectionTitle}>학회 활동 소개</h2>
                <button onClick={() => setLocalData({...localData, societyActivities: [...localData.societyActivities, {id: Date.now().toString(), title: '', description: ''}]})} className="p-3 bg-gray-100 rounded-xl hover:bg-black hover:text-white transition-all"><Plus size={20}/></button>
              </div>
               <div className="space-y-6">
                {localData.societyActivities.map((sa, i) => (
                    <div key={sa.id} className="p-8 bg-gray-50 rounded-3xl relative group space-y-4">
                        <button onClick={() => { 
                          setLocalData(prev => {
                            const updated = [...prev.societyActivities];
                            updated.splice(i, 1);
                            return { ...prev, societyActivities: updated };
                          });
                        }} className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                        <input type="text" value={sa.title} onChange={e => { 
                          const val = e.target.value;
                          setLocalData(prev => {
                            const updated = [...prev.societyActivities];
                            if (updated[i]) updated[i].title = val;
                            return { ...prev, societyActivities: updated };
                          });
                        }} className="w-full bg-white px-6 py-4 rounded-2xl text-lg font-black border border-gray-100" placeholder="활동 제목"/>
                        <textarea value={sa.description} onChange={e => { 
                          const val = e.target.value;
                          setLocalData(prev => {
                            const updated = [...prev.societyActivities];
                            if (updated[i]) updated[i].description = val;
                            return { ...prev, societyActivities: updated };
                          });
                        }} className="w-full bg-white px-6 py-4 rounded-2xl text-sm font-bold border border-gray-100 min-h-[100px]" placeholder="활동에 대한 상세 설명을 작성하세요."/>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm animate-fade-in space-y-10">
            <div className="flex items-center justify-between">
                <h2 className={SectionTitle}>문의처 및 연락처 관리</h2>
                <button onClick={() => setLocalData({...localData, contacts: [...localData.contacts, {id: Date.now().toString(), type: '', label: '', value: ''}]})} className="p-4 bg-blue-600 text-white rounded-2xl flex items-center gap-2 text-sm font-black shadow-lg"><Plus size={20}/> 항목 추가</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {localData.contacts.map((c, i) => (
                    <div key={c.id} className="p-8 bg-gray-50 rounded-[2.5rem] relative group space-y-4">
                         <button onClick={() => { 
                           setLocalData(prev => {
                             const updated = [...prev.contacts];
                             updated.splice(i, 1);
                             return { ...prev, contacts: updated };
                           });
                         }} className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                         <div className="space-y-2">
                            <label className={LabelStyle}>라벨 (예: 기장 연락처, 이메일)</label>
                            <input type="text" value={c.label} onChange={e => { 
                              const val = e.target.value;
                              setLocalData(prev => {
                                const updated = [...prev.contacts];
                                if (updated[i]) updated[i].label = val;
                                return { ...prev, contacts: updated };
                              });
                            }} className="w-full bg-white px-6 py-4 rounded-2xl text-sm font-black border border-gray-100" />
                         </div>
                         <div className="space-y-2">
                            <label className={LabelStyle}>정보 내용 (연락처, ID 등)</label>
                            <input type="text" value={c.value} onChange={e => { 
                              const val = e.target.value;
                              setLocalData(prev => {
                                const updated = [...prev.contacts];
                                if (updated[i]) updated[i].value = val;
                                return { ...prev, contacts: updated };
                              });
                            }} className="w-full bg-white px-6 py-4 rounded-2xl text-sm font-black border border-gray-100" />
                         </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm animate-fade-in space-y-10">
            <div className="flex items-center justify-between">
                <h2 className={SectionTitle}>협력 동아리 관리</h2>
                <button onClick={() => setLocalData(prev => ({...prev, partners: [...prev.partners, {id: Date.now().toString(), schoolName: '', clubName: '', logo: ''}]}))} className="p-4 bg-blue-600 text-white rounded-2xl flex items-center gap-2 text-sm font-black shadow-lg"><Plus size={20}/> 동아리 추가</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {localData.partners.map((p, i) => (
                    <div key={p.id} className="p-8 bg-gray-50 rounded-[2.5rem] flex items-center gap-8 relative group">
                         <button onClick={() => { 
                           setLocalData(prev => {
                             const updated = [...prev.partners];
                             updated.splice(i, 1);
                             return { ...prev, partners: updated };
                           });
                         }} className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                         <label className="w-20 h-20 rounded-full border-2 border-dashed bg-white flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0">
                            {p.logo && p.logo !== "" ? <img src={p.logo} className="w-full h-full object-contain" /> : <Upload size={20} className="text-gray-300"/>}
                            <input type="file" className="hidden" onChange={e => handleImageUpload(e, (base) => { 
                              setLocalData(prev => {
                                const updated = [...prev.partners];
                                if (updated[i]) updated[i].logo = base;
                                return { ...prev, partners: updated };
                              });
                            }, 500)} />
                         </label>
                         <div className="flex-grow space-y-3">
                            <input type="text" value={p.schoolName} onChange={e => { 
                              const val = e.target.value;
                              setLocalData(prev => {
                                const updated = [...prev.partners];
                                if (updated[i]) updated[i].schoolName = val;
                                return { ...prev, partners: updated };
                              });
                            }} className="w-full bg-white px-6 py-3 rounded-2xl text-xs font-black border border-gray-100 uppercase" placeholder="학교 이름" />
                            <input type="text" value={p.clubName} onChange={e => { 
                              const val = e.target.value;
                              setLocalData(prev => {
                                const updated = [...prev.partners];
                                if (updated[i]) updated[i].clubName = val;
                                return { ...prev, partners: updated };
                              });
                            }} className="w-full bg-white px-6 py-3 rounded-2xl text-lg font-black border border-gray-100" placeholder="동아리 이름" />
                         </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div className="fixed bottom-12 right-12 z-[1000] bg-black text-white px-10 py-5 rounded-full flex items-center gap-4 animate-bounce shadow-3xl">
          <CheckCircle2 className="text-blue-500" size={24}/>
          <span className="font-black text-sm uppercase tracking-widest">{feedback}</span>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
