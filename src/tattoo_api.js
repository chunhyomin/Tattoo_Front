/**
 * 타투 생성 API 클라이언트
 * 프론트엔드에서 백엔드 API 통신을 담당하는 모듈
 */

// API 엔드포인트 설정 - 상대 경로로 변경하여 CORS 이슈 해결
const API_URL = '';  // 상대 경로로 변경

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
    console.log('타투 생성 API 호출 시작', { gender, style });
    
    // 이미지 변환
    const imageBlob = base64ToBlob(image);
    console.log('이미지 Blob 생성 완료:', imageBlob.size, 'bytes');
    
    // FormData 객체 생성
    const formData = new FormData();
    formData.append('image', imageBlob, 'user_image.jpg');
    formData.append('gender', gender);
    formData.append('style', style);
    
    // 실제 API 호출 - 헤더 수정 및 credentials 옵션 변경
    const response = await fetch(`/api/generate-tattoo`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'same-origin' // same-origin으로 변경
    });
    
    console.log('API 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 오류 (${response.status}):`, errorText);
      throw new Error(`API 오류 (${response.status}): ${errorText}`);
    }
    
    // API 응답 데이터 확인 (디버깅용)
    const responseText = await response.text();
    console.log('원본 API 응답:', responseText);
    
    let result;
    try {
      // 텍스트 응답을 JSON으로 파싱
      result = JSON.parse(responseText);
      console.log('파싱된 타투 생성 결과:', result);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      // 응답이 JSON이 아닌 경우 기본 응답 생성
      result = {
        status: 'error',
        message: '응답을 파싱할 수 없습니다',
        rawResponse: responseText.substring(0, 500) // 응답의 일부분만 저장
      };
    }
    
    // 이미지 경로 처리 함수
    const processImagePath = (path) => {
      if (!path) return '';
      
      if (typeof path === 'string') {
        // 서버 파일 시스템 경로인 경우 (예: /home/aitattoo/...)
        if (path.startsWith('/home/')) {
          const fileName = path.split('/').pop();
          return `/api/images/${fileName}`;
        }
        // 상대 경로인 경우 (예: shares/...)
        else if (!path.startsWith('http') && !path.startsWith('data:') && !path.startsWith('/api/')) {
          return `/api/images/${path.replace(/^\//, '')}`;
        }
      }
      
      return path;
    };
    
    // 응답의 이미지 경로 처리
    
    // 단일 타투 이미지 처리
    if (result.tattooImage && typeof result.tattooImage === 'string') {
      result.tattooImage = processImagePath(result.tattooImage);
    }
    
    // 타투 이미지 배열 처리
    if (result.tattoo_images && Array.isArray(result.tattoo_images)) {
      result.tattoo_images = result.tattoo_images.map(img => {
        if (typeof img === 'string') {
          return processImagePath(img);
        }
        return img;
      });
    }
    
    // 레터링 이미지 처리
    if (result.lettering_image && typeof result.lettering_image === 'string') {
      result.lettering_image = processImagePath(result.lettering_image);
    } else if (result.letteringImage && typeof result.letteringImage === 'string') {
      result.lettering_image = processImagePath(result.letteringImage);
      result.letteringImage = result.lettering_image;
    }
    
    // 최종 결과 이미지 처리
    if (result.final_display_image && typeof result.final_display_image === 'string') {
      result.final_display_image = processImagePath(result.final_display_image);
    } else if (result.finalDisplayImage && typeof result.finalDisplayImage === 'string') {
      result.final_display_image = processImagePath(result.finalDisplayImage);
      result.finalDisplayImage = result.final_display_image;
    }
    
    // 동물 타입 추출
    if (!result.animal_type && !result.animalType) {
      // 로그에서 animal_type을 찾아보기
      const animalTypeMatch = responseText.match(/"animal_type"\s*:\s*"([^"]+)"/);
      if (animalTypeMatch && animalTypeMatch[1]) {
        result.animal_type = animalTypeMatch[1];
      } 
      // 파일 이름에서 동물 타입 추출 시도
      else if (result.tattoo_images && result.tattoo_images.length > 0) {
        const fileNameMatch = result.tattoo_images[0].match(/_(.*?)_/);
        if (fileNameMatch && fileNameMatch[1]) {
          result.animal_type = fileNameMatch[1];
        }
      } else if (result.tattooImage) {
        const fileNameMatch = result.tattooImage.match(/_(.*?)_/);
        if (fileNameMatch && fileNameMatch[1]) {
          result.animal_type = fileNameMatch[1];
        }
      }
      
      // 필드 동기화
      if (result.animal_type && !result.animalType) {
        result.animalType = result.animal_type;
      } else if (!result.animal_type && result.animalType) {
        result.animal_type = result.animalType;
      }
    }
    
    console.log('최종 처리된 결과:', result);
    return result;
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
  if (!imagePath) return '';
  
  if (imagePath.startsWith('data:')) {
    return imagePath; // 이미 base64 데이터 URL인 경우
  } else if (imagePath.startsWith('http')) {
    return imagePath; // 이미 완전한 URL인 경우
  } else if (imagePath.startsWith('/api/')) {
    return imagePath; // API 경로인 경우
  } else if (imagePath.startsWith('/home/')) {
    const fileName = imagePath.split('/').pop();
    return `/api/images/${fileName}`; // 서버 경로인 경우 파일명만 추출
  } else if (imagePath.startsWith('/')) {
    return `${API_URL}${imagePath}`; // 루트 상대 경로인 경우
  } else {
    return `${API_URL}/api/images/${imagePath}`; // 다른 모든 경우
  }
}

