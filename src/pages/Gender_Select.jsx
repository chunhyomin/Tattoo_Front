import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Container, Row, Col } from "react-bootstrap";

import logo from "/logo.png";
import leaf from "/leaf.png";
import ch1 from "/f.png";
import ch2 from "/m.png";
import cloud from "/cloud.png";
import bubble from "/말풍선.png";
import btimg2 from "/buttonimg2.png";

import "bootstrap/dist/css/bootstrap.min.css";
import "./page2.css";
import "../App.css";

const TextBox = styled.p`
  font-size: ${({ fontSize }) => fontSize}px;
  font-weight: 700;
  color: #8B8B8B;
  white-space: pre-line;
  margin: 0;
  word-break: keep-all;
`;

function App() {
  const navigate = useNavigate();
  const text = "당신의 성별에 맞는 캐릭터를 선택해 주세요!";
  const [displayText, setDisplayText] = useState("");
  const [loop, setLoop] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const bubbleRef = useRef(null);
  const [selectedGender, setSelectedGender] = useState(null);

  const handleCharacterClick = (gender) => {
    console.log(gender);
    setSelectedGender(gender);
    
    // 성별에 해당하는 API 파라미터 값 설정
    const genderParam = gender === "남자" ? "male" : "female";
    
    // localStorage에 성별 정보 저장
    localStorage.setItem('selectedGender', genderParam);
  };

  const handleStartClick = () => {
    if (!selectedGender) {
      alert("성별을 선택해주세요!");
    } else {
      // Picture 페이지 대신 Select 페이지로 이동 (스타일 선택)
      navigate("/Picture");
    }
  };

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
      <img src={cloud} className="cloud-bg" alt="배경" />

      <Container fluid className="text-center">
        <div className="position-absolute top-0 end-0 p-3">
          <img src={leaf} alt="나뭇잎" className="leaf-img" />
        </div>

        <Row className="justify-content-center mt-3">
          <Col xs={6} sm={4} md={3}>
            <img
              src={ch1}
              style={{ cursor: "pointer" }}
              alt="캐릭터1"
              className={`char2-img char2-left ${selectedGender === "여자" ? "selected" : ""}`}
              onClick={() => handleCharacterClick("여자")}
            />
          </Col>
          <Col xs={6} sm={4} md={3}>
            <img
              src={ch2}
              style={{ cursor: "pointer" }}
              alt="캐릭터2"
              className={`char2-img char2-right ${selectedGender === "남자" ? "selected" : ""}`}
              onClick={() => handleCharacterClick("남자")}
            />
          </Col>
        </Row>

        <Row className="justify-content-center mt-3">
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

              {selectedGender && (
                <img
                  src={btimg2}
                  alt="시작 버튼"
                  className="start-btn"
                  onClick={handleStartClick}
                />
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;