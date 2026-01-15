import { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { ParkingRecord, LocationStatus } from '../types';
import {
  LIBRARY_COORDS,
  ALLOWED_RADIUS_METERS,
  ADMIN_PASSWORD,
  ADMIN_LONG_PRESS_MS,
  ADMIN_SHIFT_TRIGGER_COUNT,
  DURATIONS,
  LOCATIONS
} from '../constants';
import { calculateDistance, getPlatform } from '../utils';

interface UserInputPageProps {
  onSubmit: (plateNumber: string, duration: string, location: string) => void;
  onAdminAccess: () => void;
  existingRecords: ParkingRecord[];
}

export function UserInputPage({ onSubmit, onAdminAccess, existingRecords }: UserInputPageProps) {
  const [plateNumber, setPlateNumber] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  
  // GPS 위치 확인 상태
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('checking');
  const [distanceFromLibrary, setDistanceFromLibrary] = useState<number | null>(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  
  // 차량번호 입력 필드 ref (자동 포커스용)
  const plateInputRef = useRef<HTMLInputElement>(null);

  // 중복 차량번호 확인
  const duplicateCount = existingRecords?.filter(r => r.plateNumber === plateNumber).length || 0;

  // 위치 확인 로직 함수화 및 페이지 로드시 자동 실행
  const checkLocation = () => {
    setIsCheckingLocation(true);
    setLocationStatus('checking');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            LIBRARY_COORDS.latitude,
            LIBRARY_COORDS.longitude
          );
          setDistanceFromLibrary(Math.round(distance));
          if (distance <= ALLOWED_RADIUS_METERS) {
            setLocationStatus('allowed');
          } else {
            setLocationStatus('out-of-range');
          }
          setIsCheckingLocation(false);
        },
        (error) => {
          console.error('위치 권한 거부:', error);
          setLocationStatus('denied');
          setIsCheckingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationStatus('denied');
      setIsCheckingLocation(false);
    }
  };

  useEffect(() => {
    plateInputRef.current?.focus();
    checkLocation();
  }, []);

  useEffect(() => {
    let shiftCount = 0;
    let resetTimer: number | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        shiftCount++;
        if (resetTimer) window.clearTimeout(resetTimer);

        if (shiftCount >= ADMIN_SHIFT_TRIGGER_COUNT) {
          setShowAdminModal(true);
          shiftCount = 0;
          return;
        }

        resetTimer = window.setTimeout(() => {
          shiftCount = 0;
        }, 1500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (resetTimer) window.clearTimeout(resetTimer);
    };
  }, []);

  const adminPressTimerRef = useRef<number | null>(null);
  const startAdminPress = () => {
    if (adminPressTimerRef.current) window.clearTimeout(adminPressTimerRef.current);
    adminPressTimerRef.current = window.setTimeout(() => {
      setShowAdminModal(true);
    }, ADMIN_LONG_PRESS_MS);
  };
  const cancelAdminPress = () => {
    if (adminPressTimerRef.current) {
      window.clearTimeout(adminPressTimerRef.current);
      adminPressTimerRef.current = null;
    }
  };

  // 차량번호 입력 핸들러 (4자리 숫자만)
  const handlePlateNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // 숫자만 허용
    if (value.length <= 4) {
      setPlateNumber(value);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setShowAdminModal(false);
      setAdminPassword('');
      setPasswordError(false);
      onAdminAccess();
    } else {
      setPasswordError(true);
    }
  };

  const handleCloseModal = () => {
    setShowAdminModal(false);
    setAdminPassword('');
    setPasswordError(false);
  };

  const handleSubmit = () => {
    if (plateNumber && selectedDuration && selectedLocation) {
      onSubmit(plateNumber, selectedDuration, selectedLocation);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="bg-[#1e4a8a] text-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#1e4a8a]" 
              onMouseDown={startAdminPress}
              onMouseUp={cancelAdminPress}
              onMouseLeave={cancelAdminPress}
              onTouchStart={startAdminPress}
              onTouchEnd={cancelAdminPress}
              onTouchCancel={cancelAdminPress}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">도서관 이용확인증</h1>
            <p className="text-sm text-blue-100">주차 등록</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6 bg-white">
        {/* GPS Location Status */}
        {locationStatus === 'checking' && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-800 font-semibold">
              📍 위치 확인 중...
            </p>
          </div>
        )}
        
        {locationStatus === 'denied' && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-800 font-semibold">
              ⚠️ 위치 권한이 필요합니다
            </p>
            <p className="text-xs text-red-700 mt-1">
              서농도서관 내에서만 등록이 가능합니다. 브라우저 설정에서 위치 권한을 허용해주세요.
            </p>
          </div>
        )}
        
        {locationStatus === 'out-of-range' && (
          <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4">
            <p className="text-sm text-orange-800 font-semibold">
              📍 서농도서관 외부 위치
            </p>
            <p className="text-xs text-orange-700 mt-1">
              현재 위치가 도서관에서 {distanceFromLibrary}m 떨어져 있습니다. 도서관 내에서 등록해주세요.
            </p>
          </div>
        )}

        {/* 위치 상태 및 재시도 안내 */}
        {locationStatus !== 'allowed' && (
           <div className="mb-4" role="status" aria-live="polite" aria-atomic="true">
             {locationStatus === 'checking' && (
               <p className="text-sm text-gray-600 text-center">위치 확인 중입니다...</p>
             )}
             {locationStatus === 'denied' && (
               <div className="bg-red-50 border-l-4 border-red-500 p-3">
                 <p className="text-sm text-red-700">
                   위치 권한이 거부되어 등록할 수 없습니다. 브라우저 설정에서 위치 권한을 허용한 후 다시 시도하세요.
                 </p>
               </div>
             )}
             {locationStatus === 'out-of-range' && (
               <div className="bg-amber-50 border-l-4 border-amber-500 p-3">
                 <p className="text-sm text-amber-800">
                   현재 위치가 도서관에서 {distanceFromLibrary}m 떨어져 있습니다. 도서관 내에서 다시 시도해주세요.
                 </p>
               </div>
             )}
             <div className="flex justify-center mt-2 gap-2">
               <button
                 type="button"
                 onClick={checkLocation}
                 disabled={isCheckingLocation}
                 className={`px-3 py-2 text-sm font-bold rounded border-2 border-gray-300 hover:bg-gray-50 cursor-pointer flex items-center gap-2 ${
                   isCheckingLocation ? 'opacity-50 cursor-not-allowed' : ''
                 }`}
                 aria-label="위치 다시 확인"
               >
                 {isCheckingLocation && (
                   <span className="inline-block w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></span>
                 )}
                 위치 다시 확인
               </button>
               {locationStatus === 'denied' && (
                 <button
                   type="button"
                   onClick={() => setShowPermissionHelp(true)}
                   className="px-3 py-2 text-sm font-bold rounded border-2 border-gray-300 hover:bg-gray-50 cursor-pointer"
                   aria-label="권한 설정 가이드"                 >                  권한 설정 가이드
                </button>
              )}
            </div>
          </div>
        )}

        {/* Instruction */}
        <div className="mb-6">
          <p className="text-base text-gray-700 text-center font-semibold">
            ※ 반대편 1층 주차안내 데스크 방문하여
            <br />
            주차정산 후 출차 바랍니다
          </p>
        </div>

        {/* Section: License Plate Input */}
        <div className="mb-6">
          <label className="block text-base font-bold text-gray-800 mb-2">
            차량번호 뒷 4자리
          </label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={plateNumber}
            onChange={handlePlateNumberChange}
            placeholder="1234"
            maxLength={4}
            className="w-full px-4 py-4 text-2xl font-bold text-center border-2 border-gray-300 rounded focus:border-[#1e4a8a] focus:outline-none"
            ref={plateInputRef}
          />
          {duplicateCount > 0 && plateNumber && (
            <div className="mt-2 bg-blue-50 border-l-4 border-blue-500 p-3">
              <p className="text-sm text-blue-800">
                현재 이용권이 등록된 상태입니다.<br />
                추가로 등록됩니다.
              </p>
            </div>
          )}
        </div>

        {/* Section: Location Selection */}
        <div className="mb-6">
          <label className="block text-base font-bold text-gray-800 mb-2">
            이용 장소
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LOCATIONS.map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`py-3 text-base font-bold rounded border-2 cursor-pointer transition-all duration-200 ${
                  selectedLocation === location
                    ? 'bg-[#1e4a8a] text-white border-[#1e4a8a] shadow-md scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#1e4a8a] hover:bg-blue-50 active:scale-95'
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Time Selection */}
        <div className="mb-5">
          <label className="block text-base font-bold text-gray-800 mb-2">
            시간
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DURATIONS.map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`py-3 text-base font-bold rounded border-2 cursor-pointer transition-all duration-200 ${
                  selectedDuration === duration
                    ? 'bg-[#1e4a8a] text-white border-[#1e4a8a] shadow-md scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#1e4a8a] hover:bg-blue-50 active:scale-95'
                }`}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-3">
          <p className="text-sm text-gray-800">
            <span className="font-bold">※ 1일 최대 3시간 (합산불가)</span>
          </p>
        </div>
      </main>

      <footer className="px-5 py-4 bg-white border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={!plateNumber || !selectedDuration || !selectedLocation}
          className={`w-full py-4 text-lg font-bold rounded transition-all duration-200 ${
            plateNumber && selectedDuration && selectedLocation
              ? 'bg-[#1e4a8a] text-white hover:bg-[#1e3a6a] hover:shadow-lg cursor-pointer active:scale-98'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          등록하기
        </button>
      </footer>

      {/* Admin Password Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-5">
          <div className="bg-white p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">관리자 인증</h2>
            <p className="text-sm text-gray-600 mb-4">비밀번호를 입력하세요</p>
            
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => {
                setAdminPassword(e.target.value);
                setPasswordError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdminLogin();
                }
              }}
              placeholder="비밀번호"
              className={`w-full px-3 py-2 text-base border-2 rounded transition-all duration-200 mb-1 ${
                passwordError
                  ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-gray-300 focus:border-[#1e4a8a] focus:ring-4 focus:ring-blue-100'
              }`}
              autoFocus
            />
            
            {passwordError && (
              <p className="text-red-600 text-sm mb-3">비밀번호가 올바르지 않습니다</p>
            )}
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2 text-gray-700 border-2 border-gray-300 rounded hover:bg-gray-50 font-bold cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleAdminLogin}
                className="flex-1 py-2 bg-[#1e4a8a] text-white rounded hover:bg-[#1e3a6a] font-bold cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Help Modal */}
      {showPermissionHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-5">
          <div className="bg-white p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-2">위치 권한 설정 가이드</h2>
            {(() => {
              const platform = getPlatform();
              if (platform === 'ios') {
                return (
                  <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                    <li>설정 앱 → 개인정보 보호 및 보안 → 위치 서비스</li>
                    <li>Safari 웹사이트 또는 사용하는 브라우저 선택</li>
                    <li>허용: "앱을 사용하는 동안" 또는 "다음에 확인"</li>
                    <li>브라우저 재실행 후 등록 다시 시도</li>
                  </ol>
                );
              }
              if (platform === 'android') {
                return (
                  <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                    <li>설정 → 앱 → Chrome(또는 사용하는 브라우저)</li>
                    <li>권한 → 위치 → 허용</li>
                    <li>브라우저에서 ⋮ 메뉴 → 설정 → 사이트 설정 → 위치 허용 확인</li>
                    <li>브라우저 재실행 후 등록 다시 시도</li>
                  </ol>
                );
              }
              return (
                <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                  <li>주소창 왼쪽 자물쇠 아이콘 클릭</li>
                  <li>사이트 설정 또는 권한 관리 선택</li>
                  <li>위치를 "허용"으로 변경</li>
                  <li>페이지 새로고침 후 다시 시도</li>
                </ol>
              );
            })()}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowPermissionHelp(false)}
                className="flex-1 py-2 text-gray-700 border-2 border-gray-300 rounded hover:bg-gray-50 font-bold cursor-pointer"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setShowPermissionHelp(false);
                  checkLocation();
                }}
                className="flex-1 py-2 bg-[#1e4a8a] text-white rounded hover:bg-[#1e3a6a] font-bold cursor-pointer"
              >
                다시 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}