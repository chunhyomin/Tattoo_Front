    import { useNavigate } from "react-router-dom";
    import { useState, useEffect, useRef } from "react";
    import styled from "styled-components";
    import { Container, Row, Col } from "react-bootstrap";
    import { getImageUrl, createShareRecord } from "../tattoo_api.js";
    import html2canvas from "html2canvas";
    import jsPDF from "jspdf";

    import leaf from "/leaf.png";
    import cloud from "/cloud.png";
    import minib1 from "/minibutton1.png";
    import minib2 from "/minibutton2.png";
    import minib3 from "/minibutton3.png";
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
    const [processedLetteringImage, setProcessedLetteringImage] = useState("");
    const [originalLetteringPath, setOriginalLetteringPath] = useState("");
    const [finalDisplayImage, setFinalDisplayImage] = useState("");
    const [latinInfo, setLatinInfo] = useState("");
    const [apiResponded, setApiResponded] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    
    // 공유 관련 상태 추가
    const [isSharing, setIsSharing] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareInfo, setShareInfo] = useState(null);

    // PDF 생성 중 로딩 상태
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
    
    // A5 출력용 레이아웃 참조
    const a5BoxRef = useRef(null);

    // 상태 변수에 로딩 상태 추가
    const [isLetteringProcessing, setIsLetteringProcessing] = useState(false);

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
                        setAnimalDescription(` ${firstLine} \n\n 자세한 해석은 QR코드 참고해주세요!`);
                    }
                }
                
                // 페이지 로드 시 자동으로 공유 레코드 생성 및 QR 코드 표시 (0.5초 후 실행)
                setTimeout(async () => {
                    try {
                        // 현재 결과 데이터를 기반으로 공유 데이터 생성
                        const shareData = {
                            display_path: parsedResult.display_image,
                            tattoo_paths: parsedResult.tattoo_images,
                            lettering_path: parsedResult.lettering_image,
                            style: parsedResult.style || 'simple'
                        };
                        
                        console.log("자동 공유 데이터:", shareData);
                        
                        const shareResult = await createShareRecord(shareData);
                        console.log("자동 공유 결과:", shareResult);
                        
                        if (shareResult.success) {
                            // 로그에서 확인된 방식으로 완전한 QR 코드 URL
                            let completeQrUrl = '';
                            
                            // 1. qr_filename이 있는 경우
                            if (shareResult.qr_filename) {
                                completeQrUrl = `/api/images/${shareResult.qr_filename}`;
                                console.log("자동 QR 코드 URL (qr_filename):", completeQrUrl);
                            }
                            // 2. token이 있는 경우 URL 패턴에서 추출
                            else if (shareResult.share_url) {
                                const tokenMatch = shareResult.share_url.match(/\/share\/([^\/\?]+)/);
                                if (tokenMatch && tokenMatch[1]) {
                                    const token = tokenMatch[1];
                                    completeQrUrl = `/api/images/${token}_qr.png`;
                                    console.log("자동 QR 코드 URL (token):", completeQrUrl);
                                }
                            }
                            // 3. qr_url이 직접 제공된 경우
                            else if (shareResult.qr_url) {
                                completeQrUrl = shareResult.qr_url;
                                console.log("자동 QR 코드 URL (qr_url):", completeQrUrl);
                            }
                            
                            // 공유 URL 및 QR 코드 정보 저장
                            setShareInfo({
                                shareUrl: shareResult.share_url,
                                qrUrl: completeQrUrl,
                                expiresAt: new Date(shareResult.expires_at * 1000)
                            });
                            
                            // QR 코드 URL 설정
                            if (completeQrUrl) {
                                setQrCodeUrl(completeQrUrl);
                                console.log("최종 자동 QR 코드 URL:", completeQrUrl);
                            }
                        }
                    } catch (error) {
                        console.error('자동 타투 공유 오류:', error);
                        // 오류 발생 시 조용히 실패 (사용자에게 알림 표시하지 않음)
                    }
                }, 10); // 0.5초에서 10ms로 변경 (최소한의 딜레이만 유지)
                
                // QR 코드 URL 설정 (기존 로직 유지)
                if (parsedResult.qr_code_url) {
                    // qr_code_url이 직접 제공된 경우
                    const qrUrl = getImageUrl(parsedResult.qr_code_url);
                    setQrCodeUrl(qrUrl);
                    console.log("QR 코드 URL 설정 (직접):", qrUrl);
                } else if (parsedResult.share_id) {
                    // share_id가 있는 경우
                    const qrPath = `shares/${parsedResult.share_id}_qr.png`;
                    const qrUrl = getImageUrl(qrPath);
                    setQrCodeUrl(qrUrl);
                    console.log("QR 코드 URL 설정 (share_id 기반):", qrUrl);
                } else if (parsedResult.id) {
                    // id만 있는 경우
                    const qrPath = `shares/${parsedResult.id}_qr.png`;
                    const qrUrl = getImageUrl(qrPath);
                    setQrCodeUrl(qrUrl);
                    console.log("QR 코드 URL 설정 (id 기반):", qrUrl);
                } else {
                    // QR 코드 URL이 없는 경우 공유 데이터를 미리 생성
                    console.log("QR 코드 URL이 없습니다. 자동으로 공유 데이터를 생성합니다.");
                    // (여기는 위의 코드에서 처리함)
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
                        setOriginalLetteringPath(parsedResult.lettering_image);
                        console.log("레터링 이미지 설정:", letteringUrl);
                        
                        // 레터링 후처리 API 호출은 별도로 처리
                    } else if (parsedResult.letteringImage) {
                        const letteringUrl = getImageUrl(parsedResult.letteringImage);
                        setLetteringImage(letteringUrl);
                        setOriginalLetteringPath(parsedResult.letteringImage);
                        console.log("레터링 이미지 설정:", letteringUrl);
                        
                        // 레터링 후처리 API 호출은 별도로 처리
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

    // 타투 이미지 선택 처리 함수 수정
    const handleTatooClick = (imgSrc) => {
        // 이미 선택된 타투를 클릭한 경우 - 선택 해제 대신 중복 선택 허용
        if (selectedTattoos.includes(imgSrc)) {
            // 최대 4개까지만 추가 가능
            if (selectedTattoos.length < 4) {
                setSelectedTattoos([...selectedTattoos, imgSrc]);
            }
        } else if (selectedTattoos.length < 4) {
            // 새로운 타투 선택
            setSelectedTattoos([...selectedTattoos, imgSrc]);
        }
    };

    // A5 박스 내 타투 클릭 시 선택 취소 함수 추가
    const handleSelectedTattooClick = (imgSrc) => {
        setSelectedTattoos(selectedTattoos.filter((item) => item !== imgSrc));
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

    // PDF 변환 후 인쇄하는 함수
    const handlePrint = () => {
        // 기존 프린트 프레임 제거
        const existingFrame = document.getElementById('printFrame');
        if (existingFrame) {
            document.body.removeChild(existingFrame);
        }

        setIsPdfGenerating(true);
        
        // A5 요소 확인
        const a5Element = a5BoxRef.current;
        if (!a5Element) {
            console.error("인쇄할 요소를 찾을 수 없습니다.");
            setIsPdfGenerating(false);
            return;
        }
        
        // A5 규격: 148mm x 210mm (너비 x 높이)
        const a5Width = 148;
        const a5Height = 210;
        
        // 인쇄 전 스타일 백업
        const originalStyle = {
            background: a5Element.style.background
        };
        
        // QR 코드 스타일 백업 및 최적화
        const qrCode = a5Element.querySelector('.qr-code');
        let qrCodeOriginalStyle = null;
        
        if (qrCode) {
            // 원래 스타일 저장
            qrCodeOriginalStyle = {
                width: qrCode.style.width,
                height: qrCode.style.height,
                border: qrCode.style.border,
                marginRight: qrCode.style.marginRight,
                marginBottom: qrCode.style.marginBottom
            };
            
            // QR 코드 크기와 위치 최적화
            qrCode.style.width = '18mm';     // 크기를 줄임
            qrCode.style.height = '18mm';    // 크기를 줄임
            qrCode.style.border = '1px solid #000';
            qrCode.style.marginRight = '5mm'; // 우측 여백 증가
            qrCode.style.marginBottom = '3mm'; // 하단 여백 추가
        }
        
        // 인쇄를 위한 스타일 적용
        a5Element.style.background = 'white';
        
        // html2canvas 옵션
        const canvasOptions = {
            scale: 2, // 고해상도 설정
            useCORS: true, // 외부 이미지 허용
            allowTaint: true,
            backgroundColor: 'white',
            logging: false
        };
        
        // 요소를 캔버스로 캡처
        html2canvas(a5Element, canvasOptions).then(canvas => {
            // 캔버스 데이터를 이미지로 변환
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            // 원래 스타일 복원
            a5Element.style.background = originalStyle.background;
            if (qrCode && qrCodeOriginalStyle) {
                qrCode.style.width = qrCodeOriginalStyle.width;
                qrCode.style.height = qrCodeOriginalStyle.height;
                qrCode.style.border = qrCodeOriginalStyle.border;
                qrCode.style.marginRight = qrCodeOriginalStyle.marginRight;
                qrCode.style.marginBottom = qrCodeOriginalStyle.marginBottom;
            }
            
            // PDF 생성 (A5 크기)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [a5Width, a5Height],
                compress: true
            });
            
            // PDF에 이미지 추가 (여백 없이)
            pdf.addImage(imgData, 'JPEG', 0, 0, a5Width, a5Height);
            
            // iframe을 이용한 PDF 표시 및 인쇄
            const printFrame = document.createElement('iframe');
            printFrame.id = 'printFrame';
            printFrame.style.position = 'fixed';
            printFrame.style.right = '0';
            printFrame.style.bottom = '0';
            printFrame.style.width = '0'; // 보이지 않게 설정
            printFrame.style.height = '0'; // 보이지 않게 설정
            printFrame.style.border = 'none';
            printFrame.style.opacity = '0'; // 투명하게 설정
            document.body.appendChild(printFrame);
            
            // PDF 데이터
            const pdfData = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfData);
            
            // iframe 로드 완료 후 처리
            printFrame.onload = function() {
                try {
                    // 인쇄 대화상자 표시
                    printFrame.contentWindow.print();
                    
                    // 인쇄 대화상자가 닫히면 iframe 정리 (약 10초 후)
                    setTimeout(() => {
                        // iframe이 아직 문서에 있는지 확인
                        if (document.body.contains(printFrame)) {
                            document.body.removeChild(printFrame);
                            URL.revokeObjectURL(pdfUrl);
                            console.log('인쇄 iframe 정리 완료');
                        }
                    }, 10000);
                    
                    // 로딩 상태 해제
                    setIsPdfGenerating(false);
                } catch (e) {
                    console.error('인쇄 오류:', e);
                    setIsPdfGenerating(false);
                    
                    // 오류 발생 시 즉시 정리
                    if (document.body.contains(printFrame)) {
                        document.body.removeChild(printFrame);
                        URL.revokeObjectURL(pdfUrl);
                    }
                }
            };
            
            // iframe 소스 설정
            printFrame.src = pdfUrl;
        }).catch(err => {
            console.error("PDF 생성 오류:", err);
            
            // 오류 발생 시 원래 스타일로 복원
            a5Element.style.background = originalStyle.background;
            if (qrCode && qrCodeOriginalStyle) {
                qrCode.style.width = qrCodeOriginalStyle.width;
                qrCode.style.height = qrCodeOriginalStyle.height;
                qrCode.style.border = qrCodeOriginalStyle.border;
                qrCode.style.marginRight = qrCodeOriginalStyle.marginRight;
                qrCode.style.marginBottom = qrCodeOriginalStyle.marginBottom;
            }
            
            setIsPdfGenerating(false);
        });
    };

    // useEffect 추가 - 레터링 이미지 경로가 설정되면 후처리 API 호출
    useEffect(() => {
        // 레터링 이미지 경로가 있고 현재 처리 중이 아닐 때만 실행
        if (originalLetteringPath && !isLetteringProcessing && !processedLetteringImage) {
            console.log("레터링 이미지 후처리 시작:", originalLetteringPath);
            processLetteringImage(originalLetteringPath);
        }
    }, [originalLetteringPath, isLetteringProcessing, processedLetteringImage]);

    // processLetteringImage 함수 수정
    const processLetteringImage = async (imagePath) => {
        if (!imagePath) {
            console.error("유효한 레터링 이미지 경로가 없습니다.");
            return;
        }
        
        try {
            // 처리 시작 시 로딩 상태 설정
            setIsLetteringProcessing(true);
            console.log("레터링 후처리 API 호출 원본 경로:", imagePath);
            
            // 이미지 경로에서 UUID와 파일명만 추출
            let apiImagePath = imagePath;
            
            // 정규식으로 UUID-파일명 패턴 추출
            const uuidPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/[^\/]+)$/i;
            const match = imagePath.match(uuidPattern);
            
            if (match && match[1]) {
                apiImagePath = match[1];
                console.log("추출된 UUID 경로:", apiImagePath);
            } else {
                // 다른 방식으로 시도 - 마지막 두 부분만 추출
                const parts = imagePath.split('/');
                if (parts.length >= 2) {
                    apiImagePath = `${parts[parts.length-2]}/${parts[parts.length-1]}`;
                    console.log("대체 추출 경로:", apiImagePath);
                }
            }
            
            // 확장자가 있는지 확인하고 필요시 추가
            if (!apiImagePath.endsWith('.png') && !apiImagePath.endsWith('.jpg') && !apiImagePath.endsWith('.jpeg')) {
                apiImagePath += '.png';
                console.log("확장자 추가된 경로:", apiImagePath);
            }
            
            console.log("API에 전달할 최종 이미지 경로:", apiImagePath);
            
            const response = await fetch('/api/post-process-lettering', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_path: apiImagePath,
                    options: {
                        padding: 10
                    }
                }),
            });
            
            const data = await response.json();
            console.log("레터링 후처리 API 응답:", data);
            
            if (data.success) {
                console.log("레터링 후처리 성공:", data);
                // 결과 이미지 경로 확인
                console.log("처리된 이미지 경로:", data.processed_image);
                
                // 크롭된 레터링 이미지 URL 설정
                const processedUrl = getImageUrl(data.processed_image);
                console.log("최종 이미지 URL:", processedUrl);
                
                // 상태 업데이트
                setProcessedLetteringImage(processedUrl);
                
                // 이미지 로드 여부 확인
                const img = new Image();
                img.onload = () => console.log("크롭된 이미지 로드 성공!");
                img.onerror = (e) => console.error("크롭된 이미지 로드 실패:", e);
                img.src = processedUrl;
            } else {
                console.error("레터링 후처리 실패:", data.error);
                
                // 원본 이미지 관련 로깅
                console.log("원본 레터링 이미지 경로:", originalLetteringPath);
                console.log("원본 레터링 이미지 URL:", letteringImage);
            }
        } catch (error) {
            console.error("레터링 후처리 API 호출 오류:", error);
        } finally {
            // 처리 완료 시 로딩 상태 해제
            setIsLetteringProcessing(false);
        }
    };

    // 이미지 URL 수동 테스트 함수 개선
    const testLetteringImageUrl = () => {
        if (originalLetteringPath) {
            // 이미지 경로에서 필요한 부분만 추출
            const parts = originalLetteringPath.split('/');
            let baseName = parts[parts.length-1].split('.')[0];
            let folderName = "";
            
            // 폴더 이름 추출 (UUID 형식인 경우)
            if (parts.length >= 2) {
                const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
                if (uuidPattern.test(parts[parts.length-2])) {
                    folderName = parts[parts.length-2] + "/";
                }
            }
            
            // 여러 가능한 경로 패턴 시도
            const possiblePaths = [
                `${folderName}${baseName}_lettering_processed.png`,
                `${baseName}_lettering_processed.png`,
                `${originalLetteringPath.split('.')[0]}_lettering_processed.png`
            ];
            
            console.log("가능한 경로 패턴들:", possiblePaths);
            
            // 첫 번째 패턴 시도
            const testPath = possiblePaths[0];
            console.log("테스트 경로:", testPath);
            
            // URL 생성
            const testUrl = getImageUrl(testPath);
            console.log("테스트 URL:", testUrl);
            
            // 테스트 URL 설정
            setProcessedLetteringImage(testUrl);
            
            // 이미지 로드 테스트
            const img = new Image();
            img.onload = () => console.log("테스트 이미지 로드 성공!");
            img.onerror = (e) => {
                console.error("첫 번째 테스트 이미지 로드 실패, 두 번째 패턴 시도:", e);
                const secondTestUrl = getImageUrl(possiblePaths[1]);
                setProcessedLetteringImage(secondTestUrl);
            };
            img.src = testUrl;
        }
    };

    // 페이지 로드 후 5초 후에 URL 테스트 실행 (디버깅용)
    useEffect(() => {
        if (originalLetteringPath && !processedLetteringImage) {
            const timer = setTimeout(() => {
                console.log("5초 후 URL 테스트 실행");
                if (!processedLetteringImage) {
                    console.log("처리된 이미지가 없어 수동 테스트 실행");
                    testLetteringImageUrl();
                }
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [originalLetteringPath, processedLetteringImage]);

    return (
        <div className="app4-background">
        <img src={cloud} className="cloud-bg position-absolute top-0 start-0 w-100" alt="배경" />

        {/* 공유 모달 추가 */}
        {showShareModal && shareInfo && (
            <div 
                className="share-modal"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
                onClick={() => setShowShareModal(false)}
            >
                <div 
                    className="modal-content"
                    style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        className="close-btn"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#555'
                        }}
                        onClick={() => setShowShareModal(false)}
                    >
                        &times;
                    </button>
                    <h3 style={{ textAlign: 'center' }}>타투 디자인 공유</h3>
                    
                    <img 
                        src={getImageUrl(shareInfo.qrUrl)} 
                        alt="QR 코드" 
                        style={{
                            display: 'block',
                            margin: '20px auto',
                            maxWidth: '200px',
                            border: '1px solid #eee',
                            padding: '10px'
                        }}
                        onError={(e) => {
                            console.error("QR 코드 이미지 로드 오류:", e);
                            e.target.onerror = null; // 무한 루프 방지
                        }}
                    />
                    
                    <p style={{ textAlign: 'center' }}>아래 링크를 통해 타투 디자인을 공유할 수 있습니다:</p>
                    
                    <div style={{
                        margin: '20px 0',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <input 
                            type="text" 
                            value={shareInfo.shareUrl} 
                            readOnly 
                            onClick={(e) => e.target.select()}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(shareInfo.shareUrl)
                                    .then(() => alert('URL이 클립보드에 복사되었습니다.'))
                                    .catch(err => console.error('URL 복사 실패:', err));
                            }}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                marginLeft: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            복사
                        </button>
                    </div>
                    
                    <p style={{
                        color: '#777',
                        fontSize: '14px',
                        textAlign: 'center',
                        marginTop: '15px'
                    }}>
                        이 링크는 {shareInfo.expiresAt.toLocaleString()}에 만료됩니다.
                    </p>
                </div>
            </div>
        )}

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
                <div className="image-card_2 a5-box" ref={a5BoxRef} data-count={selectedTattoos.length} style={{backgroundColor: 'white'}}>
                <div className={`tattoo-grid count-${selectedTattoos.length}`} style={{backgroundColor: 'white'}}>
                    {selectedTattoos.map((tattoo, idx) => (
                    <img 
                        key={idx} 
                        src={tattoo} 
                        alt={`선택된 타투 ${idx + 1}`} 
                        className="selected-tattoo"
                        style={{backgroundColor: 'white', cursor: 'pointer'}}
                        onClick={() => handleSelectedTattooClick(tattoo)}
                        onError={(e) => {
                            console.error("선택된 타투 이미지 로드 오류:", e);
                            e.target.onerror = null; // 무한 루프 방지
                            e.target.style.display = 'none'; // 오류 발생 시 숨김 처리
                        }}
                    />
                    ))}
                </div>
                {/* 레터링 이미지가 있으면 그것을 사용, QR 코드와 함께 표시 */}
                <div className="image-card-bottom"
                      style={{
                        display: 'flex'

                      }}>
                    {/* 레터링 */}
                    {isLetteringProcessing ? (
                        // 처리 중일 때 로딩 표시
                        <div style={{
                            maxWidth: '80%',
                            maxHeight: "40px",
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'white'
                        }}>
                            <div style={{
                                width: '100px',
                                textAlign: 'center',
                                fontSize: '14px',
                                color: '#666'
                            }}>
                                레터링 처리 중...
                            </div>
                        </div>
                    ) : processedLetteringImage ? (
                        // 크롭된 레터링 이미지 표시
                        <img 
                            src={processedLetteringImage} 
                            alt="레터링" 
                            style={{
                                maxWidth: '80%',
                                maxHeight: "80px",
                                objectFit: 'contain',
                                backgroundColor: 'white'
                            }}
                            onError={(e) => {
                                console.error("크롭된 레터링 이미지 로드 오류:", e);
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        // 동물 이름 표시 (처리된 레터링 이미지가 없을 경우)
                        <div className="animal-name" style={{
                            maxHeight: '40px',
                            fontFamily: 'serif',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            fontStyle: 'italic',
                            color: '#000',
                            textAlign: 'left',
                            backgroundColor: 'white'
                        }}>
                            {animalType ? `${animalType}` : 'Mus Musculus'}
                        </div>
                    )}
                    
                    {/* QR 코드 (간단하게 표시) */}
                    {qrCodeUrl && (
                        <img 
                            src={qrCodeUrl}
                            alt="QR 코드"
                            className="qr-code"
                            style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'contain',
                                border: '1px solid #ddd',
                                backgroundColor: 'white'
                            }}
                            onLoad={() => console.log("QR 코드 이미지 로드 성공:", qrCodeUrl)}
                            onError={(e) => {
                                console.error("QR 코드 이미지 로드 오류:", qrCodeUrl, e);
                                e.target.onerror = null;
                                
                                // QR 코드 로드 실패 시 모달의 QR 코드 URL 직접 시도
                                if (shareInfo && shareInfo.qrUrl) {
                                    const modalQrUrl = getImageUrl(shareInfo.qrUrl);
                                    console.log("모달의 QR 코드 URL로 재시도:", modalQrUrl);
                                    e.target.src = modalQrUrl;
                                    return;
                                }
                                
                                // 실패 시 대체 URL 시도
                                if (resultData && resultData.id) {
                                    // 다른 경로 패턴 시도
                                    const alternativePatterns = [
                                        `shares/${resultData.id}_qr.png`,
                                        `qr_${resultData.id}.png`,
                                        `qr_codes/${resultData.id}.png`
                                    ];
                                    
                                    // 현재 시도한 URL이 아닌 다른 패턴 선택
                                    const fallbackUrl = getImageUrl(
                                        alternativePatterns.find(p => !qrCodeUrl.includes(p)) || alternativePatterns[0]
                                    );
                                    
                                    console.log("QR 코드 대체 URL 시도:", fallbackUrl);
                                    e.target.src = fallbackUrl;
                                } else {
                                    e.target.style.display = 'none';
                                }
                            }}
                        />
                    )}
                </div>
                </div>
            </Col>
            </Row>

            {/* 하단: 말풍선 + 버튼 */}
            <Row className="justify-content-center align-items-center mt-4">
  <Col xs={4} sm={12} md={8} className="d-flex justify-content-center align-items-center">
    <div className="bubble5-container position-relative" ref={bubbleRef}>
      <img src={bubble} alt="말풍선" className="bubble4-img" style={{ width: '100%', height: 'auto' }} />
                        {/* 텍스트를 말풍선 안에 딱 맞게 배치 */}
                        <div
                        className="position-absolute"
                        style={{
                            top: '12%', // 말풍선 디자인에 맞게 조절
                            left: '10%',
                            right: '10%',
                            bottom: '15%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem',
                            overflow: 'hidden',
                            textAlign: 'center',
                        }}
                        >
                        <TextBox fontSize={fontSize}>{displayText}</TextBox>
                            </div>
                    </div>
                </Col>

                {/* 버튼 영역 */}
                <Col xs="auto" md="auto"className="d-flex justify-content-center">
                    <div>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img 
                                src={minib1} 
                                alt="인쇄하기" 
                                className="btn-icon" 
                                onClick={handlePrint} 
                                style={{ opacity: isPdfGenerating ? 0.5 : 1, cursor: isPdfGenerating ? 'default' : 'pointer' }}
                            />
                            {isPdfGenerating && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    borderRadius: '5px',
                                    padding: '3px 8px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    변환중...
                                </div>
                            )}
                        </div>
                    </div>
                    {/* 돌아가기 버튼 */}
                    <div >
                        <img src={minib2} alt="돌아가기" className="btn-icon" onClick={() => navigate("/Picture_Select")} />
                    </div>
                    <div>
                        <img src={minib3} alt="home" className="btn-icon" onClick={() => navigate("/App")}/>
                    </div>
                </Col>
            </Row>
        </Container>
        </div>
    );
    }

    export default Page4;
