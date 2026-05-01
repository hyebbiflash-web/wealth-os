/* eslint-disable no-undef */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { LayoutDashboard, Target, Wallet, History, PlusCircle, ArrowUpCircle, ArrowDownCircle, PiggyBank, X, Loader2, Filter, Calendar, LogOut, Trash2, ChevronRight, ShieldCheck, Plus, UserCheck, Building2, Edit, CreditCard } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyBXkr2KSM8ccqLkeRoHNDgV7CdDyDaEFXs",
  authDomain: "wealthos-368d6.firebaseapp.com",
  projectId: "wealthos-368d6",
  storageBucket: "wealthos-368d6.firebasestorage.app",
  messagingSenderId: "1034597851152",
  appId: "1:1034597851152:web:d02651f83a7b6a1129ea95"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "wealth-os-v23";
const googleProvider = new GoogleAuthProvider();

const CURRENCY_UNITS = [
  { label: 'KRW (₩)', value: 'KRW' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'JPY (¥)', value: 'JPY' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'CNY (¥)', value: 'CNY' },
  { label: 'Gold (g)', value: 'Gold' },
  { label: 'BTC (BTC)', value: '비트코인' },
  { label: 'ETH (ETH)', value: '이더리움' },
  { label: 'USDT (USDT)', value: '스테이블코인' }
];

const ASSET_CATEGORIES = ['현금성', '투자성', '연금', '보장성', '부채', '기타 (직접 입력)'];

const ALL_FINANCIAL_INSTITUTIONS = [
  "선택하세요","--- 은행 ---",
  "KB국민은행","신한은행","우리은행","하나은행","NH농협은행","IBK기업은행",
  "카카오뱅크","토스뱅크","케이뱅크","새마을금고","신협","우체국",
  "--- 카드사 ---",
  "신한카드","삼성카드","현대카드","KB국민카드","롯데카드","우리카드","하나카드","비씨카드",
  "--- 증권사 ---",
  "미래에셋증권","삼성증권","한국투자증권","NH투자증권","KB증권","키움증권",
  "--- 보험사 ---",
  "삼성생명","한화생명","교보생명","삼성화재","현대해상",
  "--- 암호화폐 거래소 ---",
  "업비트","빗썸","코인원","코빗","바이낸스","Ledger (하드웨어 지갑)","개인 지갑",
  "기타 (직접 입력)"
];

const DEFAULT_EXPENSE_LIST = ["건강","개인 용돈","경조사","교통비","구독료","데이트","돌발","보험료","비상금","식비","자기계발","여행","은행 이자","저축","주거 (생활비)","주거 (월세)","투자 (공격형)","투자 (안정형)","투자 (중립형)","통신료"];
const DEFAULT_INCOME_LIST = ["배당금","부업","상여금","사업소득","성과급","월급","연금","이자수익","증여/용돈"];

const formatValue = (num, unit = 'KRW') => {
  const isNegative = Number(num) < 0;
  const absNum = Math.abs(Math.floor(Number(num || 0)));
  const formatted = absNum.toLocaleString();
  const sign = isNegative ? '-' : '';
  switch(unit) {
    case 'KRW': return `${sign}₩${formatted}`;
    case 'USD': return `${sign}$${formatted}`;
    case 'JPY': return `${sign}¥${formatted}`;
    case 'EUR': return `${sign}€${formatted}`;
    case 'CNY': return `${sign}¥${formatted}`;
    case 'Gold': return `${sign}${formatted}g`;
    default: return `${sign}${formatted} ${unit}`;
  }
};

const GoogleIcon = ({ white }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {white ? (
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="white"/>
    ) : (
      <>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
      </>
    )}
  </svg>
);

const AuthScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoLogin, setAutoLogin] = useState(() => localStorage.getItem('autoLogin') === 'true');

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true); setError('');
    try { await signInWithPopup(auth, googleProvider); }
    catch (err) { setError('로그인에 실패했습니다.'); setAutoLogin(false); localStorage.setItem('autoLogin', 'false'); console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (autoLogin) { handleGoogleLogin(); } }, []); // eslint-disable-line

  const toggleAutoLogin = () => { const next = !autoLogin; setAutoLogin(next); localStorage.setItem('autoLogin', String(next)); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-sm bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Wealth os</h1>
          <p className="text-sm text-gray-400 font-bold mt-1">자산 관리 시스템</p>
          <p className="text-sm font-bold text-gray-600 mt-4">똑부러지게 자산 관리를 시작해봐요!</p>
        </div>
        <div className="space-y-3 mb-5">
          <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 rounded-2xl font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-md">
            {loading ? <Loader2 className="animate-spin" size={20}/> : <><GoogleIcon white/><span>구글 계정으로 로그인</span></>}
          </button>
          <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
            {loading ? <Loader2 className="animate-spin text-gray-400" size={20}/> : <><GoogleIcon/><span>구글 계정으로 가입하기</span></>}
          </button>
        </div>
        <div className="flex justify-center mt-4 mb-4">
          <button onClick={toggleAutoLogin} style={{background:'none',border:'none',outline:'none',boxShadow:'none',padding:0}} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-500 transition-colors">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${autoLogin ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
              {autoLogin && <span className="text-white text-[10px]">✓</span>}
            </div>
            자동 로그인
          </button>
        </div>
        {error && <p className="text-red-500 text-[11px] font-bold mb-4">{error}</p>}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <button onClick={() => { if(window.confirm('회원 탈퇴를 진행하시겠습니까?')) {} }} className="text-xs text-gray-400 font-bold hover:text-red-400 transition-colors" style={{background:'none',border:'none',padding:0}}>
            탈퇴하기
          </button>
        </div>
      </div>
      <p className="mt-8 text-[9px] text-gray-300 font-black uppercase tracking-[0.4em]">Hobang bbu v1.0</p>
    </div>
  );
};

