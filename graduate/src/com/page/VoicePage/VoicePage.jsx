import React from "react";
import styled from "styled-components";
import { useState, PureComponent } from "react";
import "../Page.css";

//이 순서대로 깔아주세용
//npm install --save react-native
//npm install --save react-native-safe-area-context
//npm install --save react-native-paper 
//npm install --save react-native-web
import { TextInput } from "react-native-paper";


//그래프를 위한 import
//npm install --save react-chartjs-2 
//npm install --save chart.js
import { Bar  } from "react-chartjs-2";
import "chart.js/auto";


//npm install --save react-loader-spinner
import { Oval } from "react-loader-spinner";
import HighlightedText from "../../highlight/HightLighted";


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
    flex-direction: column;

`;

const Div_SVM = styled.div`
    width:45%;
    height:50%;
    float:left;
    display: flex;
    flex-direction: column;
    border:1px solid rgb(212, 210, 224);
`;


export default function VoicePage(props) {
    const [conversionResult, setConversionResult] = useState('');
    const [NBResult, setNBResult] = useState('');
    const [SVMResult, setSVMResult] = useState('');
    const [selectedAudioFile, setSelectedAudioFile] = useState(null);
    const [NBgraph, setNBGraph] = useState({ category: [], value: [] });
    const [SVMgraph, setSVMGraph] = useState({ category: [], value: [] });
    const [selectedResultType, setSelectedResultType] = useState("NB");
    const [loading, setLoading] = useState(false);


    const handleAudioFileChange = (event) => {
        setSelectedAudioFile(event.target.files[0]);
    };
    const convertAudio = () => {
        const formData = new FormData();
        formData.append('audio', selectedAudioFile);
        setLoading(true);
        setNBGraph({ category: [], value: [] });
        setSVMGraph({ category: [], value: [] });
        setConversionResult('');

        fetch('/convert/audio', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('No String'); // 예상치 못한 오류 응답 처리
                }
                return response.json();
            })
            .then(data => {
                setConversionResult(data.text);
                setNBResult(data.result1)
                setSVMResult(data.result2)
                setNBGraph(data.vocabs1);
                setSVMGraph(data.vocabs2);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false);
                if (error instanceof Error && error.message === 'No String') {
                    alert('음성에서 추출된 텍스트가 없습니다');
                }
            });
    };

    const handleStartRecording = () => {
        setNBGraph({ category: [], value: [] });
        setSVMGraph({ category: [], value: [] });
        setConversionResult('');
        fetch('/convert/start_record', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                setConversionResult(data.text);
                setNBResult(data.result1)
                setSVMResult(data.result2)
                setNBGraph(data.vocabs1);
                setSVMGraph(data.vocabs2);
                setLoading(false);
            })
            .catch(error => console.error(error));
    };

    const handleStopRecording = () => {
        setLoading(true);
        fetch('/convert/stop_record', { method: 'POST' })
            .then(response => response.text())
            .then(data => console.log(data))
            .catch(error => console.error(error));
    };

    const handleNBResult = () => {
        setSelectedResultType("NB");
    };
    
    const handleSVMResult = () => {
        setSelectedResultType("SVM");
    };

    const NBchartData = {

        labels: NBgraph.category.slice(0, 5),
        datasets: [
            {
                label: "NB : Top 5 Words",
                data: NBgraph.value.slice(0, 5),
                backgroundColor: "#12c2e9",
                datalabels: {
                color: "black",
                backgroundColor: 'white',
                font: { size: 13, weight: 'bold' },
                },
            },
        ],
    };
    const SVMchartData = {
    
        labels: SVMgraph.category.slice(0, 5),
        datasets: [
            {
            label: "SVM : Top 5 Words",
            data: SVMgraph.value.slice(0, 5),
            backgroundColor: "#c471ed",
            datalabels: {
                color: "black",
                backgroundColor: 'white',
                font: { size: 13, weight: 'bold' },
                },  
            },
        ],
    };

    const options = {
        legend: {
            display: true,
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                grid: {
                    display: false,
                },
            },
        },
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
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
                        {(selectedResultType === "NB") && (conversionResult) 
                            && (<HighlightedText text={conversionResult} queries={NBgraph.category} 
                                                    probs={NBgraph.value} result={NBResult} />)}
                        {(selectedResultType === "SVM") && (conversionResult) 
                            && (<HighlightedText text={conversionResult} queries={SVMgraph.category}
                                                    probs={SVMgraph.value} result={NBResult} />)}
                    </div>

                </div>
                <div>
                    <button
                    onClick={handleNBResult}
                    style={{
                        backgroundColor: selectedResultType === "NB" ? "#12c2e9" : "",
                        padding : "5px 10px 5px 10px",
                        margin: "0px 5px 10px 0px",
                        borderRadius: "32px",
                        border : "none",
                        boxShadow: "-6px -6px 10px rgba(255, 255, 255, 0.8), 6px 6px 10px rgba(0, 0, 0, 0.2)",
                        color: "#6f6cd",
                        cursor: "pointer",
                    }}
                    >
                    NB
                    </button>
                    <button
                    onClick={handleSVMResult}
                    style={{
                        backgroundColor: selectedResultType === "SVM" ? "#c471ed" : "",
                        padding : "5px 10px 5px 10px",
                        margin: "0px 0px 10px 5px",
                        borderRadius: "32px",
                        border : "none",
                        boxShadow: "-6px -6px 10px rgba(255, 255, 255, 0.8), 6px 6px 10px rgba(0, 0, 0, 0.2)",
                        color: "#6f6cd",
                        cursor: "pointer",
                    }}
                    >
                    SVM
                    </button>
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
                    {NBResult && (
                        <div>  :  {NBResult}</div>
                    )}
                </h3>
                <div className="section" style={{ display: "flex", justifyContent: "center" }}>
                    {loading ? (
                        <div style={{ display: "flex", justifyContent: "center", position: 'relative', top: '100%' }}>
                        <Oval
                            height={80}
                            width={80}
                            color="#12c2e9"
                            visible={loading}
                            ariaLabel="oval-loading"
                            secondaryColor="#12c2e9"
                            strokeWidth={2}
                            strokeWidthSecondary={2}
                        />
                        </div>
                    ) : null}

                    {NBgraph.category.length !== 0 && (
                        <div style={{ width: "100%", height: "120%" }}>
                            <div style={{ width: "33vw", height: "11vw", padding: "2.5vw 2vw 0vw 1.5vw" }}>
                                <Bar data={NBchartData} options={options} style={{}
                                } />
                            </div>
                        </div>
                    )}
                </div>
            </Div_NB>


            <Div_SVM>

                <h3 style={{ lineHeight: "3", display: "flex", margin: "0vw 0vw 0vw 2vw", height: "2vw" }}> SVM ( Support Vector Machine )
                    {SVMResult && (
                        <div>  :  {SVMResult}</div>
                    )}
                </h3>
                <div className="section" style={{ display: "flex", justifyContent: "center" }}>
                    {loading ? (
                        <div style={{ display: "flex", justifyContent: "center", position: 'relative', top: '100%' }}>
                        <Oval
                            height={80}
                            width={80}
                            color="#c471ed"
                            visible={loading}
                            ariaLabel="oval-loading"
                            secondaryColor="#c471ed"
                            strokeWidth={2}
                            strokeWidthSecondary={2}
                        />
                        </div>
                    ) : null}

                    {SVMgraph.category.length !== 0 && (
                        <div style={{ width: "100%", height: "120%" }}>
                        <div style={{ width: "33vw", height: "11vw", padding: "2.5vw 2vw 0vw 1.5vw" }}>
                            <Bar data={SVMchartData} options={options} style={{}
                            } />
                        </div>
                        </div>
                    )}
                    </div>
            </Div_SVM>
        </div>

    );
}