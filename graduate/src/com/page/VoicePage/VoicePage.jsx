import React ,{ useState ,useRef }from 'react';
import styled from "styled-components";


const Div_txt = styled.div`
    width:50%;
    height:100%;
    float:left;
    border : 1px solid rgb(212, 210, 224);


    align-items : center;
`;

const Div_graph = styled.div`
    width:45%;
    height:50%;
    float:left;
    border:1px solid rgb(212, 210, 224);
`;

const Div_result = styled.div`
    width:45%;
    height:50%;
    float:left;
    border:1px solid rgb(212, 210, 224);
`;

const RealTimeAudioBar = styled.div`
    height: 10%;
    width: 90%;
    border: 1px solid black;
    margin: 1vw;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export default function VoicePage(props){
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

    return(
        <div
        className='voiceContainer'
        style={{
            //alignItems : "center",
            textAlign: "center",
            // justifyContent : "center",
            //display : "flex",
            fontSize : "1vw",
            margin : "0.5vw",
            width:"80vw",
            height:"100%",
            }}
        >
            <Div_txt>
                <div className="input-section">
                    <input type="file" accept="audio/*" onChange={handleAudioFileChange}/>
                    <button class = "geomsaButton" onClick={convertAudio}>변환</button>
                </div>


                <RealTimeAudioBar>
                    <audio ref={audioRef} controls muted={isRecording ? false : true} />
                </RealTimeAudioBar>
                
                <button className="geomsaButton" onClick={handleStartRecording}>녹음 시작</button>
                <button className="geomsaButton" onClick={handleStopRecording}>녹음 종료</button>



            </Div_txt>
            <Div_graph>

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