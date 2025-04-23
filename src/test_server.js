/**
 * 서버 연결 테스트 스크립트
 * 
 * 사용법: node test_server.js
 */

// 서버 주소
const SERVER_URL = 'http://127.0.0.1:5000/health';

async function testServerConnection() {
  console.log('서버 연결 테스트를 시작합니다...');
  console.log(`대상 URL: ${SERVER_URL}`);
  
  try {
    console.log('요청 전송 중...');
    const response = await fetch(SERVER_URL, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('서버 응답 상태:', response.status);
    
    if (!response.ok) {
      console.error(`서버 응답 오류: HTTP ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log('서버 응답 데이터:', data);
    
    if (data.status === 'ok') {
      console.log('✅ 서버 연결 성공!');
      return true;
    } else {
      console.error('❌ 서버 상태 이상:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ 서버 연결 예외 발생:', error.message);
    console.error('네트워크 문제 또는 CORS 설정 문제일 수 있습니다.');
    return false;
  }
}

// 테스트 실행
testServerConnection()
  .then(result => {
    console.log('테스트 결과:', result ? '성공' : '실패');
  })
  .catch(error => {
    console.error('테스트 중 오류 발생:', error);
  }); 