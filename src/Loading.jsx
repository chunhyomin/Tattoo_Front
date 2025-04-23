import "bootstrap/dist/css/bootstrap.min.css";

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { generateTattoo, checkHealth } from "./tattoo_api.js";

import logo from "/logo.png";
import ch1 from "/여울이.png";
import ch2 from "/너굴맨.png";
import cloud from "/cloud.png";
import bubble from "/말풍선.png";
import btimg from "/buttonimg.png";
import cat from "/고양이.png";
import iland from "/둥둥섬.png";
import d_cloud from "/dark_cloud.png";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const TextBox = styled.p`
  font-size: ${({ fontSize }) => fontSize}px;
  font-weight: 700;
  color: #8B8B8B;
  white-space: pre-line;
  margin: 0;
  word-break: keep-all;
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
`;

const LoadingText = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  color: #555;
`;

const LoadingCharacter = styled.img`
  width: 120px;
  animation: ${bounce} 1.5s ease infinite;
`;

function App() {
  const navigate = useNavigate();
  const text = "프린트 중 입니다! 잠시만 기다려주세요!";
  const [displayText, setDisplayText] = useState("");
  const [loop, setLoop] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const bubbleRef = useRef(null);
  const [error, setError] = useState(null);
  const [loadingDots, setLoadingDots] = useState("");
  
  // API 호출 및 결과 처리
  useEffect(() => {
    const callApi = async () => {
      try {
        // 먼저 서버 상태 확인
        console.log('===== 타투 생성 프로세스 시작 =====');
        console.log('서버 상태 확인 중...');
        const isServerUp = await checkHealth();
        console.log('서버 상태:', isServerUp ? '정상' : '연결 실패');
        
        if (!isServerUp) {
          console.warn("서버 연결 실패: 계속 진행합니다.");
          setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
          // 서버 연결 실패 시에도 계속 진행
        }
        
        // localStorage에서 데이터 가져오기
        const capturedImage = localStorage.getItem('capturedImage');
        const selectedGender = localStorage.getItem('selectedGender') || 'male';
        const selectedStyle = localStorage.getItem('selectedStyle') || 'simple';

        console.log(`로컬 저장소 데이터: 성별=${selectedGender}, 스타일=${selectedStyle}`);
        console.log(`이미지 데이터 존재: ${Boolean(capturedImage)}`);
        
        if (capturedImage) {
          console.log(`이미지 데이터 크기: ${capturedImage.length} 바이트`);
        }
        
        // 캡처된 이미지 데이터 확인
        if (!capturedImage) {
          setError("캡처된 이미지가 없습니다. 다시 촬영해주세요.");
          setTimeout(() => navigate("/Picture"), 3000);
          return;
        }
        
        console.log(`타투 생성 API 요청 시작: 성별=${selectedGender}, 스타일=${selectedStyle}`);
        
        try {
          // 타투 생성 API 호출 (캡처된 이미지, 성별, 스타일 정보 전달)
          console.time('API 호출 시간');
          
          const result = await generateTattoo(
            capturedImage,
            selectedGender,
            selectedStyle
          );
          
          console.timeEnd('API 호출 시간');
          console.log('API 응답 결과:', result);
          
          if (result.success) {
            console.log('타투 생성 성공:', result.animal_type);
            // 결과 저장
            localStorage.setItem('tattooResult', JSON.stringify(result));
            console.log('결과가 localStorage에 저장됨');
            
            // 결과 페이지로 이동
            console.log('3초 후 결과 페이지로 이동합니다.');
            setTimeout(() => {
              navigate("/Result");
            }, 3000);
          } else {
            console.error('API 응답 오류:', result.error);
            setError(result.error || "타투 생성 중 오류가 발생했습니다.");
            
            // 오류 메시지 표시 후 스타일 선택 페이지로 돌아감
            setTimeout(() => {
              navigate("/Select");
            }, 5000);
          }
        } catch (apiError) {
          console.error('API 호출 중 예외 발생:', apiError);
          setError(`API 오류: ${apiError.message}`);
          
          setTimeout(() => {
            navigate("/Select");
          }, 5000);
        }
      } catch (error) {
        console.error("전체 처리 오류:", error);
        setError(`서버 연결 문제: ${error.message}`);
        
        // 오류 메시지 표시 후 스타일 선택 페이지로 돌아감
        setTimeout(() => {
          navigate("/Select");
        }, 5000);
      }
    };
    
    // API 호출 실행
    callApi();
    
    // 로딩 애니메이션을 위한 점 추가
    const dotsInterval = setInterval(() => {
      setLoadingDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(dotsInterval);
  }, [navigate]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        let newText = text.slice(0, index + 1);
        if ((index + 1) % 18 === 0) newText += "\n";
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

  return (
    <div className="app1-background">
      <img src={d_cloud} className="dark_cloud" alt="배경" />
      <Container fluid className="text-center">

        <Row className="character-row justify-content-center align-items-center">
          <Col xs={12} className="d-flex justify-content-center mb-4">
            <LoadingContainer>
              <LoadingCharacter src={cat} alt="로딩 캐릭터" />
              <Spinner animation="border" variant="primary" style={{ marginTop: '20px' }} />
              <LoadingText>타투 생성 중{loadingDots}</LoadingText>
              
              {error && (
                <div style={{ 
                  color: "red", 
                  marginTop: "20px", 
                  padding: "15px", 
                  backgroundColor: "rgba(255,255,255,0.9)", 
                  borderRadius: "8px",
                  border: "1px solid #ffcccc",
                  maxWidth: "80%",
                  textAlign: "center",
                  fontSize: "14px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  <strong>오류:</strong> {error}
                </div>
              )}
            </LoadingContainer> 
          </Col>
          
          <Col xs={12} sm={6} md={5} className="position-relative">
            <div className="bubble-container" ref={bubbleRef}>
              <img src={bubble} alt="말풍선" className="bubble-img" />
              <div className="bubble-text">
                <TextBox fontSize={fontSize}>{displayText}</TextBox>
              </div>
            </div>
          </Col>

          <Col xs={4} sm={3} md={2} className="d-flex justify-content-center">
            <img src={iland} alt="둥둥섬" className="iland" />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;