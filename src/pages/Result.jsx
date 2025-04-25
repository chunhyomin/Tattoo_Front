import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

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

const PrintSelection = () => {
  const navigate = useNavigate();
  const [tattooResults, setTattooResults] = useState([]);
  const [selectedTattoos, setSelectedTattoos] = useState([]);
  const [maxSelections, setMaxSelections] = useState(3);
  const [latinPhrase, setLatinPhrase] = useState("");

  useEffect(() => {
    // localStorage에서 타투 결과 데이터 가져오기
    const resultData = localStorage.getItem("tattooResult");
    
    if (resultData) {
      try {
        const parsed = JSON.parse(resultData);
        console.log("타투 결과 데이터:", parsed);
        
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
          <ConfirmButton 
            onClick={handleConfirm}
            disabled={selectedTattoos.length === 0}
          >
            선택 완료
          </ConfirmButton>
        </ActionButtons>
      </Cloud>
    </ResultBackground>
  );
};

export default PrintSelection;
