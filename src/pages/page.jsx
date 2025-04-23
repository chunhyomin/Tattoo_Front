    import { useNavigate } from "react-router-dom";
    import { useState, useEffect, useRef } from "react";
    import styled from "styled-components";
    import { Container, Row, Col } from "react-bootstrap";

    import leaf from "/leaf.png";
    import cloud from "/cloud.png";
    import minib1 from "/minibutton1.png";
    import minib2 from "/minibutton2.png";
    import bubble from "/말풍선.png";

    import tatoo1 from "../tatoo/tatoo1.png";
    import tatoo2 from "../tatoo/tatoo2.png";
    import tatoo3 from "../tatoo/tatoo3.png";
    import tatoo4 from "../tatoo/tatoo4.png";
    import lettering from "../tatoo/lettering.png";

    import "bootstrap/dist/css/bootstrap.min.css";
    import "./page4.css";
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
    const text =
    "원하는 타투 도안을 선택하세요!";
    const [displayText, setDisplayText] = useState("");
    const [loop, setLoop] = useState(0);
    const [fontSize, setFontSize] = useState(16);
    const bubbleRef = useRef(null);
    
    //추가
    const [selectedPicture, setSelectedPicture] = useState(null);
    const [selectedTattoos, setSelectedTattoos] = useState([]);

    useEffect(() => {
    const savedPicture = sessionStorage.getItem("selectedPicture");
    if (savedPicture) {
        setSelectedPicture(savedPicture);
    }
    }, []);
    
    const tattooList = [tatoo1, tatoo2, tatoo3, tatoo4];
    
    const handleTatooClick = (imgSrc) => {
    if (selectedTattoos.includes(imgSrc)) {
        setSelectedTattoos(selectedTattoos.filter((item) => item !== imgSrc));
    } else if (selectedTattoos.length < 4) {
        setSelectedTattoos([...selectedTattoos, imgSrc]);
    }
    };
    //추가

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
    <div className="app4-background">
        <img src={cloud} className="cloud-bg" alt="배경" />

        <Container fluid className="text-center">
        <div className="position-absolute top-0 end-0 p-3">
            <img src={leaf} alt="나뭇잎" className="leaf-img" />
        </div>

        <Row className="justify-content-center mt-5">
            <Col>
                <div className="panel-shape">
                    {selectedPicture && (
                        <img
                        src={selectedPicture}
                        alt="선택한 사진"
                        className="selected-panel-image"
                        />
                    )}
                </div>
                <div className="banner">
                    <span>고양이</span>
                </div>
            </Col>
            <Col>
                <div className="col-md-4 text-center">
                    <div className="row justify-content-center">
                    {tattooList.map((imgSrc, i) => (
                        <div key={i} className="col-6 col-sm-6 mb-3">
                        <button
                            className="image-button"
                            onClick={() => handleTatooClick(imgSrc)}
                        >
                            <img
                            src={imgSrc}
                            alt={`타투 ${i + 1}`}
                            className={`img-fluid tattoo-img ${
                                selectedTattoos.includes(imgSrc) ? "selected" : ""
                            }`}
                            />
                        </button>
                        </div>
                    ))}
                    </div>
                </div>
            </Col>
            <Col>
                <div className="col-md-4 text-center d-flex flex-column justify-content-start align-items-center">
                    <div className="image-card_2 a5-box" data-count={selectedTattoos.length}>
                    <div className={`tattoo-grid count-${selectedTattoos.length}`}>
                        {selectedTattoos.map((tattoo, idx) => (
                        <img
                            key={idx}
                            src={tattoo}
                            alt={`선택된 타투 ${idx + 1}`}
                            className="selected-tattoo"
                        />
                        ))}
                    </div>
                    <img src={lettering} alt="레터링" className="lettering-bottom" />
                    </div>
                </div>
            </Col>
        </Row>

        <Row className="character-row justify-content-center align-items-center">
            <Col xs={12} sm={6} md={5} className="position-relative">
            <div className="bubble-container" ref={bubbleRef}>
                <img src={bubble} alt="말풍선" className="bubble-img" />
                <div className="bubble-text">
                <TextBox fontSize={fontSize}>{displayText}</TextBox>
                </div>
            </div>
            </Col>

            <Col xs={4} sm={3} md={2} className="d-flex justify-content-center">
                <img
                    src={minib1}
                    alt="인쇄하기"
                    className="btn-icon"
                    onClick={() => navigate("/page5")}
                />
            </Col>
            <Col>
                <img
                    src={minib2}
                    alt="돌아가기"
                    className="btn-icon"
                    onClick={() => navigate("/page3")}
                />
            </Col>
        </Row>
        </Container>
    </div>
    );
    }

    export default App;
