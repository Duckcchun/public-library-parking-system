import { Coordinates } from '../types';

// 도서관 위치 정보
export const LIBRARY_COORDS: Coordinates = {
  latitude: 37.237279683072,
  longitude: 127.06868865060746
};

export const ALLOWED_RADIUS_METERS = 500;

// 관리자 설정
export const ADMIN_PASSWORD = 'admin123';
export const ADMIN_SHIFT_TRIGGER_COUNT = 5;

// 시간 옵션
export const DURATIONS = ['30분', '1시간', '1시간 30분', '2시간', '2시간 30분', '3시간'] as const;

// 장소 옵션
export const LOCATIONS = ['어린이', '종합', '열람실'] as const;

// 로컬스토리지 키
export const STORAGE_KEY = 'parkingRecords';

// UI 설정
export const HIGHLIGHT_DURATION_MS = 3000;
export const REFRESH_ANIMATION_DURATION_MS = 500;
export const TIME_UPDATE_INTERVAL_MS = 1000;
