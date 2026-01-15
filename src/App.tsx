import { useEffect, useState } from 'react';
import { UserInputPage } from './components/UserInputPage';
import { SuccessPage } from './components/SuccessPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ParkingRecord, ViewType } from './types';
import { addParkingRecord, subscribeToParkingRecords, deleteParkingRecord } from './utils/firestore';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('input');
  const [registrationData, setRegistrationData] = useState<{
    plateNumber: string;
    duration: string;
    location: string;
  } | null>(null);
  const [lastAddedRecordId, setLastAddedRecordId] = useState<string | null>(null);

  // 주차 기록 데이터
  const [parkingRecords, setParkingRecords] = useState<ParkingRecord[]>([]);

  // Firestore 실시간 구독
  useEffect(() => {
    const unsubscribe = subscribeToParkingRecords((records) => {
      setParkingRecords(records);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (plateNumber: string, duration: string, location: string) => {
    try {
      // Firestore에 새 기록 추가
      const id = await addParkingRecord({
        timestamp: new Date(),
        plateNumber,
        location,
        requestedTime: duration,
      });

      setLastAddedRecordId(id);
      setRegistrationData({ 
        plateNumber, 
        duration, 
        location,
      });
      setCurrentView('success');
    } catch (error) {
      console.error('주차 등록 실패:', error);
      alert('주차 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleClose = () => {
    setCurrentView('input');
    setRegistrationData(null);
  };

  const handleViewAdmin = () => {
    setCurrentView('admin');
  };

  const handleBackToInput = () => {
    setCurrentView('input');
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteParkingRecord(id);
    } catch (error) {
      console.error('주차 기록 삭제 실패:', error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
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