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


function App() {
  const navigate = useNavigate();
  const text = "카메라를 통해 자신의 모습을 촬영해주세요. 촬영 후 타투 생성하기를 눌러주세요.";
  const [displayText, setDisplayText] = useState("");
  const [loop, setLoop] = useState(0);
  const [fontSize, setFontSize] = useState(1);
  const bubbleRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGender, setSelectedGender] = useState('male'); // 기본값 male
  const [selectedStyle, setSelectedStyle] = useState('simple'); // 기본값 simple

  // 성별 정보 로드
  useEffect(() => {
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



const handleCapture = () => { //화면 캡쳐쳐
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.translate(canvas.width, 0); // 좌우반전 설정
  ctx.scale(-1, 1);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageDataUrl = canvas.toDataURL("image/png"); //PC다운로드 폴더에 png로 저장
  setCapturedImage(imageDataUrl);
};



const handleDownload = () => {
  const base64Data = capturedImage.split(',')[1]; // 'data:image/png;base64,...' → base64 부분만 추출
  const blob = new Blob([base64Data], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "encoded_image.txt";
  link.click();
};

// 이미지 전송 함수 수정 - 이미지 저장 후 로딩 페이지로 이동
const sendImageToBackend = async () => {
  if (capturedImage) {
    try {
      setLoading(true);
      setError(null);
      
      console.log('캡처된 이미지 처리 시작');
      
      // 이미지 정보 로깅 (크기 확인용)
      const imageSize = capturedImage.length;
      console.log(`이미지 데이터 크기: ${imageSize} 바이트`);
      
      // 이미지와 성별, 스타일 정보를 localStorage에 저장
      localStorage.setItem('capturedImage', capturedImage);
      localStorage.setItem('selectedGender', selectedGender);
      localStorage.setItem('selectedStyle', selectedStyle);
      
      console.log(`이미지 저장 완료: 성별=${selectedGender}, 스타일=${selectedStyle}`);
      
      // 이제 스타일은 이미 선택됐으므로 바로 로딩 페이지로 이동
      setLoading(false);
      navigate('/Loading');
    } catch (error) {
      console.error('이미지 저장 오류:', error);
      setLoading(false);
      setError('이미지 저장 중 오류가 발생했습니다.');
    }
  } else {
    setError('먼저 사진을 촬영해주세요.');
  }
};

// 이전 페이지로 이동
const goBack = () => {
  navigate('/Gender_Select');
};



  return (
    
    <Container style={{ minHeight: "120vh" }}>
      <Row className="one">
        <div className="App">
          <img className="cloudimg" src={cloud} />
        <Col>
        <video
          className="video_type"
          ref={videoRef}
          style={{ transform: "scaleX(-1)" }} // 좌우 반전 적용
        ></video>
        </Col>
        </div>
      </Row>
      <Row className="three" style={{ marginTop: "30px", textAlign: "center" }}>
        <Col>
          {/* 촬영 버튼 */}
          <button onClick={handleCapture} style={{ padding: "10px 20px", fontSize: "16px", marginRight: "10px" }}>
            촬영하기
          </button>

          {/* 저장 버튼 (캡처된 이미지 있을 때만 표시) */}
          {capturedImage && (
            <>
              <button onClick={handleDownload} style={{ padding: "10px 20px", fontSize: "16px", marginRight: "10px" }}>
                이미지 저장
              </button>
              
              {/* 타투 생성 버튼 추가 */}
              <button 
                // onClick={sendImageToBackend}
                onClick={() => navigate("/Picture_Select")}
                disabled={loading}
                style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: loading ? "#ccc" : "#007bff", color: "white" }}
              >
                {loading ? "처리 중..." : "타투 생성하기"}
              </button>
            </>
          )}
          
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

{/* 비디오 캡처용 임시 코드 */}
      {/* {capturedImage && (
      <Row className="four" style={{ marginTop: "20px", textAlign: "center" }}>
        <Col>
          <img src={capturedImage} alt="캡처 미리보기" style={{ maxWidth: "100%", border: "2px solid #ccc" }} />
        </Col>
      </Row>
      )} */}


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

            {/* 버튼 이미지 - 촬영하기 기능으로 변경 */}
            <img
              className="button-img"
              src={btimg}
              onClick={handleCapture}
              style={{
                width: "150px",
                marginTop: "20px",
                cursor: "pointer",
              }}
              alt="촬영 버튼"
            />
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