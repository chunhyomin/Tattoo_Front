import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Container, Row, Col, ProgressBar } from "react-bootstrap";


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


function App() {
  const navigate = useNavigate();
  const text =
    "AI를 활용하여 사용자와 닮은 동물을 매칭하는 시스템입니다. '시작하기'를 눌러 동물 타투 스티커를 받아보세요.";
  const [displayText, setDisplayText] = useState("");
  const [loop, setLoop] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const bubbleRef = useRef(null);
  const [progress, setProgress] = useState(65); // 예시 진행도, 백엔드에서 받아오면 업데이트 가능

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
    <div className="app2-background">
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
          {/* <Col xs={4} sm={3} md={2} className="d-flex justify-content-center">
            <img src={ch1} alt="캐릭터1" className="char-img" />
          </Col> */}

          <Col xs={14} sm={8} md={8}>
            <div
              className="d_bubble-container position-relative d-flex justify-content-center align-items-center"
              ref={bubbleRef}
            >
              <img src={d_bubble} alt="말풍선" className="bubble-img w-100" />
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{ padding: "2rem" }}
              >
                <TextBox fontSize={fontSize}>{displayText}</TextBox>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="justify-content-center align-items-center mt-4">
          <Col xs={8} sm={6} md={8}>
            { <ProgressBar now={progress} label={`${progress}%`} style={{ height: "30px" }} /> }
          </Col>
          <Col xs="auto">
           <img src={iland} alt="캐릭터2" style={{ height: "60px" }} />
          </Col>
        </Row>
      </Container>


    </div>
  );
}

export default App;