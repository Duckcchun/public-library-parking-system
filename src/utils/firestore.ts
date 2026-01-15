import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { ParkingRecord } from '../types';

const COLLECTION_NAME = 'parkingRecords';

// 주차 기록 추가
export const addParkingRecord = async (record: Omit<ParkingRecord, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...record,
      timestamp: Timestamp.fromDate(record.timestamp)
    });
    return docRef.id;
  } catch (error) {
    console.error('주차 기록 추가 실패:', error);
    throw error;
  }
};

// 모든 주차 기록 가져오기
export const getParkingRecords = async (): Promise<ParkingRecord[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as ParkingRecord[];
  } catch (error) {
    console.error('주차 기록 조회 실패:', error);
    throw error;
  }
};

// 주차 기록 삭제
export const deleteParkingRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('주차 기록 삭제 실패:', error);
    throw error;
  }
};

// 실시간 주차 기록 구독
export const subscribeToParkingRecords = (
  callback: (records: ParkingRecord[]) => void
): (() => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as ParkingRecord[];
    
    callback(records);
  }, (error) => {
    console.error('실시간 구독 오류:', error);
  });

  return unsubscribe;
};
