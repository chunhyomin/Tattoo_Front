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
    color: #8b8b8b;
    white-space: pre-line;
    margin: 0;
    word-break: keep-all;
    `;

    function Page4() {
    const navigate = useNavigate();
    const text = "원하는 타투 도안을 선택하세요!";
    const [displayText, setDisplayText] = useState("");
    const [loop, setLoop] = useState(0);
    const [fontSize, setFontSize] = useState(16);
    const bubbleRef = useRef(null);

    const [selectedPicture, setSelectedPicture] = useState(null);
    const [selectedTattoos, setSelectedTattoos] = useState([]);

    const tattooList = [tatoo1, tatoo2, tatoo3, tatoo4];

    useEffect(() => {
        const savedPicture = sessionStorage.getItem("selectedPicture");
        if (savedPicture) setSelectedPicture(savedPicture);
    }, []);

    const handleTatooClick = (imgSrc) => {
        if (selectedTattoos.includes(imgSrc)) {
        setSelectedTattoos(selectedTattoos.filter((item) => item !== imgSrc));
        } else if (selectedTattoos.length < 4) {
        setSelectedTattoos([...selectedTattoos, imgSrc]);
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
        <div className="app4-background">
        <img src={cloud} className="cloud-bg position-absolute top-0 start-0 w-100" alt="배경" />

        <Container fluid className="text-center py-4">
            <div className="position-absolute top-0 end-0 p-3">
            <img src={leaf} alt="나뭇잎" className="leaf-img" />
            </div>

            <Row className="justify-content-center g-4">
            {/* 왼쪽: 선택된 사진 */}
            <Col xs={12} sm={12} md={4} className="d-flex flex-column align-items-center">
                <div className="panel-shape mb-2">
                {selectedPicture && (
                    <img src={selectedPicture} alt="선택된 사진" className="selected-panel-image" />
                )}
                </div>
                <div className="banner">
                <span>고양이</span>
                </div>
            </Col>

            {/* 중간: 타투 선택 */}
            <Col xs={12} sm={12} md={4}>
                <Row className="g-2 justify-content-center">
                {tattooList.map((imgSrc, i) => (
                    <Col xs={6} sm={6} md={6} key={i}>
                    <button className="image-button" onClick={() => handleTatooClick(imgSrc)}>
                        <img
                        src={imgSrc}
                        alt={`타투 ${i + 1}`}
                        className={`img-fluid tattoo-img ${
                            selectedTattoos.includes(imgSrc) ? "selected" : ""
                        }`}
                        />
                    </button>
                    </Col>
                ))}
                </Row>
            </Col>

            {/* 오른쪽: 도안 미리보기 */}
            <Col xs={12} sm={12} md={4} className="d-flex justify-content-center">
                <div className="image-card_2 a5-box" data-count={selectedTattoos.length}>
                <div className={`tattoo-grid count-${selectedTattoos.length}`}>
                    {selectedTattoos.map((tattoo, idx) => (
                    <img key={idx} src={tattoo} alt={`선택된 타투 ${idx + 1}`} className="selected-tattoo" />
                    ))}
                </div>
                <img src={lettering} alt="레터링" className="lettering-bottom" />
                </div>
            </Col>
            </Row>

            {/* 하단: 말풍선 + 버튼 */}
            <Row className="justify-content-center align-items-center mt-4 g-3">
            <Col xs={12} sm={6} md={5} className="position-relative d-flex justify-content-center">
                <div className="bubble4-container" ref={bubbleRef}>
                <img src={bubble} alt="말풍선" className="bubble4-img" />
                <div className="bubble4-text">
                    <TextBox fontSize={fontSize}>{displayText}</TextBox>
                </div>
                </div>
            </Col>

            {/* 버튼 1 */}
            <Col xs={6} sm={3} md={2} className="d-flex justify-content-center">
                <img src={minib1} alt="인쇄하기" className="btn-icon" onClick={() => navigate("/page5")} />
            {/* 버튼 2 */}
                <img src={minib2} alt="돌아가기" className="btn-icon" onClick={() => navigate("/Picture_Select")} />
            </Col>
            </Row>
        </Container>
        </div>
    );
    }

    export default Page4;
