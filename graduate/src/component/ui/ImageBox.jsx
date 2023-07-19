import React , { useState  } from 'react';
import styled from "styled-components";
import TextBoxGraph from "./TextBoxContents/TextBoxGraph"
import "./css/Button.css";
import { useRef } from 'react';
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
    const [conversionResult, setConversionResult] = useState([{}]);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imgFile, setImgFile] = useState('');
    const imgRef = useRef();
    const [selectedAudioFile, setSelectedAudioFile] = useState(null);

    // const handleImageFileChange = (event) => {
    //     setSelectedImageFile(event.target.files[0]);
    // };

    const saveImgFile = (event) => {
        setSelectedImageFile(event.target.files[0]);
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImgFile(reader.result);
        };

    };

    // const convertImage = () => {
    //     const formData = new FormData();
    //     formData.append('image', selectedImageFile);
    //     fetch('/convert/image', {
    //         method: 'POST',
    //         body: formData
    //     })
    //         .then(response => response.json())
    //         .then(data => {
    //         setConversionResult(data.text + data.result);
    //         })
    //         .catch(error => {
    //         // 에러 처리
    //         });
    // };
    const convertImage = () => {
        const formData = new FormData();
        formData.append('image', selectedImageFile);
        fetch('/convert/image', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
            setConversionResult(data);
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
            border:"1px solid #ff6600",
            boxShadow : "0 0 10px 1px #ff6600",
            }}
        >
            <Div_txt>
                <div
                    style ={{
                        margin : "1vw 1vw 1vw 1vw",
                        height : "10%",
                        width : "90%",
                        border : "1px solid black"
                    }}>
                    <input type="file" accept="image/*" onChange={saveImgFile} ref={imgRef}/>
                </div>
                <div
                    style = {{
                    margin : "1vw 1vw 1vw 1vw",
                    height : "60%",
                    width : "90%",
                    border : "1px solid black"
                    }}>
                        <img
                            src={imgFile }
                            style = {{
                                height : "100%",
                                width : "100%",
                                border : "1px solid black"
                                }}
                        />
                </div>
                <button  class = "geomsaButton" onClick={convertImage}>변환</button>
            </Div_txt>
            <Div_graph>
                {conversionResult && (
                    <div className="text">
                        {conversionResult.text}
                    </div>
                    )}

            </Div_graph>
            <Div_result>
                {conversionResult && (
                <div className="result">
                <h2>결과: {conversionResult.result}</h2>
                </div>
                )}
            </Div_result>

        </div>


    );
}