import React from 'react';
import styled from "styled-components";


import { useState } from 'react';



const Div_txt = styled.div`
    width:50%;
    height:100%;
    float:left;
    border : 1px solid black;


    align-items : center;
`;

const Div_graph = styled.div`
    width:50%;
    height:50%;
    float:left;
    border:1px solid black;
`;

const Div_result = styled.div`
    width:50%;
    height:50%;
    float:left;
    border:1px solid black;
`;


export default function TextBox(props){


  const [selectedSection, setSelectedSection] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [conversionResult, setConversionResult] = useState([]);

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




    return(
        <div
        style={{
            //alignItems : "center",
            textAlign: "center",
            // justifyContent : "center",
            //display : "flex",
            fontSize : "1vw",
            margin : "0.5vw",
            width:"80vw",
            height:"100%",
            border:"5px solid #0400ff",
            boxShadow : "0 0 10px 3px #0400ff",
            }}
        >
            <Div_txt>
                <textarea
                  style = {{
                    margin : "10vw 1vw 1vw 1vw",
                    height : "60%",
                    width : "80%",
                  }}
                    placeholder="텍스트를 입력하세요."
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <button 
                  style = {{
                    border : "50px",
                    margin : " 10px 20px",
                    backgroundColor : "skyblue",
                  }}
                  onClick={handleConvert}>검사하기</button>
            </Div_txt>
            <Div_graph>
                
            </Div_graph>
            <Div_result>
                <div className="section">

                    {conversionResult && (
                        <div className="result">
                        <h2>결과: {
                          
                        conversionResult}</h2>
                      
                        </div>
                    )}
                </div>
        
                
            </Div_result>
        
            
        </div>


    );
}