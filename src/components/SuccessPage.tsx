import { CheckCircle } from 'lucide-react';

interface SuccessPageProps {
  plateNumber: string;
  duration: string;
  location: string;
  onClose: () => void;
}

export function SuccessPage({ plateNumber, duration, location, onClose }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center max-w-md mx-auto px-5">
      {/* Success Icon */}
      <div className="mb-6">
        <CheckCircle className="w-20 h-20 text-green-600" strokeWidth={2} />
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        등록 완료
      </h1>

      {/* Details Card */}
      <div className="w-full bg-white border border-gray-300 p-5 mb-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-base text-gray-600">차량번호</span>
            <span className="text-xl font-bold text-gray-800">{plateNumber}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-base text-gray-600">이용 장소</span>
            <span className="text-base font-bold text-gray-800">{location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-600">주차 시간</span>
            <span className="text-xl font-bold text-[#1e4a8a]">{duration}</span>
          </div>
        </div>
      </div>

      {/* Important Instruction */}
      <div className="w-full bg-red-50 border border-red-300 p-4 mb-6 rounded">
        <p className="text-base text-gray-800 text-center font-semibold">
          <span className="text-red-600 font-bold">반드시</span> 반대편 1층 주차안내 데스크 방문하여
          <br />
          주차정산 후 출차 바랍니다
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-full py-3 text-base font-bold border-2 border-gray-400 text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
      >
        창 닫기
      </button>
    </div>
  );
}
