import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { createShareRecord } from "../tattoo_api";

import back from "/img_background.png";
import ch1 from "/여울이.png";
import ch2 from "/너굴맨.png";
// import circle from "/circle1.png";
import "../App.css";

// 스타일 컴포넌트 정의
const ResultBackground = styled.div`
  background-image: url(${back});
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Cloud = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  padding: 30px;
  margin: 40px auto;
  max-width: 1000px;
  width: 90%;
  position: relative;
  z-index: 1;
`;

const Character = styled.img`
  position: absolute;
  bottom: 20px;
  width: 120px;
  z-index: 0;
`;

const LeftCharacter = styled(Character)`
  left: 20px;
`;

const RightCharacter = styled(Character)`
  right: 20px;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: bold;
`;

const Subtitle = styled.h2`
  color: #555;
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
`;

const TattooGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const TattooItem = styled.div`
  border-radius: 10px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transform: ${(props) => (props.selected ? "scale(0.95)" : "scale(1)")};
  border: ${(props) => (props.selected ? "3px solid #3498db" : "3px solid transparent")};
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: scale(0.98);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  &::after {
    content: ${(props) => (props.selected ? "'✓'" : "''")};
    position: absolute;
    top: 5px;
    right: 5px;
    width: 20px;
    height: 20px;
    background-color: #3498db;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    opacity: ${(props) => (props.selected ? "1" : "0")};
    transition: opacity 0.3s ease;
  }
`;

const TattooImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: contain;
  display: block;
`;

const OptionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
`;

const OptionButton = styled.button`
  padding: 8px 15px;
  background-color: ${(props) => (props.active === "true" ? "#3498db" : "#e0e0e0")};
  color: ${(props) => (props.active === "true" ? "#fff" : "#333")};
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: ${(props) => (props.active === "true" ? "bold" : "normal")};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${(props) => (props.active === "true" ? "#2980b9" : "#d0d0d0")};
  }
`;

const SelectionInfo = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
`;

const SelectedCount = styled.div`
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
`;

const LatinPhrase = styled.div`
  font-style: italic;
  color: #666;
  margin: 15px 0;
  text-align: center;
  padding: 10px;
  background-color: rgba(240, 240, 240, 0.5);
  border-radius: 8px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  padding: 12px 25px;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const BackButton = styled(ActionButton)`
  background-color: #e0e0e0;
  color: #333;
  
  &:hover {
    background-color: #d0d0d0;
  }
`;

const ConfirmButton = styled(ActionButton)`
  background-color: #2ecc71;
  color: white;
  
  &:hover {
    background-color: #27ae60;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// 공유 모달 컴포넌트 추가
const ShareModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #555;
  
  &:hover {
    color: #000;
  }
`;

const QRCode = styled.img`
  display: block;
  margin: 20px auto;
  max-width: 200px;
  border: 1px solid #eee;
  padding: 10px;
`;

const ShareURL = styled.div`
  margin: 20px 0;
  display: flex;
  align-items: center;
`;

const URLInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const CopyButton = styled.button`
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  margin-left: 10px;
  cursor: pointer;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const ExpiryNotice = styled.p`
  color: #777;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
