import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Trash2, RotateCcw } from 'lucide-react';
import { ParkingRecord } from '../App';

interface AdminDashboardProps {
  onBack: () => void;
  records: ParkingRecord[];
  onDeleteRecord: (id: string) => void;
  lastAddedRecordId?: string;
}

export function AdminDashboard({ onBack, records, onDeleteRecord, lastAddedRecordId }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // 수동 새로고침 핸들러
  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentTime(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 자동 새로고침 (30초마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // 30초

    return () => clearInterval(timer);
  }, []);

  // 1초마다 현재 시간 업데이트 (경과시간 표시용)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 신규 등록 행 강조 (3초간)
  useEffect(() => {
    if (lastAddedRecordId) {
      setHighlightId(lastAddedRecordId);
      const t = setTimeout(() => setHighlightId(null), 3000);
      return () => clearTimeout(t);
    }
  }, [lastAddedRecordId]);

  // 경과시간 계산
  const getElapsedTime = (timestamp: Date) => {
    const diff = Math.floor((currentTime.getTime() - new Date(timestamp).getTime()) / 1000 / 60); // 분
    
    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분 전`;
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours < 24) {
      return minutes > 0 ? `${hours}시간 ${minutes}분 전` : `${hours}시간 전`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  // 오늘 날짜 확인
  const isToday = (date: Date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  // 검색 및 날짜 필터링
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = showTodayOnly ? isToday(record.timestamp) : true;
    return matchesSearch && matchesDate;
  });

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-300 p-4 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">주차 등록 현황</h1>
                <p className="text-sm text-gray-600">공공 도서관 관리자</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">현재 시간</div>
              <div className="text-base font-bold text-gray-800">
                {formatDate(currentTime)} {formatTime(currentTime)}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="차량번호 검색..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded focus:border-[#1e4a8a] focus:ring-4 focus:ring-blue-100 transition-all duration-200"
            />
          </div>

          {/* Today/All Filter and Refresh */}
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setShowTodayOnly(true)}
                className={`px-4 py-2 text-sm font-bold rounded border-2 cursor-pointer ${
                  showTodayOnly
                    ? 'bg-[#1e4a8a] text-white border-[#1e4a8a]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                오늘 등록
              </button>
              <button
                onClick={() => setShowTodayOnly(false)}
                className={`px-4 py-2 text-sm font-bold rounded border-2 cursor-pointer ${
                  !showTodayOnly
                    ? 'bg-[#1e4a8a] text-white border-[#1e4a8a]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                전체 보기
              </button>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              title="새로고침"
            >
              <RotateCcw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="bg-white border border-gray-300 p-4">
            <div className="text-xs text-gray-500 mb-1">총 등록 차량</div>
            <div className="text-2xl font-bold text-[#1e4a8a]">{records.length}대</div>
          </div>
          <div className="bg-white border border-gray-300 p-4">
            <div className="text-xs text-gray-500 mb-1">어린이 도서관</div>
            <div className="text-2xl font-bold text-gray-800">
              {records.filter((r) => r.location === '어린이').length}대
            </div>
          </div>
          <div className="bg-white border border-gray-300 p-4">
            <div className="text-xs text-gray-500 mb-1">종합 도서관</div>
            <div className="text-2xl font-bold text-gray-800">
              {records.filter((r) => r.location === '종합').length}대
            </div>
          </div>
          <div className="bg-white border border-gray-300 p-4">
            <div className="text-xs text-gray-500 mb-1">열람실</div>
            <div className="text-2xl font-bold text-gray-800">
              {records.filter((r) => r.location === '열람실').length}대
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-300 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  등록 시간
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  경과 시간
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  차량번호
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  이용 장소
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  주차 시간
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? '검색 결과가 없습니다' : '등록된 차량이 없습니다'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className={`border-b border-gray-200 transition-colors duration-150 cursor-default ${
                        index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'
                      } ${record.id === highlightId ? 'row-flash' : ''}`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(record.timestamp)} {formatTime(record.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getElapsedTime(record.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold px-2 py-1 border-l-2 text-gray-800 bg-yellow-100 border-yellow-500">
                            {record.plateNumber}
                          </span>
                          {record.id === highlightId && (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700 fade-out">
                              신규
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-700">
                        {record.location}
                      </td>
                      <td className="px-4 py-3 text-base font-bold text-gray-800">
                        {record.requestedTime}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            if (window.confirm(`${record.plateNumber} 차량의 등록을 삭제하시겠습니까?`)) {
                              onDeleteRecord(record.id);
                            }
                          }}
                          className="p-2 border border-red-300 rounded hover:bg-red-50 text-red-600 cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}