const PlanModal = ({ title, plans, categoryList, accounts, userPath, onClose, color = 'blue' }) => {
  const [showSaveMsg, setShowSaveMsg] = useState(false);
  const plan = plans[plans.length - 1];

  const handleSave = () => {
    setShowSaveMsg(true);
    setTimeout(() => { setShowSaveMsg(false); onClose(); }, 1500);
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="w-full bg-white rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 p-1 hover:bg-gray-100 rounded-full"><X size={24}/></button>
        <h2 className="text-lg font-bold mb-6">{title}</h2>
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100 mb-4">
  <div className="grid grid-cols-2 gap-2">
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-gray-400">항목</label>
      <select value={plan.category} onChange={e => updateDoc(doc(db, userPath, 'plans', plan.id), { category: e.target.value })} className="w-full font-bold text-sm bg-white outline-none border rounded-lg p-2">
        {categoryList.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-gray-400">성격</label>
      <select value={plan.nature || '변동'} onChange={e => updateDoc(doc(db, userPath, 'plans', plan.id), { nature: e.target.value })} className="w-full bg-white outline-none border rounded-lg p-2 text-xs font-bold">
        <option value="고정">고정</option>
        <option value="변동">변동</option>
      </select>
    </div>
  </div>
  <div className="space-y-1">
    <label className="text-[9px] font-bold text-gray-400">통장 쪼개기</label>
    <select value={plan.accountSplit || ''} onChange={e => updateDoc(doc(db, userPath, 'plans', plan.id), { accountSplit: e.target.value })} className="w-full bg-white outline-none border rounded-lg p-2 text-xs font-bold">
      <option value="">선택안함</option>
      {accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
    </select>
  </div>
  <div className="space-y-3">
  <div className="space-y-1">
    <label className="text-[9px] font-bold text-gray-400">{color === 'green' ? '예상 금액' : '예산'}</label>
    <div className="flex items-center border rounded-lg overflow-hidden bg-white">
      <select value={plan.currency || 'KRW'} onChange={e => updateDoc(doc(db, userPath, 'plans', plan.id), { currency: e.target.value })} className="text-[9px] bg-gray-50 outline-none font-bold border-r px-1 py-2">
        {CURRENCY_UNITS.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
      </select>
      <input type="text" value={plan.budget === 0 ? '' : plan.budget.toLocaleString()} onChange={e => updateDoc(doc(db, userPath, 'plans', plan.id), { budget: parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0 })} className="flex-1 px-2 py-2 text-right font-bold text-xs outline-none" placeholder="0"/>
    </div>
  </div>
  {color === 'green' && (
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-gray-400">목표 금액</label>
      <div className="flex items-center border rounded-lg overflow-hidden bg-white">
        <select value={plan.targetCurrency || 'KRW'} onChange={e => updateDoc(doc(db, userPath, 'plans', plan.id), { targetCurrency: e.target.value })} className="text-[9px] bg-gray-50 outline-none font-bold border-r px-1 py-2">
          {CURRENCY_UNITS.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
        </select>
        <input type="text" value={(plan.targetAmount || 0) === 0 ? '' : (plan.targetAmount || 0).toLocaleString()} onChange={e => updateDoc(doc(db, userPath, 'plans', plan.id), { targetAmount: parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0 })} className="flex-1 px-2 py-2 text-right font-bold text-xs outline-none" placeholder="0"/>
      </div>
    </div>
  )}
  {color !== 'green' && (
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-gray-400">비고</label>
      <textarea value={plan.remarks || ''} onChange={e => updateDoc(doc(db, userPath, 'plans', plan.id), { remarks: e.target.value })} rows={2} className="w-full bg-white rounded-lg p-2 outline-none resize-none text-xs border" placeholder="메모를 입력하세요"/>
    </div>
  )}
</div>
  {color === 'green' && (
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-gray-400">비고</label>
      <textarea value={plan.remarks || ''} onChange={e => updateDoc(doc(db, userPath, 'plans', plan.id), { remarks: e.target.value })} rows={2} className="w-full bg-white rounded-lg p-2 outline-none resize-none text-xs border" placeholder="메모를 입력하세요"/>
    </div>
  )}
</div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">취소</button>
          <button onClick={handleSave} className={`flex-1 py-4 ${color === 'green' ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-2xl font-bold shadow-lg`}>저장</button>
        </div>
        {showSaveMsg && <div className={`mt-4 text-center ${color === 'green' ? 'text-green-600' : 'text-blue-600'} font-black text-2xl animate-bounce`}>저장 완료</div>}
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState([]);
  const [expensePlans, setExpensePlans] = useState([]);
  const [incomePlans, setIncomePlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isExpensePlanModalOpen, setIsExpensePlanModalOpen] = useState(false);
  const [isIncomePlanModalOpen, setIsIncomePlanModalOpen] = useState(false);
  const [isTransactionEditModalOpen, setIsTransactionEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [historyAssetFilter, setHistoryAssetFilter] = useState('all');
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [managerFilter, setManagerFilter] = useState({ expense: 'all', income: 'all', asset: 'all' });
  const [isAssetFilterOpen, setIsAssetFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isManagerFilterOpen, setIsManagerFilterOpen] = useState(false);
  const [swipedAccountId, setSwipedAccountId] = useState(null);
  const [swipedTxId, setSwipedTxId] = useState(null);
  const [swipedPlanId, setSwipedPlanId] = useState(null);
  const [swipedExpensePlanId, setSwipedExpensePlanId] = useState(null);
  const [goalMemo, setGoalMemo] = useState(() => localStorage.getItem('goalMemo') || '');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [customManagers, setCustomManagers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customManagers') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
    return () => unsub();
  }, []);

  const userPath = useMemo(() => user ? `artifacts/${appId}/users/${user.uid}` : null, [user]);

  useEffect(() => {
    if (!user || !userPath) return;
    const unsubAcc = onSnapshot(collection(db, userPath, 'accounts'), (s) => setAccounts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubPlans = onSnapshot(collection(db, userPath, 'plans'), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setExpensePlans(data.filter(p => p.type === 'expense'));
      setIncomePlans(data.filter(p => p.type === 'income'));
    });
    const unsubTx = onSnapshot(collection(db, userPath, 'transactions'), (s) => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.date.localeCompare(a.date))));
    return () => { unsubAcc(); unsubPlans(); unsubTx(); };
  }, [user, userPath]);

  const getSortedCategories = useCallback((defaultList, plans, type) => {
    const counts = transactions.filter(t => t.type === type).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {});
    const planCats = plans.map(p => p.category);
    const allCats = Array.from(new Set([...defaultList, ...planCats])).filter(cat => cat !== "기타 (직접 입력)" && cat !== "").sort((a, b) => a.localeCompare(b, 'ko'));
    const sorted = allCats.sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
    return [...sorted, "기타 (직접 입력)"];
  }, [transactions]);

  const expenseCategoryList = useMemo(() => getSortedCategories(DEFAULT_EXPENSE_LIST, expensePlans, 'expense'), [getSortedCategories, expensePlans]);
  const incomeCategoryList = useMemo(() => getSortedCategories(DEFAULT_INCOME_LIST, incomePlans, 'income'), [getSortedCategories, incomePlans]);

  const managerList = useMemo(() => {
    const fromTx = transactions.map(t => t.manager).filter(m => m);
    return Array.from(new Set(["신랑", "신부", ...customManagers, ...fromTx])).filter(m => m !== "기타 (직접 입력)");
  }, [transactions, customManagers]);

  const addCustomManager = (name) => {
    if (!name || customManagers.includes(name)) return;
    const updated = [...customManagers, name];
    setCustomManagers(updated);
    localStorage.setItem('customManagers', JSON.stringify(updated));
    const removeCustomManager = (name) => {
      const updated = customManagers.filter(m => m !== name);
      setCustomManagers(updated);
      localStorage.setItem('customManagers', JSON.stringify(updated));
    };
  };

  const multiCurrencyTotals = useMemo(() => {
    const totals = {};
    accounts.forEach(acc => { const unit = acc.currency || 'KRW'; totals[unit] = (totals[unit] || 0) + acc.balance; });
    return totals;
  }, [accounts]);

  const handleAddTransaction = async (txData) => {
    if (!userPath) return;
    const amount = parseInt(txData.amount) || 0;
    if (txData.id) {
      await updateDoc(doc(db, userPath, 'transactions', txData.id), { ...txData, amount });
      setIsTransactionEditModalOpen(false);
    } else {
      await addDoc(collection(db, userPath, 'transactions'), { ...txData, amount });
      const targetAcc = accounts.find(a => a.id === txData.accountId);
      if (targetAcc) {
        const newBalance = (Number(targetAcc.balance) || 0) + (txData.type === 'expense' ? -amount : amount);
        await updateDoc(doc(db, userPath, 'accounts', targetAcc.id), { balance: newBalance, currency: txData.currency });
      }
      setActiveTab('dashboard');
    }
  };

  const handleSaveAccount = async (data) => {
    if (!userPath) return;
    const { id, ...accountData } = data;
    if (id) await updateDoc(doc(db, userPath, 'accounts', id), accountData);
    else await addDoc(collection(db, userPath, 'accounts'), accountData);
    setIsAccountModalOpen(false); setEditingAccount(null);
  };

  const addExpensePlan = async () => {
    if (!userPath) return;
    await addDoc(collection(db, userPath, 'plans'), { type: 'expense', category: '식비', budget: 0, currency: 'KRW', nature: '변동', remarks: '', accountSplit: '' });
    setIsExpensePlanModalOpen(true);
  };

  const addIncomePlan = async () => {
    if (!userPath) return;
    await addDoc(collection(db, userPath, 'plans'), { type: 'income', category: '월급', budget: 0, currency: 'KRW', targetAmount: 0, targetCurrency: 'KRW', nature: '고정', remarks: '', accountSplit: '' });
    setIsIncomePlanModalOpen(true);
  };

  const monthStart = `${selectedDate.slice(0, 7)}-01`;
  const periodTxs = transactions.filter(tx => tx.date >= monthStart && tx.date <= selectedDate);
  const monthlySpent = periodTxs.filter(tx => tx.type === 'expense').reduce((s, c) => s + c.amount, 0);
  const monthlyIncome = periodTxs.filter(tx => tx.type === 'income').reduce((s, c) => s + c.amount, 0);

  if (authLoading) return <div className="h-screen flex items-center justify-center font-bold text-gray-400 bg-white">Wealth os 로딩 중...</div>;
  if (!user) return <AuthScreen />;

  return (
    <div className="flex flex-col bg-gray-50 text-gray-900 max-w-md mx-auto border-x relative font-sans text-left" style={{height: '100dvh', overflow: 'hidden'}}>
      <header className="bg-white px-6 pt-8 pb-4 border-b flex justify-between items-end">
        <div><h1 className="text-xl font-bold tracking-tight">Wealth os</h1><p className="text-[10px] text-gray-400 font-bold">USER: <span className="text-blue-600">{user?.email?.split('@')[0] || user?.displayName || '사용자'}</span></p></div>
        <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-400 transition-colors"><LogOut size={20}/></button>
      </header>
      <main className="flex-1 px-4 pt-4" style={{overflowY: 'auto', paddingBottom: '1rem'}}>
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1"><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-gray-100 px-2 py-1 rounded-lg font-bold text-sm outline-none" /><span className="text-[11px] text-gray-400 font-bold">오늘 {new Date().toLocaleDateString()}</span></div>
            <div className="bg-gray-900 p-6 rounded-3xl text-white shadow-xl">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">총 자산 현황</span>
              <div className="mt-2 space-y-2">
                {Object.keys(multiCurrencyTotals).length === 0 ? (
                  <div className="text-3xl font-bold text-blue-400">₩0</div>
                ) : (
                  Object.entries(multiCurrencyTotals)
                    .sort(([a], [b]) => {
                      const order = ['KRW','USD','JPY','EUR','CNY','Gold','비트코인','이더리움','스테이블코인'];
                      return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b));
                    })
                    .map(([unit, val]) => (
                      <div key={unit} className="flex justify-between items-baseline border-b border-white/10 pb-1 last:border-0 last:pb-0">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{unit}</span>
                        <div className="text-xl font-bold">{formatValue(val, unit)}</div>
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className="bg-gray-900 p-6 rounded-3xl text-white shadow-xl">
  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">목표 설정</span>
  <textarea
    className="w-full mt-3 bg-transparent text-white text-sm font-bold outline-none resize-none placeholder-gray-600"
    rows={3}
    placeholder="목표를 입력하세요..."
    value={goalMemo}
    onChange={e => { setGoalMemo(e.target.value); localStorage.setItem('goalMemo', e.target.value); }}
  />
</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"><div><div className="flex items-center gap-2 mb-1 text-red-500 font-bold"><ArrowDownCircle size={14}/><span>월 지출액</span></div><div className="text-[9px] text-gray-400 font-bold mb-2">({monthStart.slice(5).replace(/-/g,'.')} ~ {selectedDate.slice(5).replace(/-/g,'.')})</div></div><div className="text-lg font-bold">{formatValue(monthlySpent)}</div></div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"><div><div className="flex items-center gap-2 mb-1 text-blue-500 font-bold"><ArrowUpCircle size={14}/><span>월 수입액</span></div><div className="text-[9px] text-gray-400 font-bold mb-2">({monthStart.slice(5).replace(/-/g,'.')} ~ {selectedDate.slice(5).replace(/-/g,'.')})</div></div><div className="text-lg font-bold">{formatValue(monthlyIncome)}</div></div>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-800 text-sm">최근 이용 내역</h3><button onClick={() => setActiveTab('history')} className="text-[11px] text-gray-400 font-bold flex items-center gap-1 hover:text-blue-500 transition-colors">전체보기 <ChevronRight size={12}/></button></div>
              <div className="space-y-4">
                {periodTxs.slice(0, 3).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3"><div className={`p-1.5 rounded-full ${tx.type==='expense'?'bg-red-50 text-red-400':'bg-blue-50 text-blue-400'}`}><ArrowDownCircle size={14}/></div><div><p className="font-bold">{tx.category}</p><p className="text-[10px] text-gray-400 font-bold">{tx.date} {tx.manager ? `• ${tx.manager}` : ''}</p></div></div>
                    <span className={`font-bold ${tx.type==='expense'?'text-red-500':'text-blue-500'}`}>{tx.type==='expense'?'-':'+'} {formatValue(tx.amount, tx.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2"><h2 className="text-lg font-bold flex items-center gap-2"><Target className="text-blue-600" /> 운영 계획</h2></div>
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h3 className="text-sm font-bold text-gray-400 tracking-wide">지출 계획</h3>
                <button onClick={addExpensePlan} className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-all"><Plus size={16}/></button>
              </div>
              <div className="space-y-3">
                {expensePlans.map(plan => {
                  const spent = periodTxs.filter(tx => tx.category === plan.category).reduce((s,c)=>s+c.amount, 0);
                  const progress = Math.min((spent / (plan.budget || 1)) * 100, 100);
                  const isOver = spent > plan.budget;
                  return (
                    <div key={plan.id} className="relative overflow-hidden rounded-2xl" onClick={() => setSwipedExpensePlanId(swipedExpensePlanId === plan.id ? null : plan.id)}>
                      <div className="absolute inset-0 flex justify-end">
                        <button onClick={(e) => { e.stopPropagation(); setExpensePlans(prev => { const idx = prev.findIndex(p => p.id === plan.id); return [...prev.slice(0, idx), plan, ...prev.slice(idx+1)]; }); setIsExpensePlanModalOpen(true); }} className="w-16 h-full bg-yellow-400 text-white flex items-center justify-center font-bold text-xs"><Edit size={14}/></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, userPath, 'plans', plan.id)); }} className="w-16 h-full bg-red-500 text-white flex items-center justify-center font-bold text-xs"><Trash2 size={14}/></button>
                      </div>
                      <div className={`relative bg-gray-50 p-4 space-y-2 border border-transparent transition-transform duration-300 z-10 ${swipedExpensePlanId === plan.id ? '-translate-x-32' : 'translate-x-0'}`}>
                        <div className="flex justify-between text-[11px] font-bold px-1">
                          <div className="flex items-center gap-2"><span className="text-gray-800">{plan.category}</span>{plan.nature === '고정' && <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">FIXED</span>}</div>
                          <div className="flex items-center gap-1.5"><span className={isOver ? "text-red-500" : "text-blue-600"}>{formatValue(spent, plan.currency)}</span><span className="text-gray-300 font-normal">/</span><span className="text-gray-400">{formatValue(plan.budget, plan.currency)}</span></div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ease-out ${isOver ? 'bg-red-400' : 'bg-blue-500'}`} style={{width: `${progress}%`}}></div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h3 className="text-sm font-bold text-gray-400 tracking-wide">수입 계획</h3>
                <button onClick={addIncomePlan} className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-all"><Plus size={16}/></button>
              </div>
              <div className="space-y-3">
                {incomePlans.map(plan => {
                  const actual = periodTxs.filter(tx => tx.category === plan.category).reduce((s,c)=>s+c.amount, 0);
                  const isSuccess = actual >= plan.budget;
                  return (
                    <div key={plan.id} className="relative overflow-hidden rounded-2xl" onClick={() => setSwipedPlanId(swipedPlanId === plan.id ? null : plan.id)}>
                      <div className="absolute inset-0 flex justify-end">
                        <button onClick={(e) => { e.stopPropagation(); setIncomePlans(prev => { const idx = prev.findIndex(p => p.id === plan.id); return [...prev.slice(0, idx), plan, ...prev.slice(idx+1)]; }); setIsIncomePlanModalOpen(true); }} className="w-16 h-full bg-yellow-400 text-white flex items-center justify-center font-bold text-xs"><Edit size={14}/></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, userPath, 'plans', plan.id)); }} className="w-16 h-full bg-red-500 text-white flex items-center justify-center font-bold text-xs"><Trash2 size={14}/></button>
                      </div>
                      <div className={`relative bg-gray-50 p-4 flex justify-between items-center border border-transparent transition-transform duration-300 z-10 ${swipedPlanId === plan.id ? '-translate-x-32' : 'translate-x-0'}`}>
                        <div>
                          <span className="text-[11px] font-bold text-gray-800">{plan.category}</span>
                          {plan.nature && <span className="ml-2 text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">{plan.nature}</span>}
                          <p className="text-[9px] text-gray-400 mt-0.5 font-bold">예상: {formatValue(plan.budget, plan.currency)}</p>
                          {plan.accountSplit && <p className="text-[9px] text-gray-400 font-bold">통장: {plan.accountSplit}</p>}
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${isSuccess ? 'text-blue-600' : 'text-gray-400'}`}>{formatValue(actual, plan.currency)}</p>
                          {isSuccess && <span className="text-[8px] text-blue-400 font-bold uppercase tracking-tighter">SUCCESS</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
        {activeTab === 'record' && (
          <TransactionForm onSubmit={handleAddTransaction} accounts={accounts} managerList={managerList} addCustomManager={addCustomManager} expenseCategoryList={expenseCategoryList} incomeCategoryList={incomeCategoryList} title="활동 기록" buttonLabel="저장하기" />
        )}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1 mb-6"><h2 className="text-lg font-bold flex items-center gap-2 text-black"><Wallet size={24} className="text-blue-600" /> 전체 자산 현황</h2><button onClick={() => { setEditingAccount(null); setIsAccountModalOpen(true); }} className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all"><Plus size={20}/></button></div>
            {ASSET_CATEGORIES.map((cat) => {
              const filtered = accounts.filter(a => a.category === cat || (cat.includes('기타') && !ASSET_CATEGORIES.includes(a.category)));
              if (filtered.length === 0) return null;
              return (
                <div key={cat} className="space-y-3 mb-8 px-1">
                  <div className="flex justify-between items-baseline border-b pb-2 font-bold text-gray-800">{cat} 자산</div>
                  <div className="space-y-2">
                    {filtered.map(acc => (
                      <div key={acc.id} className="relative overflow-hidden rounded-xl">
                        <div className="absolute inset-0 flex justify-end">
                          <button onClick={() => { setEditingAccount(acc); setIsAccountModalOpen(true); }} className="w-16 h-full bg-yellow-400 text-white flex items-center justify-center font-bold text-xs"><Edit size={14}/></button>
                          <button onClick={() => deleteDoc(doc(db, userPath, 'accounts', acc.id))} className="w-16 h-full bg-red-500 text-white flex items-center justify-center font-bold text-xs"><Trash2 size={14}/></button>
                        </div>
                        <div className={`relative bg-white p-4 flex justify-between items-center border border-gray-50 shadow-sm transition-transform duration-300 z-10 cursor-pointer ${swipedAccountId === acc.id ? '-translate-x-32' : 'translate-x-0'}`} onClick={() => { if(swipedAccountId === acc.id) { setSwipedAccountId(null); } else { setSelectedAccount(acc); } }}>
                          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-50 text-blue-500"><PiggyBank size={18}/></div><div className="flex flex-col"><span className="text-sm font-bold text-gray-800">{acc.name}</span><span className="text-[10px] text-gray-400 font-bold uppercase">{acc.provider}</span></div></div>
                          <span className={`text-sm font-bold ${acc.category === '부채' ? 'text-red-500' : ''}`}>{acc.category === '부채' ? formatValue(-Math.abs(acc.balance), acc.currency) : formatValue(acc.balance, acc.currency)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {activeTab === 'history' && (
          <div className="space-y-6 relative text-left">
            <div className="flex justify-between items-center px-2 mb-2"><h2 className="text-lg font-bold flex items-center gap-2"><History size={20} /> 전체 이용 내역</h2><div className="flex gap-1.5 overflow-x-auto pb-1">
              <button onClick={() => setIsAssetFilterOpen(!isAssetFilterOpen)} className={`whitespace-nowrap flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13px] font-bold shadow-sm ${historyAssetFilter !== 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}><Filter size={12} /> 자산</button>
              <button onClick={() => setIsDateFilterOpen(!isDateFilterOpen)} className={`whitespace-nowrap flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13px] font-bold shadow-sm ${historyStartDate || historyEndDate ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}><Calendar size={12} /> 기간</button>
              <button onClick={() => setIsManagerFilterOpen(!isManagerFilterOpen)} className={`whitespace-nowrap flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13px] font-bold shadow-sm ${Object.values(managerFilter).some(v => v !== 'all') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}><UserCheck size={12} /> 담당</button>
            </div></div>
            {isAssetFilterOpen && (<div className="absolute top-12 left-0 right-0 mx-4 bg-white border shadow-2xl rounded-2xl p-4 z-40"><div className="flex justify-between items-center mb-3"><p className="text-[10px] font-bold text-gray-400 uppercase">자산 필터</p><button onClick={() => setIsAssetFilterOpen(false)}><X size={16} className="text-gray-400" /></button></div><div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto"><button onClick={() => {setHistoryAssetFilter('all'); setIsAssetFilterOpen(false);}} className={`text-left text-xs font-bold p-3 rounded-xl ${historyAssetFilter === 'all' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50'}`}>전체 자산</button>{accounts.map(a => <button key={a.id} onClick={() => {setHistoryAssetFilter(a.id); setIsAssetFilterOpen(false);}} className={`text-left text-xs font-bold p-3 rounded-xl truncate ${historyAssetFilter === a.id ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50'}`}>{a.name}</button>)}</div></div>)}
            {isDateFilterOpen && (<div className="absolute top-12 left-0 right-0 mx-4 bg-white border shadow-2xl rounded-2xl p-5 z-40"><div className="flex justify-between items-center mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase">기간 필터</p><button onClick={() => setIsDateFilterOpen(false)}><X size={16} className="text-gray-400" /></button></div><div className="space-y-4"><div className="space-y-1"><label className="text-[9px] font-bold text-gray-400 ml-1">시작일</label><input type="date" value={historyStartDate} onChange={e => setHistoryStartDate(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-xs outline-none border" /></div><div className="space-y-1"><label className="text-[9px] font-bold text-gray-400 ml-1">종료일</label><input type="date" value={historyEndDate} onChange={e => setHistoryEndDate(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-xs outline-none border" /></div></div><div className="flex gap-2 mt-6"><button onClick={() => {setHistoryStartDate(''); setHistoryEndDate(''); setIsDateFilterOpen(false);}} className="flex-1 py-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-500">초기화</button><button onClick={() => setIsDateFilterOpen(false)} className="flex-1 py-3 bg-blue-600 rounded-xl text-xs font-bold text-white">확인</button></div></div>)}
            {isManagerFilterOpen && (
              <div className="absolute top-12 left-0 right-0 mx-4 bg-white border shadow-2xl rounded-2xl p-5 z-40 space-y-5">
                <div className="flex justify-between items-center mb-1"><p className="text-[10px] font-bold text-gray-400 uppercase">담당자 필터</p><button onClick={() => setIsManagerFilterOpen(false)}><X size={16} className="text-gray-400" /></button></div>
                <div className="space-y-4">
                  <div><label className="text-[9px] font-bold text-blue-500 mb-1 block">지출 담당</label><div className="flex gap-1 overflow-x-auto pb-1"><button onClick={() => setManagerFilter({...managerFilter, expense: 'all'})} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${managerFilter.expense==='all'?'bg-blue-600 text-white':'bg-gray-100 text-gray-500'}`}>전체</button>{managerList.map(m => <button key={m} onClick={() => setManagerFilter({...managerFilter, expense: m})} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${managerFilter.expense===m?'bg-blue-600 text-white':'bg-gray-100 text-gray-500'}`}>{m}</button>)}</div></div>
                  <div><label className="text-[9px] font-bold text-indigo-500 mb-1 block">수입 담당</label><div className="flex gap-1 overflow-x-auto pb-1"><button onClick={() => setManagerFilter({...managerFilter, income: 'all'})} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${managerFilter.income==='all'?'bg-indigo-600 text-white':'bg-gray-100 text-gray-500'}`}>전체</button>{managerList.map(m => <button key={m} onClick={() => setManagerFilter({...managerFilter, income: m})} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${managerFilter.income===m?'bg-indigo-600 text-white':'bg-gray-100 text-gray-500'}`}>{m}</button>)}</div></div>
                  <div><label className="text-[9px] font-bold text-gray-600 mb-1 block">자산 소유자</label><div className="flex gap-1 overflow-x-auto pb-1"><button onClick={() => setManagerFilter({...managerFilter, asset: 'all'})} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${managerFilter.asset==='all'?'bg-gray-800 text-white':'bg-gray-100 text-gray-500'}`}>전체</button>{managerList.map(m => <button key={m} onClick={() => setManagerFilter({...managerFilter, asset: m})} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${managerFilter.asset===m?'bg-gray-800 text-white':'bg-gray-100 text-gray-500'}`}>{m}</button>)}<button onClick={() => { const name = window.prompt('소유자 이름 입력:'); if (name) addCustomManager(name); }} className="px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap bg-gray-100 text-gray-500">+ 추가</button></div></div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-50"><button onClick={() => {setManagerFilter({expense:'all', income:'all', asset:'all'}); setIsManagerFilterOpen(false);}} className="flex-1 py-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-500">초기화</button><button onClick={() => setIsManagerFilterOpen(false)} className="flex-1 py-3 bg-blue-600 rounded-xl text-xs font-bold text-white">적용</button></div>
              </div>
            )}
            <div className="space-y-2">
              {transactions.filter(tx => {
                const matchAsset = historyAssetFilter === 'all' || tx.accountId === historyAssetFilter;
                const matchStart = !historyStartDate || tx.date >= historyStartDate;
                const matchEnd = !historyEndDate || tx.date <= historyEndDate;
                const matchMgr = (managerFilter.expense === 'all' || (tx.type==='expense' && tx.manager === managerFilter.expense)) && (managerFilter.income === 'all' || (tx.type==='income' && tx.manager === managerFilter.income));
                const account = accounts.find(a => a.id === tx.accountId);
                const matchAssetOwner = managerFilter.asset === 'all' || (account && account.owner === managerFilter.asset);
                return matchAsset && matchStart && matchEnd && matchMgr && matchAssetOwner;
              }).map(tx => (
                <div key={tx.id} className="relative overflow-hidden rounded-2xl" onClick={() => setSwipedTxId(swipedTxId === tx.id ? null : tx.id)}>
                  <div className={`absolute inset-0 flex justify-end transition-opacity duration-300 ${swipedTxId === tx.id ? 'opacity-100' : 'opacity-0'}`}>
                    <button onClick={(e) => { e.stopPropagation(); setEditingTransaction(tx); setIsTransactionEditModalOpen(true); }} className="w-16 h-full bg-yellow-400 text-white flex items-center justify-center font-bold text-xs"><Edit size={14}/></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, userPath, 'transactions', tx.id)); }} className="w-16 h-full bg-red-500 text-white flex items-center justify-center font-bold text-xs"><Trash2 size={14}/></button>
                  </div>
                  <div className={`relative bg-white p-4 flex justify-between items-center border border-gray-50 shadow-sm transition-transform duration-300 z-10 ${swipedTxId === tx.id ? '-translate-x-32' : 'translate-x-0'}`}>
                    <div className="flex items-center gap-3"><div className={`w-1 h-8 rounded-full ${tx.type === 'expense' ? 'bg-red-400' : 'bg-blue-400'}`} /><div><p className="text-sm font-bold">{tx.category}</p><p className="text-[10px] text-gray-400 font-bold">{tx.date} {tx.manager ? `• ${tx.manager}` : ''}</p></div></div>
                    <span className={`text-sm font-bold ${tx.type === 'expense' ? 'text-red-500' : 'text-blue-600'}`}>{tx.type === 'expense' ? '-' : '+'} {formatValue(tx.amount, tx.currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <nav className="bg-white border-t flex justify-around items-center h-20 px-2 sticky bottom-0 z-30 shadow-inner">
        <SidebarItem id="dashboard" icon={LayoutDashboard} label="홈" activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarItem id="assets" icon={Wallet} label="자산" activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarItem id="plan" icon={Target} label="계획" activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarItem id="record" icon={PlusCircle} label="기록" activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarItem id="history" icon={History} label="내역" activeTab={activeTab} setActiveTab={setActiveTab} />
      </nav>
      {isExpensePlanModalOpen && (
        <PlanModal
          title="지출 계획 추가/수정"
          plans={expensePlans}
          categoryList={expenseCategoryList}
          accounts={accounts}
          userPath={userPath}
          onClose={() => setIsExpensePlanModalOpen(false)}
          color="blue"
        />
      )}
      {isIncomePlanModalOpen && (
        <PlanModal
          title="수입 계획 추가/수정"
          plans={incomePlans}
          categoryList={incomeCategoryList}
          accounts={accounts}
          userPath={userPath}
          onClose={() => setIsIncomePlanModalOpen(false)}
          color="green"
        />
      )}
      {selectedAccount && (
  <div className="absolute inset-0 bg-black/60 z-50 flex items-end" onClick={() => setSelectedAccount(null)}>
    <div className="w-full bg-white rounded-t-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">{selectedAccount.name}</h2>
        <button onClick={() => setSelectedAccount(null)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><X size={24}/></button>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <span className="text-xs font-bold text-gray-400">카테고리</span>
          <span className="text-sm font-bold">{selectedAccount.category}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <span className="text-xs font-bold text-gray-400">금융기관</span>
          <span className="text-sm font-bold">{selectedAccount.provider || '-'}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <span className="text-xs font-bold text-gray-400">계좌번호</span>
          <span className="text-sm font-bold">{selectedAccount.accountNum || '-'}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <span className="text-xs font-bold text-gray-400">소유자</span>
          <span className="text-sm font-bold">{selectedAccount.owner || '-'}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <span className="text-xs font-bold text-gray-400">잔액</span>
          <span className={`text-lg font-bold ${selectedAccount.category === '부채' ? 'text-red-500' : 'text-blue-600'}`}>{selectedAccount.category === '부채' ? formatValue(-Math.abs(selectedAccount.balance), selectedAccount.currency) : formatValue(selectedAccount.balance, selectedAccount.currency)}</span>
        </div>
        {selectedAccount.memo && (
          <div className="flex justify-between items-start py-2 border-b border-gray-50">
            <span className="text-xs font-bold text-gray-400">메모</span>
            <span className="text-sm font-bold text-right max-w-[60%]">{selectedAccount.memo}</span>
          </div>
        )}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={() => { setSelectedAccount(null); setEditingAccount(selectedAccount); setIsAccountModalOpen(true); }} className="flex-1 py-3 bg-yellow-400 text-white rounded-2xl font-bold">수정</button>
        <button onClick={() => { deleteDoc(doc(db, userPath, 'accounts', selectedAccount.id)); setSelectedAccount(null); }} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold">삭제</button>
      </div>
    </div>
  </div>
)}
      {isAccountModalOpen && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end"><div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl"><div className="flex justify-between items-center mb-6 font-bold"><h2 className="text-lg">자산 추가/수정</h2><button onClick={() => setIsAccountModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><X size={24}/></button></div><AccountModalInner onSave={handleSaveAccount} onCancel={() => setIsAccountModalOpen(false)} initialData={editingAccount} managerList={managerList} addCustomManager={addCustomManager} /></div></div>
      )}
      {isTransactionEditModalOpen && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end"><div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl"><div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold">내역 수정</h2><button onClick={() => setIsTransactionEditModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><X size={24}/></button></div><TransactionForm onSubmit={handleAddTransaction} accounts={accounts} expenseCategoryList={expenseCategoryList} incomeCategoryList={incomeCategoryList} initialData={editingTransaction} managerList={managerList} addCustomManager={addCustomManager} title="활동 기록 수정" buttonLabel="수정 완료" /></div></div>
      )}
    </div>
  );
};

const AccountModalInner = ({ onSave, onCancel, initialData, managerList, addCustomManager }) => {
  const [data, setData] = useState(initialData || { name: '', type: '계좌', category: '현금성', balance: 0, currency: 'KRW', provider: '', accountNum: '', owner: '신랑', customOwner: '' });
  const [isCustomCategory, setIsCustomCategory] = useState(!ASSET_CATEGORIES.includes(data.category) && data.category !== '');
  const [isCustomOwner, setIsCustomOwner] = useState(false);

  return (
    <div className="space-y-6 text-left pb-4">
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 ml-1">자산 명칭</label>
          <input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="예: 생활비 통장" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border focus:border-blue-500 transition-all shadow-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 ml-1 flex items-center gap-1"><Building2 size={10}/> 금융기관/은행</label>
            {data.provider === '기타 (직접 입력)' ? (
              <div className="relative">
                <input autoFocus type="text" value={data.customProvider || ''} onChange={e => setData({...data, customProvider: e.target.value})} placeholder="직접 입력하세요" className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-xs outline-none border-2 border-blue-200"/>
                <button onClick={() => setData({...data, provider: '선택하세요', customProvider: ''})} className="absolute right-2 top-4 text-blue-400"><X size={14}/></button>
              </div>
            ) : (
              <select value={data.provider} onChange={e => setData({...data, provider: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs outline-none border shadow-sm focus:border-blue-500 cursor-pointer appearance-none">
                {ALL_FINANCIAL_INSTITUTIONS.map(b => (<option key={b} value={b} disabled={b.startsWith('---')}>{b}</option>))}
              </select>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 ml-1 flex items-center gap-1"><CreditCard size={10}/> 계좌/카드번호</label>
            <input type="text" value={data.accountNum} onChange={e => setData({...data, accountNum: e.target.value})} placeholder="번호 입력" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none border shadow-sm focus:border-blue-500"/>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 ml-1">카테고리</label>
            {isCustomCategory ? (
              <div className="relative">
                <input type="text" value={data.category} onChange={e => setData({...data, category: e.target.value})} placeholder="입력" className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-xs outline-none border-2 border-blue-200"/>
                <button onClick={() => { setIsCustomCategory(false); setData({...data, category: '현금성'}); }} className="absolute right-2 top-4 text-blue-400"><X size={14}/></button>
              </div>
            ) : (
              <select value={data.category} onChange={e => { if(e.target.value === '기타 (직접 입력)') { setIsCustomCategory(true); setData({...data, category: ''}); } else { const newCat = e.target.value; setData({...data, category: newCat, balance: newCat === '부채' && data.balance > 0 ? -Math.abs(data.balance) : data.balance}); }}} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs border shadow-sm focus:border-blue-500 appearance-none cursor-pointer">
                {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 ml-1">자산 소유자</label>
            {isCustomOwner ? (
              <div className="relative">
                <input autoFocus type="text" value={data.customOwner || ''} onChange={e => setData({...data, customOwner: e.target.value, owner: e.target.value})} placeholder="직접 입력하세요" className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-xs outline-none border-2 border-blue-200"/>
                <button onClick={() => { setIsCustomOwner(false); setData({...data, owner: '신랑', customOwner: ''}); }} className="absolute right-2 top-4 text-blue-400"><X size={14}/></button>
              </div>
            ) : (
              <select value={data.owner || '신랑'} onChange={e => { if(e.target.value === '기타 (직접 입력)') { setIsCustomOwner(true); setData({...data, owner: '', customOwner: ''}); } else { setData({...data, owner: e.target.value}); if(addCustomManager) addCustomManager(e.target.value); } }} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs border shadow-sm focus:border-blue-500 appearance-none cursor-pointer">
                <option value="신랑">신랑</option>
                <option value="신부">신부</option>
                {managerList.filter(m => m !== '신랑' && m !== '신부').map(m => <option key={m} value={m}>{m}</option>)}
                <option value="기타 (직접 입력)">기타 (직접 입력)</option>
              </select>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 ml-1">금액/평가액</label>
          <div className="flex items-center bg-gray-50 rounded-2xl border p-1 shadow-sm focus-within:border-blue-500 transition-all">
            <select value={data.currency} onChange={e => setData({...data, currency: e.target.value})} className="bg-transparent font-bold text-xs outline-none border-r pr-1 border-gray-200 cursor-pointer ml-2">
              {CURRENCY_UNITS.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
            </select>
            <input type="text" value={data.balance === 0 ? '' : data.balance.toLocaleString()} onChange={e => setData({...data, balance: parseInt(e.target.value.replace(/[^0-9-]/g, '')) || 0})} className="flex-1 bg-transparent p-3 text-right font-bold text-blue-600 outline-none text-xs" placeholder="0"/>
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <button onClick={onCancel} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-colors">취소</button>
        <button onClick={() => onSave(data)} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 text-center">저장하기</button>
      </div>
    </div>
  );
};

const TransactionForm = ({ onSubmit, accounts, expenseCategoryList, incomeCategoryList, initialData, managerList, addCustomManager, title, buttonLabel }) => {
  const [tx, setTx] = useState(initialData || { type: 'expense', amount: '', category: '', accountId: '', date: new Date().toISOString().split('T')[0], currency: 'KRW', manager: '신랑', customManager: '' });
  const [isCustomMgr, setIsCustomMgr] = useState(false);
  useEffect(() => { if (!initialData) { const list = tx.type === 'expense' ? expenseCategoryList : incomeCategoryList; setTx(p => ({...p, category: list[0], accountId: accounts[0]?.id || ''})); } }, [tx.type, expenseCategoryList, incomeCategoryList, accounts, initialData]);
  return (
    <div className="space-y-6 text-left pb-4">
      <h2 className="text-lg font-bold px-2 flex items-center gap-2"><PlusCircle size={20} className="text-blue-600" /> {title}</h2>
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 space-y-6">
        <div className="flex gap-2">
          <button onClick={() => setTx({...tx, type: 'expense'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tx.type === 'expense' ? 'bg-white text-red-500 shadow-sm border' : 'text-gray-500'}`}>지출</button>
          <button onClick={() => setTx({...tx, type: 'income'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tx.type === 'income' ? 'bg-white text-blue-500 shadow-sm border' : 'text-gray-500'}`}>수입</button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2 items-center py-3 px-3 bg-gray-50 rounded-2xl border">
            <select value={tx.currency} onChange={e => setTx({...tx, currency: e.target.value})} className="bg-white p-1 rounded font-bold text-xs outline-none cursor-pointer border" style={{flexShrink: 0}}>
              {CURRENCY_UNITS.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
            </select>
            <input type="text" placeholder="0" value={tx.amount === '' ? '' : parseInt(tx.amount).toLocaleString()} onChange={e => setTx({...tx, amount: e.target.value.replace(/[^0-9-]/g, '')})} className="text-2xl font-bold outline-none bg-transparent text-right" style={{width: 0, flex: 1, minWidth: 0}} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 text-left font-bold"><label className="text-[10px] text-gray-400 uppercase">카테고리</label><select value={tx.category} onChange={e => setTx({...tx, category: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none border cursor-pointer">{tx.type === 'expense' ? expenseCategoryList.map(cat => <option key={cat} value={cat}>{cat}</option>) : incomeCategoryList.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
            <div className="space-y-1 text-left font-bold">
              <label className="text-[10px] text-gray-400 uppercase">담당</label>
              <select value={isCustomMgr ? "기타 (직접 입력)" : tx.manager} onChange={e => { if(e.target.value === '기타 (직접 입력)') setIsCustomMgr(true); else { setIsCustomMgr(false); setTx({...tx, manager: e.target.value}); } }} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none border cursor-pointer">
                {managerList.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="기타 (직접 입력)">기타 (직접 입력)</option>
              </select>
              {isCustomMgr && <input autoFocus type="text" value={tx.customManager} onChange={e => { setTx({...tx, customManager: e.target.value}); if(addCustomManager) addCustomManager(e.target.value); }} placeholder="담당자 입력" className="mt-2 w-full p-3 bg-blue-50 rounded-xl font-bold text-sm outline-none border border-blue-200" />}
            </div>
          </div>
          <div className="space-y-1 text-left font-bold"><label className="text-[10px] text-gray-400 uppercase">자산 선택</label><select value={tx.accountId} onChange={e => setTx({...tx, accountId: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none border cursor-pointer"><option value="">선택하세요</option>{accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatValue(acc.balance, acc.currency)})</option>)}</select></div>
          <input type="date" value={tx.date} onChange={e => setTx({...tx, date: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none border cursor-pointer" />
        </div>
        <div className="space-y-1 text-left font-bold"><label className="text-[10px] text-gray-400 uppercase">메모</label><textarea value={tx.memo || ''} onChange={e => setTx({...tx, memo: e.target.value})} placeholder="메모를 입력하세요" rows={2} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none border resize-none" /></div>
        <button onClick={() => onSubmit({...tx, manager: isCustomMgr ? tx.customManager : tx.manager})} className={`w-full py-4 rounded-2xl text-white font-bold shadow-xl active:scale-95 transition-all ${tx.type==='expense'?'bg-blue-600':'bg-indigo-600'}`}>{buttonLabel}</button>
      </div>
    </div>
  );
};

const SidebarItem = ({ id, icon: Icon, label, activeTab, setActiveTab }) => {
  const active = activeTab === id;
  return (
    <button onClick={() => setActiveTab(id)} className={`flex flex-col items-center justify-center p-3 w-full transition-colors rounded-none ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}>
      <Icon size={24} />
      <span className="text-[10px] mt-1 font-bold">{label}</span>
    </button>
  );
};

export default App;