/**
 * 타투 공유 레코드 생성 함수
 * @param {Object} shareData - 공유할 타투 데이터
 * @returns {Promise<Object>} 생성된 공유 정보
 */
export const createShareRecord = async (shareData) => {
  try {
    console.log('공유 레코드 생성 요청 시작', shareData);
    
    // 현재 도메인 정보 추가
    const currentDomain = window.location.origin;
    const dataWithDomain = {
      ...shareData,
      base_url: currentDomain
    };
    
    console.log('도메인 정보가 추가된 공유 데이터:', dataWithDomain);
    
    const response = await fetch(`${API_URL}/api/create-share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(dataWithDomain),
      mode: 'cors',
      cache: 'no-cache'
    });
    
    console.log('API 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 오류 (${response.status}):`, errorText);
      throw new Error(`API 오류 (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    console.log('공유 레코드 생성 결과:', result);
    
    // QR 코드 URL이 상대 경로인 경우 처리
    if (result.qr_url && typeof result.qr_url === 'string') {
      // 로그 추가
      console.log('QR 코드 원본 URL:', result.qr_url);
      
      // getImageUrl 함수를 사용하여 전체 URL로 변환하지 않음
      // qr_url은 이미 서버에서 처리된 경로이므로 그대로 사용
      // 단, 상대 경로인 경우에만 API_URL을 추가
      if (!result.qr_url.startsWith('http') && !result.qr_url.startsWith('/')) {
        result.qr_url = `/api/images/${result.qr_url}`;
      }
      
      console.log('QR 코드 처리된 URL:', result.qr_url);
    }
    
    return result;
  } catch (error) {
    console.error('공유 레코드 생성 실패:', error);
    throw error;
  }
};

/**
 * 공유 토큰으로 타투 데이터 조회 함수
 * @param {string} token - 공유 토큰
 * @returns {Promise<Object>} 공유된 타투 데이터
 */
export const getSharedTattoo = async (token) => {
  try {
    console.log('공유 타투 데이터 조회 시작:', token);
    
    const response = await fetch(`${API_URL}/api/share/${token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      mode: 'cors',
      cache: 'no-cache'
    });
    
    console.log('API 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 오류 (${response.status}):`, errorText);
      throw new Error(`API 오류 (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    console.log('공유 타투 데이터 조회 결과:', result);
    return result;
  } catch (error) {
    console.error('공유 데이터 조회 실패:', error);
    throw error;
  }
};

export default {
  generateTattoo,
  getTattooResult,
  setTattooStyle,
  getImageUrl,
  checkHealth,
  analyzeAnimal,
  createShareRecord,
  getSharedTattoo,
}; 