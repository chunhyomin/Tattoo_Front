import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { generateTattoo } from "../tattoo_api.js";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import temp_back from "/img_background.png";
import ch1 from "/여울이.png";
import ch2 from "/너굴맨.png";
import cloud from "/cloud.png";
import bubble from "/말풍선.png";
import btimg from "/buttonimg.png";

import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

// 카메라 찰칵 효과음 URL
const CAMERA_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2122/2122-preview.mp3";

//text 색, 두께 수정
const TextBox = styled.p`
  font-weight: 700;
  color: #8B8B8B;
  white-space: pre-line;
  margin: 0;
  word-break: keep-all;
  text-align: center;
  line-height: 1.4;
  font-size: ${({ fontSize }) => fontSize - 30}px;
`;

// 카메라 플래시 효과를 위한 스타일 컴포넌트
const FlashOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  opacity: ${props => props.active ? 0.8 : 0};
  z-index: 999;
  pointer-events: none;
  transition: opacity 0.2s ease-out;
`;

// 미리보기 컴포넌트
const PreviewOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 100;
`;

const PreviewContent = styled.div`
  position: relative;
  width: 90%;
  max-width: 600px;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 5px;
  margin-bottom: 15px;
`;

function App() {
  const navigate = useNavigate();
  const text = "카메라를 통해 자신의 모습을 2장 촬영해주세요. 촬영 후 타투 생성하기를 눌러주세요.";
  const [displayText, setDisplayText] = useState("");
  const [loop, setLoop] = useState(0);
  const [fontSize, setFontSize] = useState(1);
  const bubbleRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGender, setSelectedGender] = useState('male'); // 기본값 male
  const [selectedStyle, setSelectedStyle] = useState('simple'); // 기본값 simple
  const [photoCount, setPhotoCount] = useState(0); // 촬영된 사진 개수 상태 추가
  const [isTimerActive, setIsTimerActive] = useState(false); // 타이머 활성화 상태
  const [timerCount, setTimerCount] = useState(3); // 타이머 카운트다운 (3초)
  const [capturedImages, setCapturedImages] = useState([]); // 사진 배열을 직접 상태로 관리
  const [flashActive, setFlashActive] = useState(false); // 플래시 효과 상태
  const [showPreview, setShowPreview] = useState(false); // 미리보기 표시 상태
  const [previewImage, setPreviewImage] = useState(null); // 미리보기 이미지

  // 카메라 효과음 객체 생성
  const cameraSound = new Audio(CAMERA_SOUND_URL);

  // 성별 정보 로드 - 원래 기능대로 localStorage 초기화 복원
  useEffect(() => {
    // 페이지 로드 시 localStorage 및 상태 초기화
    localStorage.removeItem('capturedImages');
    setCapturedImages([]);
    setPhotoCount(0);
    
    const savedGender = localStorage.getItem('selectedGender');
    if (savedGender) {
      setSelectedGender(savedGender);
      console.log("저장된 성별 정보 로드:", savedGender);
    }
    
    const savedStyle = localStorage.getItem('selectedStyle');
    if (savedStyle) {
      setSelectedStyle(savedStyle);
      console.log("저장된 스타일 정보 로드:", savedStyle);
    }
  }, []);

  // 이미 저장된 사진 개수 확인 - 중복 로직이지만 기존 코드 유지
  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('capturedImages') || '[]');
    console.log("사진 개수 확인:", savedImages.length); // 디버깅 로그 추가
    setPhotoCount(savedImages.length);
  }, []);

  // 타이핑 효과
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        let newText = text.slice(0, index + 1);
        if ((index + 1) % 15 === 0) newText += "\n";
        setDisplayText(newText);
        index += 1;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setDisplayText("");
          setLoop((prev) => prev + 1);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [loop]);

  // 말풍선 크기에 따라 폰트 조절
  useEffect(() => {
    const updateFontSize = () => {
      if (bubbleRef.current) {
        const bubbleWidth = bubbleRef.current.offsetWidth;
        setFontSize(Math.max(12, bubbleWidth * 0.1));
      }
    };

    updateFontSize();
    window.addEventListener("resize", updateFontSize);
    return () => window.removeEventListener("resize", updateFontSize);
  }, []);

  let videoRef = useRef(null)

  //사용자 웹캠에 접근
  const canvasRef = useRef(null); // 캡처용 캔버스 ref
  const [capturedImage, setCapturedImage] = useState(null); // 캡처 이미지 상태
  
  const getUserCamera = () =>{
    navigator.mediaDevices.getUserMedia({
      video:true
    })
    .then((stream) => {
      //비디오 tag에 stream 추가
      let video = videoRef.current

      video.srcObject = stream

      video.play()
    })
    .catch((error) => {
      console.log(error)
    })
  }

  useEffect(() => {
    getUserCamera()
  },[videoRef])

  // 사진 촬영 버튼을 클릭했을 때의 핸들러
  const handleCapture = () => {
    // 이미 타이머가 활성화된 상태면 리턴
    if (isTimerActive) return;
    
    // 이미 2장이 다 찍혔으면 리턴
    if (capturedImages.length >= 2) {
      setError('이미 2장을 모두 촬영했습니다. 타투 생성하기를 눌러주세요.');
      return;
    }
    
    // 타이머 시작
    setIsTimerActive(true);
    setTimerCount(3);
    
    // 3초 카운트다운 시작
    const timerInterval = setInterval(() => {
      setTimerCount(prevCount => {
        // 타이머가 0이 되면 실제 촬영 수행
        if (prevCount <= 1) {
          clearInterval(timerInterval);
          
          // 사진 촬영 효과
          playShutterEffect();
          
          return 3; // 타이머 초기화
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  // 카메라 셔터 효과 재생
  const playShutterEffect = () => {
    // 플래시 효과 활성화
    setFlashActive(true);
    
    // 카메라 소리 재생
    cameraSound.play().catch(err => console.error("오디오 재생 오류:", err));
    
    // 실제 캡처 수행
    captureImage();
    
    // 플래시 효과 비활성화 (200ms 후)
    setTimeout(() => {
      setFlashActive(false);
    }, 200);
  };

  // 실제 이미지 캡처 로직
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.translate(canvas.width, 0); // 좌우반전 설정
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/png");
    setCapturedImage(imageDataUrl);
    
    // 미리보기 이미지 설정 및 표시
    setPreviewImage(imageDataUrl);
    setShowPreview(true);
    
    // 2초 후 미리보기 숨기고 다음 단계 진행
    setTimeout(() => {
      setShowPreview(false);
      setIsTimerActive(false);
      
      // 현재 상태에서 직접 이미지 배열을 업데이트
      if (capturedImages.length < 2) {
        // 상태 및 localStorage 모두 업데이트
        const newImages = [...capturedImages, imageDataUrl];
        setCapturedImages(newImages);
        setPhotoCount(newImages.length);
        
        // localStorage 업데이트
        localStorage.setItem('capturedImages', JSON.stringify(newImages));
        
        console.log(`이미지 저장 완료: ${newImages.length}/2장 저장됨`);
        
        // 2장을 모두 찍었으면 안내 메시지 표시
        if (newImages.length === 2) {
          setError('2장의 사진이 모두 촬영되었습니다. 타투 생성하기를 눌러주세요.');
        }
      }
    }, 2000);
  };

  const handleDownload = () => {
    const base64Data = capturedImage.split(',')[1]; // 'data:image/png;base64,...' → base64 부분만 추출
    const blob = new Blob([base64Data], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "encoded_image.txt";
    link.click();
  };

  // 이미지 전송 함수
  const sendImageToBackend = async () => {
    if (capturedImages.length === 2) { // 정확히 2장인 경우에만 다음 단계로 진행
      try {
        setLoading(true);
        setError(null);
        
        console.log('캡처된 이미지 처리 시작');
        
        // 성별, 스타일 정보를 localStorage에 저장
        localStorage.setItem('selectedGender', selectedGender);
        localStorage.setItem('selectedStyle', selectedStyle);
        
        // localStorage에도 최종 이미지 저장 (혹시 모를 불일치 방지)
        localStorage.setItem('capturedImages', JSON.stringify(capturedImages));
        
        console.log(`이미지 저장 완료: ${capturedImages.length}장, 성별=${selectedGender}, 스타일=${selectedStyle}`);
        
        // 이제 스타일은 이미 선택됐으므로 바로 로딩 페이지로 이동
        setLoading(false);
        navigate('/Picture_Select');
      } catch (error) {
        console.error('이미지 저장 오류:', error);
        setLoading(false);
        setError('이미지 저장 중 오류가 발생했습니다.');
      }
    } else {
      setError('2장의 사진을 모두 촬영해주세요. 현재 ' + capturedImages.length + '장이 촬영되었습니다.');
    }
  };

  // 이전 페이지로 이동
  const goBack = () => {
    navigate('/Gender_Select');
  };

  return (
    <Container style={{ minHeight: "120vh" }}>
      {/* 플래시 효과 오버레이 */}
      <FlashOverlay active={flashActive} />
      
      {/* 미리보기 오버레이 */}
      {showPreview && (
        <PreviewOverlay>
          <PreviewContent>
            <PreviewImage src={previewImage} alt="촬영된 사진" />
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              사진이 촬영되었습니다!
            </div>
          </PreviewContent>
        </PreviewOverlay>
      )}
      
      <Row className="one">
        <div className="App">
          <img className="cloudimg" src={cloud} />
        <Col>
        <video
          className="video_type"
          ref={videoRef}
          style={{ transform: "scaleX(-1)" }} // 좌우 반전 적용
        ></video>
        {/* 타이머 활성화 시 카운트다운 오버레이 표시 */}
        {isTimerActive && !showPreview && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '100px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
            zIndex: 10
          }}>
            {timerCount}
          </div>
        )}
        </Col>
        </div>
      </Row>
      <Row className="three" style={{ marginTop: "30px", textAlign: "center" }}>
        <Col style={{ zIndex:2 }}>
          {/* 촬영 버튼 */}
          <button 
            onClick={handleCapture} 
            disabled={isTimerActive || capturedImages.length >= 2 || showPreview}
            style={{ 
              padding: "10px 20px", 
              fontSize: "16px", 
              marginRight: "10px",
              opacity: (isTimerActive || capturedImages.length >= 2 || showPreview) ? 0.6 : 1 
            }}
          >
            {isTimerActive ? `${timerCount}초 후 촬영` : 
             showPreview ? '사진 처리 중...' :
             (capturedImages.length >= 2 ? '촬영 완료' : `촬영하기 (${capturedImages.length}/2)`)}
          </button>

          {/* 타투 생성 버튼 */}
          <button 
            onClick={sendImageToBackend}
            disabled={loading || capturedImages.length < 2 || isTimerActive || showPreview}
            style={{ 
              padding: "10px 20px", 
              fontSize: "16px", 
              backgroundColor: loading || capturedImages.length < 2 || isTimerActive || showPreview ? "#ccc" : "#007bff", 
              color: "white",
              marginRight: "10px"
            }}
          >
            {loading ? "처리 중..." : "타투 생성하기"}
          </button>
          
          {/* 이미지 저장 버튼 */}
          {capturedImage && (
            <button 
              onClick={handleDownload} 
              style={{ 
                padding: "10px 20px", 
                fontSize: "16px"
              }}
            >
              이미지 저장
            </button>
          )}
          
          {/* 촬영된 사진 개수 표시 */}
          <div style={{ marginTop: "10px", fontSize: "14px", fontWeight: "bold" }}>
            촬영된 사진: {capturedImages.length}장 / 최대 2장
          </div>
          
          {/* 선택된 성별 정보 표시 */}
          <div style={{ marginTop: "10px", fontSize: "14px" }}>
            선택된 성별: {selectedGender === 'male' ? '남자' : '여자'}
          </div>
          
          {/* 에러 메시지 표시 */}
          {error && (
            <div style={{ color: "red", marginTop: "10px" }}>
              {error}
            </div>
          )}
          
          {/* 이전으로 버튼 */}
          <button 
            onClick={goBack}
            style={{ padding: "10px 20px", fontSize: "16px", marginTop: "20px", backgroundColor: "#6c757d", color: "white" }}
          >
            이전으로
          </button>
        </Col>
      </Row>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <Row className="character-row justify-content-center align-items-center">
        <Col xs={4} sm={3} md={2} className="d-flex justify-content-center">
          <img src={ch1} alt="캐릭터1" className="char-img" />
        </Col>
        <Col xs={12} sm={6} md={5}>
          <div
            className="bubble-container position-relative d-flex justify-content-center align-items-center"
            ref={bubbleRef}
          >
            <img src={bubble} alt="말풍선" className="bubble-img w-100" />
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ padding: "2rem" }}
            >
              <TextBox fontSize={fontSize}>{displayText}</TextBox>
            </div>
          </div>
        </Col>
        <Col xs={4} sm={3} md={2} className="d-flex justify-content-center">
          <img src={ch2} alt="캐릭터2" className="char-img" />
        </Col>
      </Row>
    </Container>
  );
}

export default App;