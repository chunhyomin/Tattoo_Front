import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Container, Row, Col } from "react-bootstrap";

import logo from "/logo.png";
import leaf from "/leaf.png";
import ch1 from "/여울이.png";
import ch2 from "/너굴맨.png";
import cloud from "/cloud.png";
import bubble from "/말풍선.png";
import btimg from "/buttonimg.png";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

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
      <img src={cloud} className="cloud-bg" alt="배경" />

      <Container fluid className="text-center">
        <div className="position-absolute top-0 end-0 p-3">
          <img src={leaf} alt="나뭇잎" className="leaf-img" />
        </div>

        <Row className="justify-content-center mt-5">
          <Col xs={8} md={6}>
            <img src={logo} alt="로고" className="logo-img" />
          </Col>
        </Row>

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
              <img
                src={btimg}
                alt="시작 버튼"
                className="start-btn"
                onClick={() => navigate("/page2")}
              />
            </div>
          </Col>
          <Col xs={4} sm={3} md={2} className="d-flex justify-content-center">
            <img src={ch2} alt="캐릭터2" className="char-img" />
          </Col>
        </Row>
      </Container>

      <div className="grass-bottom"></div>
    </div>
  );
}

export default App;