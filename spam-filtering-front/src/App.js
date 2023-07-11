import './App.css';
import React, { useState } from 'react';

function App() {
  const [selectedSection, setSelectedSection] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [conversionResult, setConversionResult] = useState('');

  const handleSectionChange = (section) => {
    setSelectedSection(section);
  };

  const handleConvert = () => {
    fetch('/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ section: selectedSection, value: inputValue })
    })
      .then(response => response.json())
      .then(data => {
        // 요청에 대한 응답 처리
        setConversionResult(data.result);
      })
      .catch(error => {
        // 에러 처리
      });
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div className='outer-container'>
      <div className="container">
        <h1>Spam Classifier </h1>
        <div className="navigator">
          <button
            className={selectedSection === 'text' ? 'active' : ''}
            onClick={() => handleSectionChange('text')}
          >
            텍스트
          </button>
          <button
            className={selectedSection === 'image' ? 'active' : ''}
            onClick={() => handleSectionChange('image')}
          >
            이미지
          </button>
          <button
            className={selectedSection === 'audio' ? 'active' : ''}
            onClick={() => handleSectionChange('audio')}
          >
            음성
          </button>
        </div>

        <div className="section">
          {selectedSection === 'text' && (
            <div className="input-section">
              <textarea
                cols="50"
                rows="10"
                placeholder="텍스트를 입력하세요."
                value={inputValue}
                onChange={handleInputChange}
              />
              <button onClick={handleConvert}>변환</button>
            </div>
          )}

          {selectedSection === 'image' && (
            <div className="input-section">
              <input type="file" accept="image/*" />
              <button onClick={handleConvert}>변환</button>
            </div>
          )}

          {selectedSection === 'audio' && (
            <div className="input-section">
              <input type="file" accept="audio/*" />
              <button onClick={handleConvert}>변환</button>
            </div>
          )}
        </div>
        <div className="section">
          {/* 이하 코드 생략 */}

          {conversionResult && (
            <div className="result">
              <h2>결과: {conversionResult}</h2>
            </div>
          )}
        </div>
      </div>
      <footer>
        @copyright pnu spamdosirak
      </footer>
    </div>
  );
}

export default App;
