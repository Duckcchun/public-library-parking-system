import { ParkingRecord } from '../types';
import { STORAGE_KEY } from '../constants';

// GPS 거리 계산 (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 거리 (미터)
};

// 날짜 포맷팅 (YYYY-MM-DD)
export const formatDate = (date: Date): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
};

// 시간 포맷팅 (HH:MM)
export const formatTime = (date: Date): string => {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
    2,
    '0'
  )}`;
};

// 경과 시간 계산
export const getElapsedTime = (timestamp: Date, currentTime: Date): string => {
  const diff = Math.floor(
    (currentTime.getTime() - new Date(timestamp).getTime()) / 1000 / 60
  ); // 분

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
export const isToday = (date: Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// localStorage에서 주차 기록 로드
export const loadParkingRecordsFromStorage = (): ParkingRecord[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed: Array<Omit<ParkingRecord, 'timestamp'> & { timestamp: string }> =
      JSON.parse(stored);
    return parsed.map((r) => ({ ...r, timestamp: new Date(r.timestamp) }));
  } catch (e) {
    console.warn('Failed to load parkingRecords from localStorage', e);
    return null;
  }
};

// localStorage에 주차 기록 저장
export const saveParkingRecordsToStorage = (records: ParkingRecord[]): void => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records.map((r) => ({ ...r, timestamp: r.timestamp.toISOString() })))
    );
  } catch (e) {
    console.warn('Failed to save parkingRecords to localStorage', e);
  }
};

// 플랫폼/브라우저 간단 감지 (권한 가이드용)
export type Platform = 'ios' | 'android' | 'desktop';

export const getPlatform = (): Platform => {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || navigator.vendor;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
};
