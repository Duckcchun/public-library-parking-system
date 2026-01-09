import { useEffect, useState } from 'react';
import { UserInputPage } from './components/UserInputPage';
import { SuccessPage } from './components/SuccessPage';
import { AdminDashboard } from './components/AdminDashboard';

export interface ParkingRecord {
  id: string;
  timestamp: Date;
  plateNumber: string;
  location: string;
  requestedTime: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'input' | 'success' | 'admin'>('input');
  const [registrationData, setRegistrationData] = useState<{
    plateNumber: string;
    duration: string;
    location: string;
  } | null>(null);
  const [lastAddedRecordId, setLastAddedRecordId] = useState<string | null>(null);

  // 주차 기록 데이터 (실제로는 서버/DB에서 관리)
  const [parkingRecords, setParkingRecords] = useState<ParkingRecord[]>([]);

  // 로컬스토리지 로드 및 저장 (삭제/추가가 새로고침 후에도 유지)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('parkingRecords');
      if (stored) {
        const parsed: Array<Omit<ParkingRecord, 'timestamp'> & { timestamp: string }> = JSON.parse(stored);
        setParkingRecords(
          parsed.map((r) => ({ ...r, timestamp: new Date(r.timestamp) }))
        );
      } else {
        // 최초 실행 시 빈 배열로 시작
        localStorage.setItem('parkingRecords', JSON.stringify([]));
      }
    } catch (e) {
      // 저장/로드 실패 시 콘솔에만 기록 (UI 영향 없음)
      console.warn('Failed to load parkingRecords from localStorage', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'parkingRecords',
        JSON.stringify(
          parkingRecords.map((r) => ({ ...r, timestamp: r.timestamp.toISOString() }))
        )
      );
    } catch (e) {
      console.warn('Failed to save parkingRecords to localStorage', e);
    }
  }, [parkingRecords]);

  // 다른 탭/창에서 localStorage가 변경되면 실시간으로 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'parkingRecords' && e.newValue) {
        try {
          const parsed: Array<Omit<ParkingRecord, 'timestamp'> & { timestamp: string }> = JSON.parse(e.newValue);
          setParkingRecords(parsed.map((r) => ({ ...r, timestamp: new Date(r.timestamp) })));
        } catch (err) {
          console.warn('Failed to sync parkingRecords from storage event', err);
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleSubmit = (plateNumber: string, duration: string, location: string) => {
    // 중복 등록 확인
    const existingRecords = parkingRecords.filter(r => r.plateNumber === plateNumber);
    
    // 새 기록 추가
    const newRecord: ParkingRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      plateNumber,
      location,
      requestedTime: duration,
    };

    setParkingRecords((prev) => [newRecord, ...prev]);
    setLastAddedRecordId(newRecord.id);
    setRegistrationData({ 
      plateNumber, 
      duration, 
      location,
    });
    setCurrentView('success');
  };

  const handleClose = () => {
    // 입력 페이지로 돌아갈 때 localStorage에서 최신 데이터 로드
    try {
      const stored = localStorage.getItem('parkingRecords');
      if (stored) {
        const parsed: Array<Omit<ParkingRecord, 'timestamp'> & { timestamp: string }> = JSON.parse(stored);
        setParkingRecords(
          parsed.map((r) => ({ ...r, timestamp: new Date(r.timestamp) }))
        );
      }
    } catch (e) {
      console.warn('Failed to refresh parkingRecords from localStorage', e);
    }
    setCurrentView('input');
    setRegistrationData(null);
  };

  const handleViewAdmin = () => {
    // 관리자 페이지 진입 시 최신 localStorage 데이터 로드
    try {
      const stored = localStorage.getItem('parkingRecords');
      if (stored) {
        const parsed: Array<Omit<ParkingRecord, 'timestamp'> & { timestamp: string }> = JSON.parse(stored);
        setParkingRecords(
          parsed.map((r) => ({ ...r, timestamp: new Date(r.timestamp) }))
        );
      }
    } catch (e) {
      console.warn('Failed to refresh parkingRecords from localStorage', e);
    }
    setCurrentView('admin');
  };

  const handleBackToInput = () => {
    setCurrentView('input');
  };

  const handleDeleteRecord = (id: string) => {
    setParkingRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'input' && (
        <UserInputPage 
          onSubmit={handleSubmit} 
          onAdminAccess={handleViewAdmin}
          existingRecords={parkingRecords}
        />
      )}
      {currentView === 'success' && registrationData && (
        <SuccessPage
          plateNumber={registrationData.plateNumber}
          duration={registrationData.duration}
          location={registrationData.location}
          onClose={handleClose}
        />
      )}
      {currentView === 'admin' && (
        <AdminDashboard 
          onBack={handleBackToInput}
          records={parkingRecords}
          onDeleteRecord={handleDeleteRecord}
          lastAddedRecordId={lastAddedRecordId ?? undefined}
        />
      )}
    </div>
  );
}