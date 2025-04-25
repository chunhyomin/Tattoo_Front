// 브라우저 간 호환성을 위한 mediaDevices 폴리필
export function setupMediaDevicesPolyfill() {
  console.log("MediaDevices 폴리필 설정 시작...");
  
  try {
    // navigator 객체 확인
    if (typeof navigator === 'undefined') {
      console.error("navigator 객체를 찾을 수 없음");
      return {
        success: false,
        error: "navigator 객체를 찾을 수 없음"
      };
    }
    
    console.log("navigator 객체 확인됨");
    
    // mediaDevices 객체가 없는 경우 생성
    if (!navigator.mediaDevices) {
      console.log("mediaDevices 객체 생성...");
      navigator.mediaDevices = {};
    }
    
    // enumerateDevices 메서드가 없는 경우 추가
    if (!navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices = function() {
        console.log("enumerateDevices 폴리필 사용됨");
        return Promise.resolve([]);
      };
    }
    
    // getUserMedia 메서드가 없는 경우 추가
    if (!navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia 폴리필 설정 중...");
      
      // 브라우저별 getUserMedia 구현 확인
      const getUserMedia = 
        navigator.webkitGetUserMedia || 
        navigator.mozGetUserMedia || 
        navigator.msGetUserMedia;
      
      if (!getUserMedia) {
        console.error("getUserMedia를 지원하지 않는 브라우저");
        
        // 보안 컨텍스트 확인 
        const isSecure = (window.isSecureContext === true);
        if (!isSecure) {
          console.error("보안 컨텍스트가 아님 - HTTPS 또는 localhost가 필요함");
        }
        
        // 지원하지 않는 경우 오류를 반환하는 함수로 설정
        navigator.mediaDevices.getUserMedia = function(constraints) {
          const browserInfo = getBrowserInfo();
          const errorMsg = !isSecure 
            ? "보안 컨텍스트가 아닙니다. HTTPS 또는 localhost에서 실행해주세요."
            : `이 브라우저(${browserInfo.browser})는 getUserMedia를 지원하지 않습니다.`;
            
          return Promise.reject(new Error(errorMsg));
        };
        
        return {
          success: false,
          error: "getUserMedia를 지원하지 않는 브라우저",
          isSecureContext: isSecure,
          browserInfo: getBrowserInfo()
        };
      } else {
        // 브라우저별 getUserMedia를 Promise 기반 API로 변환
        navigator.mediaDevices.getUserMedia = function(constraints) {
          console.log("getUserMedia 폴리필 호출됨, 제약 조건:", constraints);
          
          // 제약 조건 검증
          if (!constraints || (!constraints.video && !constraints.audio)) {
            return Promise.reject(new Error("최소한 video 또는 audio 제약 조건이 필요합니다."));
          }
          
          return new Promise(function(resolve, reject) {
            try {
              getUserMedia.call(navigator, constraints, resolve, function(err) {
                // 오류 상세화
                if (err.name === 'PermissionDeniedError' || err.name === 'NotAllowedError') {
                  err.message = '카메라 접근 권한이 거부되었습니다. 권한을 허용해주세요.';
                }
                reject(err);
              });
            } catch (error) {
              reject(new Error(`getUserMedia 호출 오류: ${error.message}`));
            }
          });
        };
      }
    } else {
      console.log("브라우저가 이미 navigator.mediaDevices.getUserMedia를 지원합니다.");
    }
    
    // iOS Safari 비동기 로딩 문제 해결
    if (getBrowserInfo().browser === 'Safari' && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // Safari에서 getUserMedia를 먼저 호출해서 권한 요청 메커니즘 초기화
      navigator.mediaDevices.getUserMedia({ audio: false, video: false })
        .then(() => console.log("Safari 카메라 접근 초기화 성공"))
        .catch(err => console.log("Safari 카메라 접근 초기화 실패:", err));
    }
    
    console.log("MediaDevices 폴리필 설정 완료.");
    return {
      success: true,
      browserInfo: getBrowserInfo()
    };
  } catch (error) {
    console.error("폴리필 설정 중 오류 발생:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 카메라 접근이 가능한지 확인
export function checkCameraSupport() {
  try {
    // 기본 환경 체크
    if (typeof navigator === 'undefined') {
      console.error("navigator 객체를 찾을 수 없음");
      return false;
    }
    
    const browserInfo = getBrowserInfo();
    console.log("브라우저 정보:", browserInfo);
    
    // 보안 컨텍스트 확인 (중요)
    if (!browserInfo.isSecureContext) {
      console.warn("보안 컨텍스트가 아님 - getUserMedia는 보안 컨텍스트(HTTPS/localhost)에서만 작동");
    }
    
    // mediaDevices API 지원 여부 확인
    if (!navigator.mediaDevices) {
      console.error("mediaDevices API를 지원하지 않음");
      return false;
    }
    
    // getUserMedia 지원 여부 확인
    if (!navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia를 지원하지 않음");
      return false;
    }
    
    // iOS 저장된 권한 확인 (iOS는 이전에 거부하면 다시 묻지 않음)
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      console.info("iOS 기기 감지됨. 권한이 이미 거부된 경우 다시 요청되지 않을 수 있음");
    }
    
    return true;
  } catch (error) {
    console.error("카메라 지원 확인 중 오류 발생:", error);
    return false;
  }
}

// 브라우저 정보 확인
export function getBrowserInfo() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return {
      browser: 'unknown',
      version: 'unknown',
      userAgent: 'unknown',
      isSecureContext: false,
      hasMediaDevices: false,
      isMobile: false,
      isIOS: false
    };
  }
  
  const ua = navigator.userAgent;
  let browser = 'unknown';
  
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
  else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
  else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) browser = 'Edge';
  else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) browser = 'IE';
  else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
  
  // 모바일 여부 확인
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  
  return {
    browser,
    userAgent: ua,
    isSecureContext: window.isSecureContext === true,
    hasMediaDevices: !!navigator.mediaDevices,
    isMobile,
    isIOS,
    version: getBrowserVersion(ua, browser)
  };
}

// 브라우저 버전 추출
function getBrowserVersion(ua, browser) {
  let version = "unknown";
  
  try {
    if (browser === 'Chrome') {
      const match = ua.match(/Chrome\/(\d+\.\d+)/);
      if (match) version = match[1];
    } else if (browser === 'Firefox') {
      const match = ua.match(/Firefox\/(\d+\.\d+)/);
      if (match) version = match[1];
    } else if (browser === 'Safari') {
      const match = ua.match(/Version\/(\d+\.\d+)/);
      if (match) version = match[1];
    } else if (browser === 'Edge') {
      const match = ua.match(/Edge\/(\d+\.\d+)/) || ua.match(/Edg\/(\d+\.\d+)/);
      if (match) version = match[1];
    }
  } catch (error) {
    console.error("브라우저 버전 추출 중 오류:", error);
  }
  
  return version;
}

// 사용 가능한 미디어 장치 가져오기
export async function getAvailableMediaDevices() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return { 
        success: false, 
        error: "미디어 장치 목록을 가져올 수 없습니다." 
      };
    }
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    
    return {
      success: true,
      videoDevices,
      audioDevices,
      hasVideoDevices: videoDevices.length > 0,
      hasAudioDevices: audioDevices.length > 0
    };
  } catch (error) {
    console.error("미디어 장치 확인 중 오류:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export default setupMediaDevicesPolyfill; 