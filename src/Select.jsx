import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // custom CSS
import { Container, Row, Col } from 'react-bootstrap';
import cloud from "/cloud.png";
import { checkHealth } from "./tattoo_api";

const App = () => {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState("simple");
  const [selectedGender, setSelectedGender] = useState('male');
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(false);
  
  // 스타일 이름 매핑
  const styleNames = {
    "simple": "심플하게",
    "cute": "귀엽게",
    "pretty": "예쁘게",
    "chic": "시크하게"
  };
  
  // 서버 상태 확인
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const isHealthy = await checkHealth();
        setServerStatus(isHealthy);
        if (!isHealthy) {
          setError("서버에 연결할 수 없습니다. 나중에 다시 시도해주세요.");
        }
      } catch (err) {
        console.error("서버 상태 확인 실패:", err);
        setServerStatus(false);
        setError("서버 연결 오류가 발생했습니다.");
      }
    };
    
    checkServerStatus();
  }, []);
  
  // 컴포넌트 마운트 시 저장된 데이터 가져오기
  useEffect(() => {
    // 성별 정보 가져오기
    const savedGender = localStorage.getItem('selectedGender');
    if (savedGender) {
      setSelectedGender(savedGender);
    } else {
      setError("먼저 성별을 선택해주세요.");
      setTimeout(() => navigate("/page2"), 2000);
    }
    
    // 저장된 스타일 정보 가져오기
    const savedStyle = localStorage.getItem('selectedStyle');
    if (savedStyle) {
      setSelectedStyle(savedStyle);
      console.log(`저장된 스타일 복원: ${savedStyle}`);
    }
  }, [navigate]);
  
  // 스타일 선택 시 localStorage에 저장
  const handleStyleChange = (style) => {
    console.log(`스타일 변경: ${style}`);
    setSelectedStyle(style);
    localStorage.setItem('selectedStyle', style);
  };
  
  // 사진 촬영 페이지로 이동
  const navigateToPicture = () => {
    try {
      if (!serverStatus) {
        setError("서버에 연결할 수 없습니다. 나중에 다시 시도해주세요.");
        return;
      }
      
      // 선택한 스타일 정보를 localStorage에 저장
      localStorage.setItem('selectedStyle', selectedStyle);
      console.log(`스타일 선택 완료: ${selectedStyle}, 사진 촬영 페이지로 이동`);
      
      // 사진 촬영 페이지로 이동
      navigate("/Picture");
    } catch (error) {
      console.error("페이지 이동 오류:", error);
      setError("페이지 이동 중 오류가 발생했습니다.");
    }
  };
  
  // 이전 페이지로 이동
  const goBack = () => {
    navigate("/page2");
  };
  
  // CSS 스타일 정의
  const styles = {
    container: {
      minHeight: "100vh",
      padding: "20px",
      backgroundColor: "#f8f9fa",
    },
    title: {
      textAlign: "center",
      marginBottom: "2rem",
      fontWeight: "bold",
      color: "#333",
    },
    styleButton: {
      padding: "15px",
      margin: "10px",
      border: "2px solid #ddd",
      borderRadius: "10px",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
    },
    selectedButton: {
      borderColor: "#4A90E2",
      backgroundColor: "#E3F2FD",
      boxShadow: "0 2px 8px rgba(74,144,226,0.3)",
    },
    buttonText: {
      marginTop: "10px",
      fontSize: "16px",
      fontWeight: "500",
    },
    actionButton: {
      padding: "12px 20px",
      margin: "10px",
      borderRadius: "25px",
      cursor: "pointer",
      fontWeight: "bold",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
    },
    nextButton: {
      backgroundColor: "#4A90E2",
      color: "white",
      border: "none",
    },
    backButton: {
      backgroundColor: "#f8f9fa",
      color: "#333",
      border: "1px solid #ddd",
    },
    errorMessage: {
      color: "#d9534f",
      textAlign: "center",
      marginTop: "1rem",
    },
    styleGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "15px",
      maxWidth: "500px",
      margin: "0 auto",
    },
    styleBox: {
      border: "2px solid #ddd",
      borderRadius: "10px",
      padding: "15px",
      textAlign: "center",
      cursor: "pointer",
      backgroundColor: "#fff",
      transition: "all 0.2s ease",
    },
    selectedBox: {
      borderColor: "#4A90E2",
      backgroundColor: "#E3F2FD",
      transform: "scale(1.05)",
    },
    styleImage: {
      width: "80px",
      height: "80px",
      marginBottom: "10px",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
      maxWidth: "500px",
      margin: "2rem auto 0",
    },
  };

  // 스타일 박스 스타일
  const styleBoxStyle = (isSelected) => ({
    border: isSelected ? 'none' : '2px solid #ddd',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#E3F2FD' : '#fff',
    transition: 'all 0.2s ease',
    ...(isSelected && {
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#4A90E2',
      transform: 'scale(1.05)'
    })
  });

  return (
    <Container fluid style={styles.container}>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <h1 style={styles.title}>타투 스타일을 선택해주세요</h1>
          
          {error && <div style={styles.errorMessage}>{error}</div>}
          
          <div style={styles.styleGrid}>
            {Object.entries(styleNames).map(([styleKey, styleName]) => (
              <div
                key={styleKey}
                style={styleBoxStyle(selectedStyle === styleKey)}
                onClick={() => handleStyleChange(styleKey)}
              >
                <img src={cloud} alt={styleName} style={styles.styleImage} />
                <div>{styleName}</div>
              </div>
            ))}
          </div>
          
          <div style={styles.buttonContainer}>
            <button
              style={{ ...styles.actionButton, ...styles.backButton }}
              onClick={goBack}
            >
              이전
            </button>
            <button
              style={{ ...styles.actionButton, ...styles.nextButton }}
              onClick={navigateToPicture}
            >
              다음
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
