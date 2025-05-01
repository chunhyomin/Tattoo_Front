import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Container, Row, Col, ProgressBar } from "react-bootstrap";
import { generateTattoo, getImageUrl } from "../tattoo_api.js"; // API 함수 import

import logo from "/logo.png";
import leaf from "/leaf.png";
import ch1 from "/여울이.png";
import ch2 from "/너굴맨.png";
import cloud from "/cloud.png";
import bubble from "/말풍선.png";
import btimg from "/buttonimg.png";
import d_bubble from "/dark_bubble.png";
import d_cloud from "/dark_cloud.png";
import cat from "/고양이.png";
import iland from "/둥둥섬.png"

import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const TextBox = styled.p`
  font-size: ${({ fontSize }) => fontSize}px;
  font-weight: 700;
  color: #8B8B8B;
  white-space: pre-line;
  margin: 0;
  word-break: keep-all;
  text-align: center;
  line-height: 1.4;
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

const FloatingIsland = styled.img`
  height: 90px; /* 원래 60px * 1.5 = 90px */
  animation: ${float} 3s ease-in-out infinite;
`;

// 로딩 상태 문구
const LOADING_MESSAGES = [
  "AI가 당신의 이미지를 분석하고 있어요...",
  "당신과 닮은 동물을 찾고 있어요...",
  "타투 스타일을 적용하고 있어요...",
  "거의 완료되었어요! 조금만 기다려주세요..."
];

// 에러 메시지 매핑
const ERROR_MESSAGES = {
  "No face detected": "얼굴이 인식되지 않았습니다. 다른 사진을 시도해주세요.",
  "Multiple faces detected": "여러 개의 얼굴이 인식되었습니다. 한 사람만 나온 사진을 사용해주세요.",
  "Face too small": "얼굴이 너무 작게 인식됩니다. 더 가까이서 촬영해주세요.",
  "Invalid image format": "이미지 형식이 올바르지 않습니다. 다시 시도해주세요.",
  "Failed to process image": "이미지 처리에 실패했습니다. 다른 사진을 시도해주세요."
};

function App() {
  const navigate = useNavigate();
  const text = "당신의 이미지를 분석하여 멋진 타투를 생성하고 있어요. 잠시만 기다려주세요!";
  const [displayText, setDisplayText] = useState("");
  const [loop, setLoop] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const bubbleRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingError, setLoadingError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [animalType, setAnimalType] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const apiCalledRef = useRef(false); // API 호출 여부를 추적하는 ref 추가
  
  // 타투 생성 API 호출
  useEffect(() => {
    // 이미 API가 호출되었다면 실행하지 않음
    if (apiCalledRef.current) return;
    
    // API 호출 플래그를 true로 설정
    apiCalledRef.current = true;
    
    // 진행 상태 및 로딩 메시지 업데이트 함수
    const updateProgress = (value, messageIndex) => {
      setProgress(value);
      if (messageIndex !== undefined) {
        setLoadingMessageIndex(messageIndex);
      }
    };

    const callTattooGenerationApi = async () => {
      // 진행 상태 업데이트를 위한 타이머 설정
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 1; // 더 느리게 진행되도록 조정
        
        // 진행 상태에 따라 로딩 메시지 변경
        if (currentProgress >= 25 && loadingMessageIndex < 1) {
          updateProgress(currentProgress, 1);
        } else if (currentProgress >= 50 && loadingMessageIndex < 2) {
          updateProgress(currentProgress, 2);
        } else if (currentProgress >= 75 && loadingMessageIndex < 3) {
          updateProgress(currentProgress, 3);
        } else {
          updateProgress(currentProgress);
        }
        
        // 85%에서 멈추고 실제 API 응답을 기다림
        if (currentProgress >= 85) {
          clearInterval(progressInterval);
        }
      }, 700);
      
      try {
        // sessionStorage에서 필요한 데이터 가져오기
        const selectedImage = sessionStorage.getItem("selectedPictureData");
        const gender = localStorage.getItem('selectedGender') || 'male';
        const style = sessionStorage.getItem("selectedStyleValue");
        
        if (!selectedImage || !style) {
          clearInterval(progressInterval);
          setLoadingError("필요한 정보가 없습니다. 이전 페이지로 돌아가 다시 시도해주세요.");
          setIsProcessing(false);
          setRedirectCountdown(10); // 10초 카운트다운 시작
          return;
        }
        
        console.log("타투 생성 API 호출 준비:", { gender, style });
        
        try {
          // API 호출
          const result = await generateTattoo(selectedImage, gender, style);
          
          // API 호출 완료 후 타이머 정리
          clearInterval(progressInterval);
          
          if (result) {
            console.log("API 결과 수신:", result);
            
            // 오류 응답 처리
            if (result.error || result.status === 'error') {
              const errorMessage = result.message || result.error || "알 수 없는 오류가 발생했습니다.";
              // 얼굴 인식 관련 오류 확인
              const userFriendlyMessage = ERROR_MESSAGES[errorMessage] || "알 수 없는 오류가 발생했습니다.";
              
              setLoadingError(userFriendlyMessage);
              setIsProcessing(false);
              setRedirectCountdown(10); // 10초 카운트다운 시작
              return;
            }
            
            // 동물 타입 확인 및 설정
            const animalTypeValue = result.animal_type || result.animalType;
            if (animalTypeValue) {
              setAnimalType(animalTypeValue);
              console.log("동물 타입:", animalTypeValue);
            } else if (result.tattoo_images && result.tattoo_images.length > 0) {
              // 파일 이름에서 동물 타입 추출 시도
              const fileNameMatch = result.tattoo_images[0].match(/_(.*?)_/);
              if (fileNameMatch && fileNameMatch[1]) {
                setAnimalType(fileNameMatch[1]);
                console.log("파일명에서 동물 타입 추출:", fileNameMatch[1]);
              }
            }
            
            // API 결과를 localStorage에 저장
            localStorage.setItem('tattooResult', JSON.stringify(result));
            console.log("타투 생성 완료하고 localStorage에 저장:", result);
            
            // 진행 상태 100%로 설정
            updateProgress(100);
            
            // 성공 시에는 타투 선택 페이지로 이동
            setTimeout(() => {
              navigate('/Tatoo_Select');
            }, 1500);
          } else {
            console.error("API 응답이 없습니다");
            throw new Error("알 수 없는 오류가 발생했습니다.");
          }
        } catch (apiError) {
          console.error("API 호출 처리 중 오류:", apiError);
          
          // 로딩 메시지를 변경하고 오류 메시지 표시
          clearInterval(progressInterval);
          updateProgress(90);
          
          // 에러 메시지 표시 개선 - 사용자 친화적인 메시지로 변환
          const errorMessage = apiError.message || "API 오류가 발생했습니다.";
          // 얼굴 인식 관련 오류인지 확인, 아니면 일반 오류 메시지 표시
          const userFriendlyMessage = ERROR_MESSAGES[errorMessage] || "알 수 없는 오류가 발생했습니다. 관리자에게 문의 바랍니다.";
          
          setLoadingError(userFriendlyMessage);
          setIsProcessing(false);
          setRedirectCountdown(10); // 10초 카운트다운 시작
        }
      } catch (error) {
        console.error("타투 생성 전체 프로세스 오류:", error);
        clearInterval(progressInterval);
        
        // 사용자 친화적인 메시지로 변환
        const errorMessage = error.message || "알 수 없는 오류가 발생했습니다.";
        // 얼굴 인식 관련 오류인지 확인, 아니면 일반 오류 메시지 표시
        const userFriendlyMessage = ERROR_MESSAGES[errorMessage] || "알 수 없는 오류가 발생했습니다.";
        
        setLoadingError(userFriendlyMessage);
        setIsProcessing(false);
        setRedirectCountdown(10); // 10초 카운트다운 시작
      }
    };
    
    callTattooGenerationApi();
  }, [navigate]);

  // 카운트다운 타이머 효과
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      console.log(`카운트다운: ${redirectCountdown}초`); // 디버깅용 로그
      
      const countdownInterval = setInterval(() => {
        setRedirectCountdown(prev => {
          console.log(`카운트다운 감소: ${prev - 1}초`); // 디버깅용 로그
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        console.log("카운트다운 타이머 정리"); // 디버깅용 로그
        clearInterval(countdownInterval);
      };
    } else if (redirectCountdown === 0) {
      console.log("카운트다운 완료: 페이지 이동"); // 디버깅용 로그
      navigate('/Picture'); // 사진 촬영 페이지로 리다이렉트
    }
  }, [redirectCountdown, navigate]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        let newText = text.slice(0, index + 1);
        if ((index + 1) % 25 === 0) newText += "\n";
        setDisplayText(newText);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setDisplayText("");
          setLoop((prev) => prev + 1);
        }, 2500);
      }
    }, 90);
    return () => clearInterval(interval);
  }, [loop]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (bubbleRef.current) {
        const width = bubbleRef.current.offsetWidth;
        const calculatedFontSize = Math.max(12, Math.min(width * 0.035, 22));
        setFontSize(calculatedFontSize);
      }
    });

    if (bubbleRef.current) {
      resizeObserver.observe(bubbleRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 오류 발생 시 이전 페이지로 이동
  const handleGoBack = () => {
    navigate('/Picture');
  };

  // 현재 로딩 메시지 가져오기
  const getCurrentLoadingMessage = () => {
    // 동물 타입이 있으면 동물 타입을 포함한 메시지 표시
    if (animalType && loadingMessageIndex >= 1) {
      const formattedAnimalType = animalType.charAt(0).toUpperCase() + animalType.slice(1).toLowerCase();
      
      if (loadingMessageIndex === 1) {
        return `당신과 닮은 동물은 ${formattedAnimalType}입니다!`;
      } else if (loadingMessageIndex === 2) {
        return `${formattedAnimalType} 타투 디자인을 생성하고 있어요...`;
      } else if (loadingMessageIndex === 3) {
        return `${formattedAnimalType} 타투를 마무리하고 있어요. 조금만 기다려주세요!`;
      }
    }
    
    // 기본 로딩 메시지 리턴
    return LOADING_MESSAGES[loadingMessageIndex];
  };

  return (
    
    <div className="app2-background" 
    style={{
      background: '#000'
    }}>
      <img src={d_cloud} className="cloud-bg" alt="배경" />

      <Container fluid className="text-center">
        <div className="position-absolute top-0 end-0 p-3">
          <img src={leaf} alt="나뭇잎" className="leaf-img" />
        </div>

        <Row className="justify-content-center mt-5">
          <Col xs={8} md={6}>
            <img src={cat} alt="로고" className="cat" />
          </Col>
        </Row>

        <Row className="character-row justify-content-center align-items-center">
          <Col xs={14} sm={8} md={8}>
            <div
              className="d_bubble-container position-relative d-flex justify-content-center align-items-center mt-5"
              ref={bubbleRef}
            >
              <img src={d_bubble} alt="말풍선" className="bubble-img w-100" />
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{ padding: "2rem" }}
              >
                {loadingError ? (
                  <div>
                    <TextBox fontSize={fontSize} style={{ color: '#ff3333', fontWeight: 'bold' }}>
                      {loadingError}
                      {redirectCountdown !== null && (
                        <div style={{ 
                          marginTop: '15px', 
                          fontSize: '1.1em',
                          padding: '5px',
                          background: 'rgba(255, 51, 51, 0.1)',
                          borderRadius: '5px',
                          color: '#ff3333'
                        }}>
                          <b>{redirectCountdown}</b>초 후 사진 촬영 페이지로 돌아갑니다.
                        </div>
                      )}
                    </TextBox>
                    <div className="mt-4">
                      <button 
                        onClick={handleGoBack}
                        style={{ 
                          padding: '10px 20px', 
                          background: '#333333', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '30px',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        지금 돌아가기
                      </button>
                    </div>
                  </div>
                ) : (
<div
  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
  style={{ padding: "2rem" }}
>
  <div
    style={{
      width: '100%',
      height: '100%',
      padding: '1rem',
      overflowY: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}
  >
    <TextBox
      fontSize={fontSize}
      style={{
        width: '100%',
        wordBreak: 'break-word',
        lineHeight: '1.4',
      }}
    >
      {displayText}
    </TextBox>
  </div>
</div>
                )}
              </div>
            </div>
          </Col>
        </Row>
        
        
        <Row className="justify-content-end align-items-center mt-5">
          <Col xs={6} sm={12} md={10}>
            <ProgressBar 
              now={progress} 
              label={`${progress}%`} 
              style={{ 
                height: "30px",
                backgroundColor: "#e9ecef",
                transition: "width 0.5s ease-in-out"
              }} 
              variant={loadingError ? "danger" : "primary"}
            />
          </Col>
          <Col xs="auto">
            <FloatingIsland src={iland} alt="캐릭터2" />
          </Col>
        </Row>
        <Row className="justify-content-center mt-5">
        <Col xs={12}>
          <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#f1f3f5",
          padding: "12px 0",
          textAlign: "center",
          borderTop: "1px solid #dee2e6",
          zIndex: 9999,
          height: "140px"
          }}>
          {/* 여기에 광고 이미지나 문구, 링크 등을 삽입 */}
            <p style={{ margin: 0, fontWeight: "bold", color: "#495057" }}>
              🔥 하단 고정 광고 영역입니다 🔥
            </p>
          </div>
        </Col>
</Row>
      </Container>
    </div>

    
  );
}

export default App;