import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Container, Row, Col } from "react-bootstrap";
import { checkHealth, generateTattoo } from "../tattoo_api";

import temp_back from "/img_background.png";
import ch1 from "/여울이.png";
import ch2 from "/너굴맨.png";
// import poto from "/초점.png";
import "../App.css";

// 애니메이션 정의
const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.9);
  }
`;

// 스타일 컴포넌트
const Page = styled.div`
  font-family: 'Noto Sans KR', sans-serif;
  background-image: url(${temp_back});
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
`;

const LoadingContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const LoadingSpinner = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: ${rotate} 2s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const StatusText = styled.div`
  margin-top: 10px;
  font-size: 14px;
  color: #666;
`;

const TimerText = styled.div`
  margin-top: 15px;
  font-size: 16px;
  color: #555;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 20px;
  margin: 15px 0;
  overflow: hidden;
`;

const Progress = styled.div`
  width: ${props => props.width || "0%"};
  height: 100%;
  background-color: #4caf50;
  border-radius: 20px;
  transition: width 0.5s ease;
`;

const Character = styled.img`
  position: absolute;
  bottom: 20px;
  ${props => (props.position === "left" ? "left: 20px;" : "right: 20px;")}
  width: 120px;
  z-index: 1;
`;

const ErrorContainer = styled.div`
  background-color: #fff8f8;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  text-align: left;
  color: #d32f2f;
`;

const App = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("서버 연결 중...");
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState(null);
  const [serverChecked, setServerChecked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);

  // 타이머 설정
  useEffect(() => {
    if (serverChecked && !error && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [serverChecked, error, timeRemaining]);

  // 서버 상태 체크
  const handleServerCheck = useCallback(async () => {
    try {
      const isHealthy = await checkHealth();
      console.log("서버 상태:", isHealthy);
      
      if (isHealthy) {
        setStatusText("서버 연결 완료");
        setProgress(10);
        setServerChecked(true);
      } else {
        throw new Error("서버와 연결할 수 없습니다.");
      }
    } catch (error) {
      console.error("서버 연결 오류:", error);
      setError("서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.");
    }
  }, []);

  // 타투 생성 요청
  const handleTattooGeneration = useCallback(async () => {
    try {
      setLoadingText("타투 생성 중...");
      setStatusText("이미지 분석 중");
      setProgress(30);

      // localStorage에서 필요한 데이터 가져오기
      const capturedImage = localStorage.getItem("capturedImage");
      const selectedGender = localStorage.getItem("selectedGender") || "male";
      const selectedStyle = localStorage.getItem("selectedStyle") || "minimal";

      if (!capturedImage) {
        throw new Error("이미지가 없습니다. 다시 촬영해주세요.");
      }

      console.log("타투 생성 요청:", {
        image: "이미지 데이터",
        gender: selectedGender,
        style: selectedStyle,
      });

      setProgress(50);
      setStatusText("동물 특성 분석 중");

      // 타투 생성 API 호출
      const response = await generateTattoo(
        capturedImage,
        selectedGender,
        selectedStyle
      );

      console.log("타투 생성 응답:", response);

      setProgress(90);
      setStatusText("결과 데이터 불러오는 중");

      // 결과 데이터 저장
      localStorage.setItem("tattooResult", JSON.stringify(response));

      setProgress(100);
      setStatusText("완료");

      // 결과 페이지로 이동
      setTimeout(() => {
        navigate("/Result");
      }, 1000);
    } catch (error) {
      console.error("타투 생성 오류:", error);
      
      // 에러 처리 개선
      let errorMessage = "타투 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
      
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('API 오류')) {
          errorMessage = "타투 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    }
  }, [navigate]);

  // 서버 체크 및 타투 생성 실행
  useEffect(() => {
    handleServerCheck();
  }, [handleServerCheck]);

  useEffect(() => {
    if (serverChecked && !error) {
      handleTattooGeneration();
    }
  }, [serverChecked, error, handleTattooGeneration]);

  return (
    <Page>
      <Character src={ch1} position="left" />
      <Character src={ch2} position="right" />
      
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>{loadingText}</LoadingText>
              
              <ProgressBar>
                <Progress width={`${progress}%`} />
              </ProgressBar>
              
              <StatusText>{statusText}</StatusText>
              
              {serverChecked && !error && timeRemaining > 0 && (
                <TimerText>예상 소요 시간: {timeRemaining}초</TimerText>
              )}
              
              {error && (
                <ErrorContainer>
                  <p><strong>오류:</strong> {error}</p>
                  <button 
                    className="btn btn-outline-danger btn-sm mt-2"
                    onClick={() => navigate('/Select')}
                  >
                    이전 화면으로 돌아가기
                  </button>
                </ErrorContainer>
              )}
            </LoadingContainer>
          </Col>
        </Row>
      </Container>
    </Page>
  );
};

export default App;