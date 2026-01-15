# 🚗 용인시 서농도서관 방문차량 스마트 등록 시스템
> **2026 대학생 용인시 동계 행정체험연수 프로젝트**
> 별도의 앱 설치 없이, 위치 기반(GPS)으로 간편하게 주차를 등록하는 웹 애플리케이션

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Tech](https://img.shields.io/badge/React-TypeScript-informational)

## 📖 프로젝트 배경
**"종이 쪽지 한 장 때문에 사서 선생님이 뛰어와야 할까?"**

본 프로젝트는 **2026년 용인시 동계 행정체험연수** 중 **서농도서관**에서 근무하며 발견한 현장의 비효율을 개선하기 위해 시작되었습니다.
기존의 **[메인 데스크 쪽지 수령 → 이동 → 주차 데스크 제출]** 방식은 민원인에게는 불필요한 이동을, 사서분들에게는 업무 중단을 초래했습니다. 이를 해결하고자 **QR코드 스캔 한 번으로 해결되는 위치 기반 웹앱**을 개발했습니다.

---

## 📱 서비스 시연 (Service Flow)

### 1. 간편한 사용자 등록 (User Interface)
앱 설치나 회원가입 없이, QR코드를 통해 접속하여 차량번호와 시간을 선택합니다. 직관적인 디자인으로 디지털 약자도 쉽게 사용할 수 있도록 구성했습니다.

> <img width="220" height="400" alt="image" src="https://github.com/user-attachments/assets/7fdd41e5-7872-4161-8960-e713a424a1dc" /> <a> <img width="200" height="600" alt="image" src="https://github.com/user-attachments/assets/e30c3e7c-ba03-4b08-9752-e0915625f1ba" />


### 2. 위치 기반 부정 등록 방지 (Geofencing)
브라우저의 Geolocation API를 활용하여 **서농도서관 반경 500m 이내**에서만 등록이 가능합니다. 현장에 방문하지 않은 외부인의 부정 등록을 원천 차단합니다.

> <img width="220" height="398" alt="image" src="https://github.com/user-attachments/assets/f43bf22c-ac30-4974-a61a-9a1df1db7e3e" /> <a> <img width="305" height="300" alt="image" src="https://github.com/user-attachments/assets/3931b390-5492-4b01-ab17-a08db3e4d9ec" />



### 3. 실시간 관리자 대시보드 (Admin Dashboard)
관리자는 태블릿/PC를 통해 실시간으로 등록 현황을 모니터링할 수 있습니다. Firebase Cloud DB와 연동되어 민원인이 등록하는 즉시 목록이 갱신되며, 신규 차량은 강조 효과로 즉각 식별 가능합니다.

> <img width="720" height="330" alt="image" src="https://github.com/user-attachments/assets/4075bef4-9515-4840-80b9-ea96ed5b79e0" />

---

## 🚀 문제 해결 (Problem Solving)

| 구분 | 🔴 기존 방식 (As-Is) | 🟢 개선된 시스템 (To-Be) |
| :-- | :-- | :-- |
| **이동 동선** | 메인 데스크(수령) ↔ 주차 데스크(제출) **왕복 이동** | 고정된 자리에서 스마트폰 터치 |
| **업무 효율** | 사서가 서가 정리 중에도 **쪽지 전달를 위해 복귀** | 시스템 자동 처리로 **본연의 업무 집중** |
| **데이터** | 연간 1.8만 장의 종이 쪽지 **단순 폐기** | 이용 장소/시간 통계 데이터 **영구 자산화** |

---

## 🛠 기술 스택 (Tech Stack)

| 구분 | 기술 (Stack) | 상세 내용 |
| :-- | :-- | :-- |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) | Vite 기반의 SPA, 컴포넌트 재사용성 극대화 |
| **Styling** | ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) | 모바일 퍼스트 반응형 디자인 구현 |
| **Database** | ![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?logo=firebase&logoColor=white) | Firestore 실시간 데이터 동기화 (Real-time Sync) |
| **State** | **Context API & Hooks** | `StorageEvent` 및 상태 관리를 통한 데이터 흐름 제어 |

---


Email: [qasw1733@naver.com]