`;

const ShareButton = styled(ActionButton)`
  background-color: #3498db;
  color: white;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const PrintSelection = () => {
  const navigate = useNavigate();
  const [tattooResults, setTattooResults] = useState([]);
  const [selectedTattoos, setSelectedTattoos] = useState([]);
  const [maxSelections, setMaxSelections] = useState(3);
  const [latinPhrase, setLatinPhrase] = useState("");
  const [resultData, setResultData] = useState(null);
  // 공유 관련 상태 추가
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareInfo, setShareInfo] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    // localStorage에서 타투 결과 데이터 가져오기
    const resultDataStr = localStorage.getItem("tattooResult");
    
    if (resultDataStr) {
      try {
        const parsed = JSON.parse(resultDataStr);
        console.log("타투 결과 데이터:", parsed);
        setResultData(parsed);
        
        // 타투 이미지 배열이 있는지 확인
        if (parsed.tattoo_images && Array.isArray(parsed.tattoo_images)) {
          // URL을 직접 사용
          setTattooResults(parsed.tattoo_images);
        } else {
          console.error("타투 이미지 배열을 찾을 수 없습니다:", parsed);
        }
        
        // 라틴어 문구가 있는지 확인
        if (parsed.latin_phrase) {
          setLatinPhrase(parsed.latin_phrase);
        }
      } catch (error) {
        console.error("타투 결과 데이터 파싱 오류:", error);
      }
    } else {
      console.error("타투 결과 데이터가 없습니다.");
    }
  }, []);

  // 타투 선택 토글
  const toggleTattooSelection = (index) => {
    setSelectedTattoos((prev) => {
      // 이미 선택된 경우 제거
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      
      // 최대 선택 수에 도달한 경우
      if (prev.length >= maxSelections) {
        return prev;
      }
      
      // 새로 선택
      return [...prev, index];
    });
  };

  // 최대 선택 수 변경
  const changeMaxSelections = (num) => {
    setMaxSelections(num);
    // 현재 선택된 항목이 새 최대값보다 많으면 잘라내기
    if (selectedTattoos.length > num) {
      setSelectedTattoos(selectedTattoos.slice(0, num));
    }
  };

  // 이전 페이지로 돌아가기
  const handleBack = () => {
    navigate("/Select");
  };

  // 선택 확인
  const handleConfirm = () => {
    if (selectedTattoos.length > 0) {
      // 선택한 타투 이미지만 필터링
      const selectedImages = selectedTattoos.map(index => tattooResults[index]);
      
      // 선택한 이미지 localStorage에 저장
      localStorage.setItem("selectedTattoos", JSON.stringify(selectedImages));
      
      // 다음 페이지로 이동 (필요에 따라 경로 조정)
      navigate("/Final");
    }
  };

  // 공유 기능 구현
  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      if (!resultData) {
        throw new Error("공유할 타투 데이터가 없습니다");
      }
      
      // 현재 결과 데이터를 기반으로 공유 데이터 생성
      const shareData = {
        display_path: resultData.display_image,
        tattoo_paths: resultData.tattoo_images,
        lettering_path: resultData.lettering_image,
        style: resultData.style || 'simple'
      };
      
      console.log("공유 데이터:", shareData);
      
      const shareResult = await createShareRecord(shareData);
      
      if (!shareResult.success) {
        throw new Error(shareResult.error || "공유 레코드 생성에 실패했습니다");
      }
      
      // 공유 URL 및 QR 코드 정보 표시
      setShareInfo({
        shareUrl: shareResult.share_url,
        qrUrl: shareResult.qr_url,
        expiresAt: new Date(shareResult.expires_at * 1000)
      });
      
      // 공유 모달 표시
      setShowShareModal(true);
    } catch (error) {
      console.error('타투 공유 오류:', error);
      alert('타투 공유 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsSharing(false);
    }
  };
  
  // URL 복사 기능
  const copyShareUrl = () => {
    if (shareInfo && shareInfo.shareUrl) {
      navigator.clipboard.writeText(shareInfo.shareUrl)
        .then(() => alert('URL이 클립보드에 복사되었습니다.'))
        .catch(err => console.error('URL 복사 실패:', err));
    }
  };

  return (
    <ResultBackground>
      <LeftCharacter src={ch1} alt="캐릭터1" />
      <RightCharacter src={ch2} alt="캐릭터2" />
      
      <Cloud>
        <Title>당신을 위한 타투 도안</Title>
        <Subtitle>마음에 드는 타투 디자인을 선택해주세요</Subtitle>
        
        <OptionButtons>
          <OptionButton 
            active={maxSelections === 1 ? "true" : "false"} 
            onClick={() => changeMaxSelections(1)}
          >
            1개 선택
          </OptionButton>
          <OptionButton 
            active={maxSelections === 2 ? "true" : "false"} 
            onClick={() => changeMaxSelections(2)}
          >
            2개 선택
          </OptionButton>
          <OptionButton 
            active={maxSelections === 3 ? "true" : "false"} 
            onClick={() => changeMaxSelections(3)}
          >
            3개 선택
          </OptionButton>
        </OptionButtons>
        
        <SelectionInfo>
          <SelectedCount>
            {selectedTattoos.length}개 선택됨 (최대 {maxSelections}개)
          </SelectedCount>
        </SelectionInfo>
        
        {latinPhrase && (
          <LatinPhrase>"{latinPhrase}"</LatinPhrase>
        )}
        
        <TattooGrid>
          {tattooResults.map((tattoo, index) => (
            <TattooItem 
              key={index} 
              selected={selectedTattoos.includes(index)}
              onClick={() => toggleTattooSelection(index)}
            >
              <TattooImage src={tattoo} alt={`타투 디자인 ${index + 1}`} />
            </TattooItem>
          ))}
        </TattooGrid>
        
        <ActionButtons>
          <BackButton onClick={handleBack}>
            이전으로
          </BackButton>
          <ShareButton 
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? '공유 중...' : '타투 공유'}
          </ShareButton>
          <ConfirmButton 
            onClick={handleConfirm}
            disabled={selectedTattoos.length === 0}
          >
            선택 완료
          </ConfirmButton>
        </ActionButtons>
      </Cloud>
      
      {/* 공유 모달 */}
      {showShareModal && shareInfo && (
        <ShareModal onClick={() => setShowShareModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowShareModal(false)}>&times;</CloseButton>
            <h3 style={{ textAlign: 'center' }}>타투 디자인 공유</h3>
            
            <QRCode src={shareInfo.qrUrl} alt="QR 코드" />
            
            <p style={{ textAlign: 'center' }}>아래 링크를 통해 타투 디자인을 공유할 수 있습니다:</p>
            
            <ShareURL>
              <URLInput 
                type="text" 
                value={shareInfo.shareUrl} 
                readOnly 
                onClick={(e) => e.target.select()}
              />
              <CopyButton onClick={copyShareUrl}>
                복사
              </CopyButton>
            </ShareURL>
            
            <ExpiryNotice>
              이 링크는 {shareInfo.expiresAt.toLocaleString()}에 만료됩니다.
            </ExpiryNotice>
          </ModalContent>
        </ShareModal>
      )}
    </ResultBackground>
  );
};

export default PrintSelection;
