import React ,{ useState }from 'react';
import styled from "styled-components";


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


export default function VoiceBox(props){
    const [selectedSection, setSelectedSection] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [conversionResult, setConversionResult] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [selectedAudioFile, setSelectedAudioFile] = useState(null);

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
            border:"5px solid #00b12c",
            boxShadow : "0 0 10px 3px #00b12c",
            }}
        >
            <Div_txt>
                <div className="input-section">
                    <input type="file" accept="audio/*" onChange={handleAudioFileChange}/>
                    <button onClick={convertAudio}>변환</button>
                </div>
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