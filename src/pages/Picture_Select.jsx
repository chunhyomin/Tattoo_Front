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

// 스타일 이름과 값 매핑
const STYLE_TYPES = [
  { key: 0, name: "심플하게", value: "simple" },
  { key: 1, name: "귀엽게", value: "cute" },
  { key: 2, name: "예쁘게", value: "pretty" },
  { key: 3, name: "시크하게", value: "chic" }
];

function App() {
  const navigate = useNavigate();
  const text = "마음에 드는 사진 한 장과 원하는 스타일을 하나 선택해 주세요!";
  const [displayText, setDisplayText] = useState("");
  const [loop, setLoop] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const bubbleRef = useRef(null);
  const [selectedPictureIndex, setSelectedPictureIndex] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);

  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('capturedImages') || '[]');
    setCapturedImages(savedImages);
    
    if (savedImages.length === 0) {
      alert("저장된 사진이 없습니다. 사진 촬영 페이지로 이동합니다.");
      navigate('/Picture');
    }
  }, [navigate]);

  const handleImageClick = (index, src) => {
    console.log("선택한 이미지 인덱스:", index);
    setSelectedPictureIndex(index);
    sessionStorage.setItem("selectedPicture", src);
  };

  const handleStyleClick = (index) => {
    setSelectedStyle(index);
    const styleValue = STYLE_TYPES[index].value;
    sessionStorage.setItem("selectedStyle", styleValue);
    localStorage.setItem("selectedStyle", styleValue);
    console.log("선택한 스타일:", STYLE_TYPES[index].name, "값:", styleValue);
  };

  const handleNextClick = () => {
    if (selectedPictureIndex !== null && selectedStyle !== null) {
      // 선택된 이미지
      const selectedImage = capturedImages[selectedPictureIndex];
      
      // 선택된 이미지 정보 저장
      sessionStorage.setItem("selectedPictureData", selectedImage);
      sessionStorage.setItem("selectedPictureIndex", selectedPictureIndex);
      
      // 선택된 스타일 값
      const styleValue = STYLE_TYPES[selectedStyle].value;
      sessionStorage.setItem("selectedStyleValue", styleValue);
      sessionStorage.setItem("selectedStyleName", STYLE_TYPES[selectedStyle].name);
      
      console.log('다음 단계로 이동:', {
        imageIndex: selectedPictureIndex,
        style: styleValue
      });
      
      // 로딩 페이지로 이동
      navigate('/Loading_h');
    } else {
      alert("사진과 스타일을 모두 선택해주세요.");
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
    <div className="app3-background mt-4">
      <img src={cloud} className="cloud-bg" alt="배경" />

      <Container fluid className="text-center">
        <div className="position-absolute top-0 end-0 p-3">
          <img src={leaf} alt="나뭇잎" className="leaf-img" />
        </div>

        <div className="picture-row mt-5">
          {capturedImages.slice(0, 2).map((pic, index) => (
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

        <div className="button-row">
          {[a, b, c, d].map((btn, index) => (
            <div 
              key={index} 
              className="style-button-wrapper"
              onClick={() => handleStyleClick(index)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={btn}
                alt={`스타일${index + 1}`}
                className={`option-button ${selectedStyle === index ? "selected-style" : ""}`}
                style={{ cursor: "pointer" }}
              />
              <p className="style-text">{STYLE_TYPES[index].name}</p>
            </div>
          ))}
        </div>

        <Row className="character-row justify-content-center align-items-center mt-4">
          <Col xs={4} sm={3} md={2} className="d-flex justify-content-center">
            <img src={ch1} alt="캐릭터1" className="char-img" />
          </Col>

          <Col xs={12} sm={6} md={5} className="position-relative">
            <div className="bubble-container" ref={bubbleRef}>
              <img src={bubble} alt="말풍선" className="bubble-img" />
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{ padding: "2rem" }}
              >
                <TextBox fontSize={fontSize}>{displayText}</TextBox>
              </div>

              {selectedPictureIndex !== null && selectedStyle !== null && (
                <img
                  src={btimg2}
                  alt="다음으로"
                  className="start-btn"
                  onClick={handleNextClick}
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