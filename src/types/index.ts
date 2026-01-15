// 타입 정의
export interface ParkingRecord {
  id: string;
  timestamp: Date;
  plateNumber: string;
  location: string;
  requestedTime: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type LocationStatus = 'pending' | 'checking' | 'allowed' | 'denied' | 'out-of-range';

export type ViewType = 'input' | 'success' | 'admin';
