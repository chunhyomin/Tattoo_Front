import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedTattoo, getImageUrl } from '../tattoo_api';
import styled from 'styled-components';
import '../App.css';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TattooGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const TattooItem = styled.div`
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 4px;
`;

const CountdownBox = styled.div`
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  margin: 20px 0;
  text-align: center;
  border-left: 3px solid #ff9800;
`;

const MainImage = styled.img`
  max-width: 100%;
  margin: 10px 0;
  border-radius: 4px;
`;

const SectionTitle = styled.h3`
  margin-top: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
  color: #333;
`;

const LetteringSection = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #4CAF50;
`;

const Notice = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #fff9c4;
  border-radius: 4px;
  font-size: 0.9em;
  color: #5d4037;
`;

const StyleInfo = styled.div`
  margin: 15px 0;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 4px;
  border-left: 3px solid #4CAF50;
  font-size: 1.1em;
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
`;

const BackButton = styled.button`
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: #388E3C;
  }
`;

function SharePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // 공유 데이터 로드
  useEffect(() => {
    async function loadSharedData() {
      try {
        setLoading(true);
        const data = await getSharedTattoo(token);
        
        if (!data.success) {
          throw new Error(data.error || '공유 정보를 불러올 수 없습니다');
        }
        
        setShareData(data);
        
        if (data.time_remaining) {
          setTimeRemaining(data.time_remaining);
        }
      } catch (err) {
        setError('공유 정보를 불러올 수 없습니다: ' + (err.message || '알 수 없는 오류'));
        console.error('공유 데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (token) {
      loadSharedData();
    }
  }, [token]);
  
  // 카운트다운 타이머
  useEffect(() => {
    if (!shareData) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // 시간이 만료되면 타이머 클리어
          clearInterval(timer);
          setError('공유 링크가 만료되었습니다.');
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [shareData]);
  
  if (loading) {
    return <Loading>로딩 중...</Loading>;
  }
  
  if (error) {
    return (
      <ErrorContainer>
        <h1>오류 발생</h1>
        <p>{error}</p>
        <BackButton onClick={() => navigate('/')}>메인으로 돌아가기</BackButton>
      </ErrorContainer>
    );
  }
  
  if (!shareData) {
    return <div>데이터를 불러올 수 없습니다.</div>;
  }
  
  const { display_image, tattoo_images, lettering_image, style_name } = shareData;
  const { hours, minutes, seconds } = timeRemaining;
  
  return (
    <div className="app1-background">
      <Container>
        <h1>타투 디자인 공유</h1>
        
        <CountdownBox>
          <h3>이미지 접근 가능 시간</h3>
          <p>이 링크는 <strong>{`${hours}시간 ${minutes}분 ${seconds}초`}</strong> 후에 만료됩니다.</p>
        </CountdownBox>
        
        <div>
          <SectionTitle>최종 결과</SectionTitle>
          {display_image ? (
            <MainImage src={getImageUrl(display_image)} alt="최종 결과" />
          ) : (
            <p>디스플레이 이미지가 없습니다.</p>
          )}
          
          <StyleInfo>
            <p><strong>타투 스타일:</strong> {style_name}</p>
          </StyleInfo>
          
          <SectionTitle>타투 디자인</SectionTitle>
          <TattooGrid>
            {tattoo_images && tattoo_images.map((image, index) => (
              <TattooItem key={index}>
                <img 
                  src={getImageUrl(image)} 
                  alt={`타투 디자인 ${index + 1}`}
                  style={{ width: '100%' }}
                />
              </TattooItem>
            ))}
          </TattooGrid>
          
          {lettering_image && (
            <LetteringSection>
              <SectionTitle>라틴어 레터링 타투</SectionTitle>
              <img 
                src={getImageUrl(lettering_image)} 
                alt="레터링 타투"
                style={{ maxWidth: '100%' }}
              />
            </LetteringSection>
          )}
        </div>
        
        <Notice>
          <p><strong>알림:</strong> 이 이미지들은 1시간 후에 자동으로 삭제됩니다. 저장하려면 지금 다운로드하세요.</p>
          <p>이미지를 다운로드하려면 이미지를 길게 터치(모바일) 또는 우클릭(PC)하여 '이미지 저장'을 선택하세요.</p>
        </Notice>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <BackButton onClick={() => navigate('/')}>메인으로 돌아가기</BackButton>
        </div>
      </Container>
    </div>
  );
}

export default SharePage; 