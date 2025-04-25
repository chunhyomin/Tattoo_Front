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
import btimg2 from "/buttonimg2.png";
import a from "../buttons/a.png"
import b from "../buttons/b.png"
import c from "../buttons/c.png"
import d from "../buttons/d.png"

import picture1 from "../picture/picture1.png";
import picture2 from "../picture/picture2.png";
import picture3 from "../picture/picture3.png";
import picture4 from "../picture/picture4.png";

import "bootstrap/dist/css/bootstrap.min.css";
import "./Picture_Select.css";
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
  const text = "마음에 드는 사진 한 장과 원하는 스타일을 하나 선택해 주세요!";
  const [displayText, setDisplayText] = useState("");
  const [loop, setLoop] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const bubbleRef = useRef(null);
  const [selectedPictureIndex, setSelectedPictureIndex] = useState(null);

  const pictureList = [picture1, picture2, picture3, picture4];

  const handleImageClick = (index, src) => {
    const fileName = src.split("/").pop();
    console.log("선택한 파일명:", fileName);
    setSelectedPictureIndex(index);
    sessionStorage.setItem("selectedPicture", src); // 선택된 이미지 저장
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
    <div className="app3-background">
      <img src={cloud} className="cloud-bg" alt="배경" />

      <Container fluid className="text-center">
        <div className="position-absolute top-0 end-0 p-3">
          <img src={leaf} alt="나뭇잎" className="leaf-img" />
        </div>

        {/* 사진 영역 */}
        <div className="picture-row mt-5">
          {pictureList.map((pic, index) => (
            <div key={index}>
              <img
                src={pic}
                alt={`사진${index + 1}`}
                className={`picture-img ${selectedPictureIndex === index ? "selected-picture" : ""}`}
                onClick={() => handleImageClick(index, pic)}
                style={{ cursor: "pointer" }}
              />
            </div>
          ))}
        </div>

                {/* 버튼 영역 */}
        <div className="button-row">
          {[a, b, c, d].map((btn, index) => (
            <img
              key={index}
              src={btn}
              alt={`버튼${index + 1}`}
              className="option-button"
              onClick={() => console.log(`버튼 ${index + 1} 클릭됨`)}
            />
          ))}
        </div>

        {/* 캐릭터 + 말풍선 + 버튼 */}
        <Row className="character-row justify-content-center align-items-center mt-4">
          <Col xs={4} sm={3} md={2} className="d-flex justify-content-center">
            <img src={ch1} alt="캐릭터1" className="char-img" />
          </Col>

          <Col xs={12} sm={6} md={5} className="position-relative">
            <div className="bubble-container" ref={bubbleRef}>
              <img src={bubble} alt="말풍선" className="bubble-img" />
              <div className="bubble-text">
                <TextBox fontSize={fontSize}>{displayText}</TextBox>
              </div>

              {selectedPictureIndex !== null && (
                <img
                  src={btimg2}
                  alt="버튼"
                  className="start-btn"
                  onClick={() => navigate("/Loading_h")}
                />
              )}
            </div>
          </Col>

          <Col xs={4} sm={3} md={2} className="d-flex justify-content-center">
            <img src={ch2} alt="캐릭터2" className="char-img" />
          </Col>
        </Row>
      </Container>

      <div className="grass-bottom3"></div>
    </div>
  );
}

export default App;