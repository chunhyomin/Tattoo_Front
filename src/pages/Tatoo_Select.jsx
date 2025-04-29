    import { useNavigate } from "react-router-dom";
    import { useState, useEffect, useRef } from "react";
    import styled from "styled-components";
    import { Container, Row, Col } from "react-bootstrap";
    import { getImageUrl } from "../tattoo_api.js";

    import leaf from "/leaf.png";
    import cloud from "/cloud.png";
    import minib1 from "/minibutton1.png";
    import minib2 from "/minibutton2.png";
    import bubble from "/말풍선.png";

    import "bootstrap/dist/css/bootstrap.min.css";
    import "./Tatoo_Select.css";
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
    const text = "당신과 닮은 동물의 타투가 생성되었습니다!";
    const [displayText, setDisplayText] = useState("");
    const [loop, setLoop] = useState(0);
    const [fontSize, setFontSize] = useState(16);
    const bubbleRef = useRef(null);

    const [selectedPicture, setSelectedPicture] = useState(null);
    const [selectedTattoos, setSelectedTattoos] = useState([]);
    
    // API 결과 데이터
    const [resultData, setResultData] = useState(null);
    const [animalType, setAnimalType] = useState(""); 
    const [animalDescription, setAnimalDescription] = useState("");
    const [animalTraits, setAnimalTraits] = useState([]);
    const [tattooImages, setTattooImages] = useState([]);
    const [letteringImage, setLetteringImage] = useState("");
    const [finalDisplayImage, setFinalDisplayImage] = useState("");
    const [latinInfo, setLatinInfo] = useState("");
    const [apiResponded, setApiResponded] = useState(false);

    useEffect(() => {
        console.log("타투 결과 페이지 로드됨");
        
        // API 결과 데이터 가져오기
        const savedResult = localStorage.getItem('tattooResult');
        
        if (savedResult) {
            try {
                const parsedResult = JSON.parse(savedResult);
                console.log("저장된 타투 결과 데이터:", parsedResult);
                setResultData(parsedResult);
                setApiResponded(true);
                
                // 동물 정보 설정
                if (parsedResult.animal_type || parsedResult.animalType) {
                    const typeValue = parsedResult.animal_type || parsedResult.animalType;
                    const formattedAnimalType = typeValue.charAt(0).toUpperCase() + typeValue.slice(1).toLowerCase();
                    setAnimalType(formattedAnimalType);
                    console.log("동물 타입 설정:", formattedAnimalType);
                } else if (parsedResult.tattooImage) {
                    // 파일 이름에서 동물 타입을 추출 시도
                    const fileNameMatch = parsedResult.tattooImage.match(/_(.*?)_/);
                    if (fileNameMatch && fileNameMatch[1]) {
                        const extractedType = fileNameMatch[1].charAt(0).toUpperCase() + fileNameMatch[1].slice(1);
                        setAnimalType(extractedType);
                        console.log("파일명에서 동물 타입 추출:", extractedType);
                    }
                }
                
                // 동물 설명 설정
                if (parsedResult.description) {
                    setAnimalDescription(parsedResult.description);
                }
                
                // API에서 받은 동물 특성 설정
                if (parsedResult.traits && Array.isArray(parsedResult.traits)) {
                    setAnimalTraits(parsedResult.traits);
                }
                
                // 라틴어 정보 설정
                if (parsedResult.latin_info) {
                    setLatinInfo(parsedResult.latin_info);
                    // 라틴어 정보에서 첫 줄만 추출하여 설명에 추가
                    const firstLine = parsedResult.latin_info.split('\n')[0].trim();
                    if (firstLine && !animalDescription) {
                        setAnimalDescription(`당신과 닮은 동물은 ${animalType || ''}입니다. 라틴어로 "${firstLine}"`);
                    }
                }
                
                // 이미지 처리
                const processImages = () => {
                    // 타투 이미지 배열 처리
                    if (parsedResult.tattoo_images && Array.isArray(parsedResult.tattoo_images)) {
                        const validImages = parsedResult.tattoo_images.filter(img => img && typeof img === 'string');
                        if (validImages.length > 0) {
                            const imageUrls = validImages.map(img => getImageUrl(img));
                            setTattooImages(imageUrls);
                            console.log("타투 이미지 배열 설정:", imageUrls);
                            
                            // 첫 번째 이미지를 선택된 타투로 설정
                            if (imageUrls.length > 0) {
                                setSelectedTattoos([imageUrls[0]]);
                            }
                        }
                    } else if (parsedResult.tattooImage) {
                        // 단일 타투 이미지를 배열로 변환
                        let tattooImageArray = [];
                        
                        if (Array.isArray(parsedResult.tattooImage)) {
                            tattooImageArray = parsedResult.tattooImage.map(img => getImageUrl(img));
                        } else {
                            tattooImageArray = [getImageUrl(parsedResult.tattooImage)];
                        }
                        
                        setTattooImages(tattooImageArray);
                        console.log("단일 타투 이미지를 배열로 설정:", tattooImageArray);
                        
                        // 첫 번째 이미지를 선택된 타투로 설정
                        if (tattooImageArray.length > 0) {
                            setSelectedTattoos([tattooImageArray[0]]);
                        }
                    }
                    
                    // 레터링 이미지 처리
                    if (parsedResult.lettering_image) {
                        const letteringUrl = getImageUrl(parsedResult.lettering_image);
                        setLetteringImage(letteringUrl);
                        console.log("레터링 이미지 설정:", letteringUrl);
                    } else if (parsedResult.letteringImage) {
                        const letteringUrl = getImageUrl(parsedResult.letteringImage);
                        setLetteringImage(letteringUrl);
                        console.log("레터링 이미지 설정:", letteringUrl);
                    }
                    
                    // 최종 디스플레이 이미지 처리
                    if (parsedResult.final_display_image) {
                        const displayUrl = getImageUrl(parsedResult.final_display_image);
                        setFinalDisplayImage(displayUrl);
                        console.log("최종 디스플레이 이미지 설정:", displayUrl);
                    } else if (parsedResult.finalDisplayImage) {
                        const displayUrl = getImageUrl(parsedResult.finalDisplayImage);
                        setFinalDisplayImage(displayUrl);
                        console.log("최종 디스플레이 이미지 설정:", displayUrl);
                    }
                };
                
                // 이미지 처리
                processImages();
                
            } catch (error) {
                console.error("결과 데이터 파싱 오류:", error);
            }
        } else {
            console.warn("타투 결과 데이터가 없습니다.");
        }
        
        // 선택된 이미지 가져오기
        const savedPicture = sessionStorage.getItem("selectedPictureData");
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

    // API에서 받은 결과가 없을 때 표시할 메시지
    const getDisplayMessage = () => {
        if (animalDescription) {
            return animalDescription;
        } else if (animalType) {
            return `당신과 닮은 동물은 ${animalType}입니다!`;
        } else {
            return "당신의 타투가 생성되었습니다!";
        }
    };

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
                <span>{animalType || "분석 중..."}</span>
                </div>
                {/* 동물 설명 추가 */}
                {animalDescription && (
                <div className="animal-description mt-2 p-2">
                    <p style={{ fontSize: '14px', color: '#555', textAlign: 'center' }}>
                    {animalDescription}
                    </p>
                    {animalTraits.length > 0 && (
                    <div className="animal-traits mt-1">
                        {animalTraits.map((trait, idx) => (
                        <span key={idx} className="trait-badge">
                            {trait}
                        </span>
                        ))}
                    </div>
                    )}
                </div>
                )}
            </Col>

            {/* 중간: 타투 선택 */}
            <Col xs={12} sm={12} md={4} className="d-flex justify-content-center align-items-center">
                <div className="tattoo-grid-fixed">
                {/* API에서 받은 타투 이미지들 표시 - 최대 4개(2x2 그리드) */}
                {tattooImages.slice(0, 4).map((imgSrc, i) => (
                    <div className="square-tattoo-container" key={`api-tattoo-${i}`}>
                    <button className="image-button" onClick={() => handleTatooClick(imgSrc)}>
                        <img
                        src={imgSrc}
                        alt={`타투 ${i + 1}`}
                        className={`tattoo-img ${
                            selectedTattoos.includes(imgSrc) ? "selected" : ""
                        }`}
                        onError={(e) => {
                            console.error("타투 이미지 로드 오류:", e);
                            e.target.onerror = null; // 무한 루프 방지
                            e.target.style.display = 'none'; // 오류 발생 시 숨김 처리
                        }}
                        />
                    </button>
                    </div>
                ))}
                
                {/* 고정된 2x2 그리드 형태를 유지하기 위해 빈 자리를 채움 */}
                {tattooImages.length < 4 && Array.from({ length: 4 - tattooImages.length }).map((_, i) => (
                    <div className="square-tattoo-container" key={`empty-tattoo-${i}`}>
                        <div className="empty-tattoo-space"></div>
                    </div>
                ))}
                </div>
            </Col>

            {/* 오른쪽: 도안 미리보기 */}
            <Col xs={12} sm={12} md={4} className="d-flex justify-content-center">
                <div className="image-card_2 a5-box" data-count={selectedTattoos.length}>
                <div className={`tattoo-grid count-${selectedTattoos.length}`}>
                    {selectedTattoos.map((tattoo, idx) => (
                    <img 
                        key={idx} 
                        src={tattoo} 
                        alt={`선택된 타투 ${idx + 1}`} 
                        className="selected-tattoo"
                        onError={(e) => {
                            console.error("선택된 타투 이미지 로드 오류:", e);
                            e.target.onerror = null; // 무한 루프 방지
                            e.target.style.display = 'none'; // 오류 발생 시 숨김 처리
                        }}
                    />
                    ))}
                </div>
                {/* 레터링 이미지가 있으면 그것을 사용 */}
                {letteringImage && (
                    <img 
                        src={letteringImage} 
                        alt="레터링" 
                        className="lettering-bottom"
                        onError={(e) => {
                            console.error("레터링 이미지 로드 오류:", e);
                            e.target.onerror = null; // 무한 루프 방지
                            e.target.style.display = 'none'; // 오류 발생 시 숨김 처리
                        }}
                    />
                )}
                </div>
            </Col>
            </Row>

            {/* 하단: 말풍선 + 버튼 */}
            <Row className="justify-content-center align-items-center mt-4 g-3">
            <Col xs={12} sm={6} md={5} className="position-relative d-flex justify-content-center">
                <div className="bubble4-container" ref={bubbleRef}>
                <img src={bubble} alt="말풍선" className="bubble4-img" />
                <div className="bubble4-text">
                    <TextBox fontSize={fontSize}>
                    {displayText || getDisplayMessage()}
                    </TextBox>
                </div>
                </div>
            </Col>

            {/* 버튼 영역 */}
            <Col xs={6} sm={3} md={2} className="d-flex justify-content-center">
                <img src={minib1} alt="인쇄하기" className="btn-icon" onClick={() => window.print()} />
                <img src={minib2} alt="돌아가기" className="btn-icon" onClick={() => navigate("/Picture_Select")} />
            </Col>
            </Row>
        </Container>
        </div>
    );
    }

    export default Page4;
