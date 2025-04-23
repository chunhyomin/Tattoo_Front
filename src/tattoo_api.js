/**
 * 타투 생성 API 클라이언트
 * 프론트엔드에서 백엔드 API 통신을 담당하는 모듈
 */

// API 서버 주소 (로컬 서버)
const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * 상태 확인
 * @returns {Promise<boolean>} - 서버 상태
 */
export const checkHealth = async () => {
  try {
    console.log('서버 상태 확인 시작...');
    const response = await fetch('http://127.0.0.1:5000/health', {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('서버 응답 상태:', response.status);
    
    if (!response.ok) {
      console.error('서버 응답 오류:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('서버 상태 데이터:', data);
    return data.status === 'ok';
  } catch (error) {
    console.error('서버 상태 확인 예외:', error);
    return false;
  }
};

/**
 * 이미지를 base64 문자열에서 Blob으로 변환
 * @param {string} base64String - Base64 이미지 문자열
 * @returns {Blob} - 변환된 이미지 Blob
 */
export const base64ToBlob = (base64String) => {
  // base64 데이터에서 헤더 부분 제거
  const parts = base64String.split(';base64,');
  const imageType = parts[0].split(':')[1] || 'image/jpeg';
  const base64Data = parts[1];
  
  // base64 디코딩
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: imageType });
};

/**
 * 동물 이미지 분석 함수
 * @param {string} imageData - Base64 인코딩된 이미지 데이터
 * @returns {Promise<Object>} - 동물 분석 결과
 */
export const analyzeAnimal = async (imageData) => {
  try {
    console.log('동물 분석 요청 시작');
    
    if (!imageData) {
      console.error('이미지 데이터가 없습니다');
      throw new Error('이미지 데이터가 없습니다');
    }
    
    // 이미지 데이터가 base64 문자열인 경우 Blob으로 변환
    const imageBlob = base64ToBlob(imageData);
    console.log('이미지 Blob 생성 완료:', imageBlob.size, 'bytes');
    
    // FormData 객체 생성
    const formData = new FormData();
    formData.append('image', imageBlob, 'animal_image.jpg');
    
    console.log('동물 분석 API 요청 전송 중...');
    
    // API 요청 전송
    const response = await fetch('http://127.0.0.1:5000/api/analyze-animal', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit'
    });
    
    console.log('API 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 오류 (${response.status}):`, errorText);
      throw new Error(`API 오류 (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    console.log('동물 분석 결과:', result);
    return result;
  } catch (error) {
    console.error('동물 분석 요청 실패:', error);
    throw error;
  }
};

/**
 * 이미지 캡처 후 타투 생성 요청
 * @param {string} imageData - Base64 인코딩된 이미지 데이터
 * @param {string} gender - 성별 ('male' | 'female')
 * @param {string} style - 스타일 ('cute' | 'pretty' | 'simple' | 'chic')
 * @returns {Promise<Object>} - 응답 데이터
 */
export const generateTattoo = async (imageData, gender, style) => {
  try {
    console.log(`타투 생성 요청 시작: 성별=${gender}, 스타일=${style}`);
    
    if (!imageData) {
      console.error('이미지 데이터가 없습니다');
      throw new Error('이미지 데이터가 없습니다');
    }
    
    // 이미지 데이터가 base64 문자열인 경우 Blob으로 변환
    const imageBlob = base64ToBlob(imageData);
    console.log('이미지 Blob 생성 완료:', imageBlob.size, 'bytes');
    
    // FormData 객체 생성
    const formData = new FormData();
    formData.append('image', imageBlob, 'user_image.jpg');
    formData.append('gender', gender);
    formData.append('style', style);
    
    console.log('API 요청 전송 중...');
    
    // API 요청 전송
    const response = await fetch('http://127.0.0.1:5000/api/generate-tattoo', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit'
    });
    
    console.log('API 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 오류 (${response.status}):`, errorText);
      throw new Error(`API 오류 (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API 응답 데이터:', result);
    return result;
  } catch (error) {
    console.error('타투 생성 요청 실패:', error);
    throw error;
  }
};

/**
 * 타투 결과 조회
 * @param {string} id - 결과 ID
 * @returns {Promise<Object>} - 응답 데이터
 */
export async function getTattooResult(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/result/${id}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 오류 (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('타투 결과 조회 실패:', error);
    throw error;
  }
}

/**
 * 타투 스타일 설정
 * @param {string} imageId - 이미지 ID
 * @param {string} style - 타투 스타일
 * @returns {Promise<Object>} - 응답 데이터
 */
export async function setTattooStyle(imageId, style) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/style`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_id: imageId,
        style,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 오류 (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('타투 스타일 설정 실패:', error);
    throw error;
  }
}

/**
 * 이미지 경로로부터 전체 URL 생성
 * @param {string} imagePath - 이미지 경로
 * @returns {string} - 전체 URL
 */
export function getImageUrl(imagePath) {
  if (imagePath && imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  } else if (imagePath && imagePath.startsWith('http')) {
    return imagePath;
  } else {
    return `${API_BASE_URL}/images/${imagePath}`;
  }
}

export default {
  generateTattoo,
  getTattooResult,
  setTattooStyle,
  getImageUrl,
  checkHealth,
  analyzeAnimal,
}; 