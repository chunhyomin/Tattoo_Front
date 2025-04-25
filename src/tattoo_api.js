/**
 * 타투 생성 API 클라이언트
 * 프론트엔드에서 백엔드 API 통신을 담당하는 모듈
 */

// API 엔드포인트 설정
const API_URL = 'http://localhost:5000';

/**
 * 서버 상태를 체크하는 함수
 * @returns {Promise<boolean>} 서버가 정상 상태인지 여부
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('서버 상태 체크 오류:', error);
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
 * 타투를 생성하는 함수
 * @param {string} image - base64 인코딩된 이미지
 * @param {string} gender - 성별 ('male' | 'female')
 * @param {string} style - 타투 스타일
 * @returns {Promise<Object>} 생성된 타투 결과
 */
export const generateTattoo = async (image, gender, style) => {
  try {
    // 데모 목적으로 API 호출을 시뮬레이션합니다
    // 실제 서비스에서는 아래 주석 해제 후 사용
    /*
    const response = await fetch(`${API_URL}/generate-tattoo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        gender,
        style
      }),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    return await response.json();
    */

    // 데모용 시뮬레이션 응답
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      animalType: '호랑이',
      tattooImage: '/tiger-tattoo.png',
      description: '당신의 성격은 리더십이 강하고 용감한 호랑이와 닮았습니다. 강인함과 우아함을 동시에 지닌 이 타투는 당신의 강한 의지를 표현합니다.',
      traits: ['용맹', '리더십', '결단력', '카리스마']
    };
  } catch (error) {
    console.error('타투 생성 오류:', error);
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
    const response = await fetch(`${API_URL}/api/result/${id}`);

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
    const response = await fetch(`${API_URL}/api/style`, {
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
    return `${API_URL}${imagePath}`;
  } else if (imagePath && imagePath.startsWith('http')) {
    return imagePath;
  } else {
    return `${API_URL}/images/${imagePath}`;
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