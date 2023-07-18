import React , { useState } from 'react';
import styled from "styled-components";
import TextBoxGraph from "./TextBoxContents/TextBoxGraph"

const Div_txt = styled.div`
    width:50%;
    height:100%;
    float:left;
    border : 1px solid black;

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

export default function ImageBox(props){

    const [selectedSection, setSelectedSection] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [conversionResult, setConversionResult] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [selectedAudioFile, setSelectedAudioFile] = useState(null);

    const handleImageFileChange = (event) => {
        setSelectedImageFile(event.target.files[0]);
    };

    const convertImage = () => {
        const formData = new FormData();
        formData.append('image', selectedImageFile);
        fetch('/convert/image', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
            setConversionResult(data.text + data.result);
            })
            .catch(error => {
            // 에러 처리
            });
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
            border:"5px solid #ff6600",
            boxShadow : "0 0 10px 3px #ff6600",
            }}
        >
            <Div_txt>
                <input type="file" accept="image/*" onChange={handleImageFileChange} />
                <button onClick={convertImage}>변환</button>
            </Div_txt>
            <Div_graph>
                
                그래프 박스
            </Div_graph>
            <Div_result>
                {conversionResult && (
                <div className="result">
                <h2>결과: {conversionResult}</h2>
                </div>
                )}
            </Div_result>

        </div>


    );
}