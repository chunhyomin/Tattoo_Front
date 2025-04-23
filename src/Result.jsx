import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { getImageUrl } from "./tattoo_api.js";
import { useNavigate } from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import temp_back from "/img_background.png";
import ch1 from "/여울이.png";
import ch2 from "/너굴맨.png";
import cloud from "/cloud.png";
import bubble from "/말풍선.png";
import btimg from "/buttonimg.png";

import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

const PrintSelection = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(1);
  const options = [1, 2, 4];
  
  // 백엔드에서 받은 결과 데이터 상태
  const [tattooResult, setTattooResult] = useState(null);
  const [selectedDoans, setSelectedDoans] = useState([]);
  
  // 컴포넌트 마운트 시 저장된 결과 데이터 가져오기
  useEffect(() => {
    const resultData = localStorage.getItem('tattooResult');
    if (resultData) {
      try {
        const parsedData = JSON.parse(resultData);
        console.log("불러온 타투 결과:", parsedData);
        setTattooResult(parsedData);
        
        // 타투 이미지가 있으면 첫 번째 이미지를 기본으로 선택
        if (parsedData.tattoo_images && parsedData.tattoo_images.length > 0) {
          setSelectedDoans([parsedData.tattoo_images[0]]);
        }
      } catch (error) {
        console.error("결과 데이터 파싱 오류:", error);
      }
    }
  }, []);

  // 이미지 URL 처리 함수
  const getFullImageUrl = (path) => {
    if (!path) return '';
    return getImageUrl(path);
  };
  
  // 도안 선택 처리
  const handleDoanSelect = (doan) => {
    // 이미 선택된 도안이면 선택 해제
    if (selectedDoans.includes(doan)) {
      setSelectedDoans(selectedDoans.filter(item => item !== doan));
    } else {
      // 최대 선택 수(selected)에 따라 처리
      if (selectedDoans.length < selected) {
        setSelectedDoans([...selectedDoans, doan]);
      } else {
        // 선택 초과 시 기존 선택 초기화 후 새로운 선택
        setSelectedDoans([doan]);
      }
    }
  };
  
  // 이전 스타일 선택 화면으로 이동
  const goBack = () => {
    navigate('/Select');
  };
  
  // 선택 완료 후 처리
  const handleConfirm = () => {
    if (selectedDoans.length > 0) {
      // 선택한 도안 정보 저장
      localStorage.setItem('selectedDoans', JSON.stringify(selectedDoans));
      
      // 최종 결과 화면으로 이동 (현재는 같은 페이지 유지)
      alert('선택이 완료되었습니다!');
    } else {
      alert('하나 이상의 도안을 선택해주세요.');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#b6eaff' }}>
      <div className="container py-5">
        <div className="card shadow-lg">
          <div className="card-body">
            <div className="d-flex align-items-center mb-4">
              {/* 결과 이미지가 있으면 표시, 없으면 기본 이미지 */}
              <img
                src={tattooResult && tattooResult.display_image 
                  ? getFullImageUrl(tattooResult.display_image)
                  : "https://dodo.ac/np/images/thumb/d/d2/Raymond_NH.png/120px-Raymond_NH.png"}
                alt="동물 이미지"
                className="rounded-circle border border-warning me-3"
                width="80"
                height="80"
              />
              <div>
                <h4 className="fw-bold mb-1">
                  {tattooResult && tattooResult.animal_type 
                    ? `닮은 동물은 ${tattooResult.animal_type} 입니다` 
                    : "닮은 동물은 고양이 입니다"}
                </h4>
                <span className="badge bg-danger"></span>
              </div>
            </div>

            {/* 도안 선택 수량 옵션 */}
            <div className="row g-3 mb-4">
              {options.map((num) => (
                <div className="col-12 col-sm-4" key={num}>
                  <div
                    className={`card h-100 border-3 ${selected === num ? "border-primary" : "border-light"}`}
                    onClick={() => {
                      setSelected(num);
                      setSelectedDoans([]); // 선택 초기화
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body d-flex flex-wrap justify-content-center align-items-center">
                      <h5 className="w-100 text-center mb-3">{num}장 선택</h5>
                      <div className="d-flex flex-wrap justify-content-center">
                        {[...Array(num)].map((_, i) => (
                          <div 
                            key={i}
                            style={{ 
                              width: num === 1 ? '70px' : num === 2 ? '50px' : '35px', 
                              height: num === 1 ? '70px' : num === 2 ? '50px' : '35px',
                              margin: '3px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '5px'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 타투 도안 목록 */}
            {tattooResult && tattooResult.tattoo_images && (
              <div className="card mb-4 border-primary">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">도안 선택 ({selectedDoans.length}/{selected})</h5>
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    {tattooResult.tattoo_images.map((img, index) => (
                      <div className="col-6 col-sm-4 col-md-3" key={index}>
                        <div 
                          className={`card h-100 ${selectedDoans.includes(img) ? 'border-success border-3' : ''}`}
                          onClick={() => handleDoanSelect(img)}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={getFullImageUrl(img)}
                            alt={`타투 도안 ${index + 1}`}
                            className="img-fluid p-2"
                          />
                          {selectedDoans.includes(img) && (
                            <div className="position-absolute top-0 end-0 p-2">
                              <span className="badge bg-success">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 라틴어 문구 표시 (있는 경우) */}
            {tattooResult && tattooResult.latin_phrase && (
              <div className="alert alert-info text-center mb-4">
                <p className="fw-bold mb-1">라틴어 문구</p>
                <p className="mb-1">{tattooResult.latin_phrase}</p>
                {tattooResult.latin_info && (
                  <small className="text-muted">{tattooResult.latin_info}</small>
                )}
              </div>
            )}

            <div className="alert alert-light text-center">
              {tattooResult && tattooResult.tattoo_images 
                ? `원하는 도안을 ${selected}장 선택해주세요. 많이 고를수록 크기가 작아집니다.` 
                : "원하는 도안을 골라주세요! 1장, 2장, 4장\n많이 고를수록 크기가 작아집니다."}
            </div>

            <div className="d-flex justify-content-between gap-2">
              <button 
                className="btn btn-outline-secondary"
                onClick={goBack}
              >
                이전
              </button>
              <button 
                className="btn btn-warning fw-bold text-dark"
                onClick={handleConfirm}
                disabled={selectedDoans.length === 0}
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSelection;
