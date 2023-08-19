import React, { useState, useRef, useEffect } from 'react';
import styled from "styled-components";



const Div_txt = styled.div`
    width:50%;
    height:100%;
    float:left;
    border : 1px solid rgb(212, 210, 224);
    border:1px solid rgb(212, 210, 224);
    
    align-items : center;

    
`;
const Div_txtShow = styled.div`
    width: 50%;
    height: 50%;
    float: left;
    border:1px solid rgb(212, 210, 224);
    margin: 0px 4px;
    display: flex;
`;

const Div_NB = styled.div`
    width:45%;
    height:50%;
    border:1px solid rgb(212, 210, 224);
    float: left;
    display: flex;

`;

const Div_SVM = styled.div`
    width:45%;
    height:50%;
    float:left;

    display: flex;
    border:1px solid rgb(212, 210, 224);
`;


export default function VoicePage(props) {
    const [conversionResult, setConversionResult] = useState('');
    const [selectedAudioFile, setSelectedAudioFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const audioRef = useRef(null);


    const handleAudioFileChange = (event) => {
        setSelectedAudioFile(event.target.files[0]);
    };
    const convertAudio = () => {
        const formData = new FormData();
        formData.append('audio', selectedAudioFile);

        fetch('/convert/audio', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                setConversionResult(data.result);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handleStartRecording = () => {


        fetch('/convert/start_record', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                setConversionResult(data.text + data.result1 + data.result2)
            })
            .catch(error => console.error(error));
    };

    const handleStopRecording = () => {


        fetch('/convert/stop_record', { method: 'POST' })
            .then(response => response.text())
            .then(data => console.log(data))
            .catch(error => console.error(error));
    };


    return (
        <div
            className='voiceContainer'

            style={{
                //alignItems : "center",
                textAlign: "center",
                // justifyContent : "center",
                //display : "flex",
                fontSize: "1vw",
                margin: "0.5vw",
                width: "80vw",
                height: "100%",
                // border:"1px solid #0400ff",
                // boxShadow : "0 0 10px 1px #0400ff",
            }}
        >
            <Div_txt>
                <div className="input-section">
                    <div className="vfilebox">
                        <label for="vcfile" style={{ width: "100px", height: "100%" }}>
                            UPLOAD FILE
                        </label>
                        <input type="file" id="vcfile" accept="audio/*" onChange={handleAudioFileChange} />
                        <button className="voiceRecBtn" onClick={handleStartRecording}>녹음 시작</button>
                        <button className="voiceStopBtn" onClick={handleStopRecording}>녹음 종료</button>
                    </div>
                </div>

                <button className="voiceTestBtn" onClick={convertAudio}>VERIFY SPAM</button>

                <div style={{
                    margin: "20px",

                    width: "90%",
                    height: "70%",
                    background: " #f8f8f8",
                    borderRadius: "32px",
                    boxShadow: "-6px -6px 10px rgba(255, 255, 255, 0.8), 6px 6px 10px rgba(0, 0, 0, 0.2)",

                }}>
                    <div style={{
                        //padding : "20px",
                        overflow: "scroll",
                        fontSize: "20px",
                        scrollbarColor: "black",
                        width: "80%",
                        height: "80%",
                        textAlign: "center",
                        lineHeight: "1.8",
                        padding: "2vw",
                    }}>
                        {conversionResult && (conversionResult.text)}
                    </div>

                </div>

            </Div_txt>

            {/* <Div_txtShow>
                <div style={{
                    margin: "20px",

                    width: "90%",
                    height: "90%",
                    background: " #f8f8f8",
                    borderRadius: "32px",
                    boxShadow: "-6px -6px 10px rgba(255, 255, 255, 0.8), 6px 6px 10px rgba(0, 0, 0, 0.2)",

                }}>
                    <div style={{
                        //padding : "20px",
                        overflow: "scroll",
                        fontSize: "20px",
                        scrollbarColor: "black",
                        width: "80%",
                        height: "80%",
                        textAlign: "center",
                        lineHeight: "1.8",
                        padding: "2vw",
                    }}>
                        {conversionResult && (conversionResult.text)}
                    </div>

                </div>

            </Div_txtShow> */}


            <Div_NB>
                <h3 style={{ lineHeight: "3", display: "flex", margin: "0vw 0vw 0vw 2vw", height: "2vw" }}> NB ( Naive Bayes )
                    {/* {conversionResult && (
                        <div>  :  {conversionResult.result1}</div>
                    )} */}
                </h3>
            </Div_NB>


            <Div_SVM>

                <h3 style={{ lineHeight: "3", display: "flex", margin: "0vw 0vw 0vw 2vw", height: "2vw" }}> SVM ( Support Vector Machine )
                    {/* {conversionResult && (
                        <div>  :  {conversionResult.result2}</div>
                    )} */}
                </h3>
            </Div_SVM>
        </div>


    );
}