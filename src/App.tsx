import { useEffect, useState, useCallback } from 'react';
import { UserInputPage } from './components/UserInputPage';
import { SuccessPage } from './components/SuccessPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ParkingRecord, ViewType } from './types';
import { STORAGE_KEY } from './constants';
import { loadParkingRecordsFromStorage, saveParkingRecordsToStorage } from './utils';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('input');
  const [registrationData, setRegistrationData] = useState<{
    plateNumber: string;
    duration: string;
    location: string;
  } | null>(null);
  const [lastAddedRecordId, setLastAddedRecordId] = useState<string | null>(null);

  // 주차 기록 데이터 (실제로는 서버/DB에서 관리)
  const [parkingRecords, setParkingRecords] = useState<ParkingRecord[]>([]);

  // 로컬스토리지 로드 및 저장 (삭제/추가가 새로고침 후에도 유지)
  // 초기 로드
  useEffect(() => {
    const loaded = loadParkingRecordsFromStorage();
    if (loaded) {
      setParkingRecords(loaded);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }, []);

  // 변경사항 저장
  useEffect(() => {
    saveParkingRecordsToStorage(parkingRecords);
  }, [parkingRecords]);

  // 다른 탭/창에서 localStorage가 변경되면 실시간으로 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
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

  // BroadcastChannel로 동일 탭 내 실시간 동기화 강화
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel('parking-records-sync');

    channel.onmessage = (event) => {
      if (event.data.type === 'update') {
        const loaded = loadParkingRecordsFromStorage();
        if (loaded) {
          setParkingRecords(loaded);
        }
      }
    };

    return () => channel.close();
  }, []);

  // 데이터 변경 시 BroadcastChannel로 알림
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    if (parkingRecords.length === 0) return;

    const channel = new BroadcastChannel('parking-records-sync');
    channel.postMessage({ type: 'update' });
    channel.close();
  }, [parkingRecords]);

  const handleSubmit = (plateNumber: string, duration: string, location: string) => {
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
    const loaded = loadParkingRecordsFromStorage();
    if (loaded) {
      setParkingRecords(loaded);
    }
    setCurrentView('input');
    setRegistrationData(null);
  };

  const handleViewAdmin = () => {
    // 관리자 페이지 진입 시 최신 localStorage 데이터 로드
    const loaded = loadParkingRecordsFromStorage();
    if (loaded) {
      setParkingRecords(loaded);
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