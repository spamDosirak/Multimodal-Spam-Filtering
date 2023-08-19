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
  width: 95%;
  height: 20%;
  float: left;
 

  display: flex;
  padding: 2vw 2vw 2vw 2vw;
`;

const Div_txtShow = styled.div`
  width: 40%;
  height: 70%;
  float: left;
 
  margin: 0px 4px;
  
`;

const Div_NB = styled.div`
  width: 58%;
  height: 34%;
  float: left;
  border: 1px solid rgb(212, 210, 224);
  margin: 0px 4px;
  display: flex;
  flex-direction: column;

`;

const Div_SVM = styled.div`
  width: 58%;
  height: 35%;
  float: left;
  border: 1px solid rgb(212, 210, 224);
  margin: 0px 4px;
`;

export default function TextPage(props) {
  const [selectedSection, setSelectedSection] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [conversionResult, setConversionResult] = useState([{}]);
  const [NBgraph, setNBGraph] = useState({ category: [], value: [] });
  const [SVMgraph, setSVMGraph] = useState({ category: [], value: [] });

  const [loading, setLoading] = useState(false);
  const [test, setTest] = useState(true);

  const handleSectionChange = (section) => {
    setSelectedSection(section);
  };

  const handleConvert = () => {
    setLoading(true);
    setNBGraph({ category: [], value: [] });
    setSVMGraph({ category: [], value: [] });
    setConversionResult([{}]);
    fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ section: selectedSection, value: inputValue }),
    })
      .then((response) => response.json())
      .then((data) => {
        // 요청에 대한 응답 처리

        setConversionResult(data);
        setNBGraph(data.vocabs1);
        setSVMGraph(data.vocabs2);

        setLoading(false);
      })
      .catch((error) => {
        // 에러 처리
      });
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const NBchartData = {

    labels: NBgraph.category,
    datasets: [
      {
        label: "NB : Top 5 Words",
        data: NBgraph.value,
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

    labels: SVMgraph.category,
    datasets: [
      {
        label: "SVM : Top 5 Words",
        data: SVMgraph.value,
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
      className="textContainer"
      style={{
        textAlign: "center",
        fontSize: "1vw",
        margin: "0.5vw",
        width: "80vw",
        height: "100%",
      }}
    >
      <Div_txt>
        <TextInput
          style={{
            paddingHorizontal: "10px",
            width: "80%",
          }}
          numberOfLines={4}
          multiline="true"
          mode="outlined"
          placeholder="텍스트를 입력하세요."
          value={inputValue}
          onChange={handleInputChange}
        />
        <button
          className="textTestBtn"
          style={{
            float: "right",
            margin: "2vw 0vw 2vw 3vw",
          }}
          onClick={handleConvert}
        >
          {" "}
          VERIFY SPAM
        </button>
      </Div_txt>


      <Div_txtShow>
        <div style={{
          margin: "20px",
          width: "90%",
          height: "90%",
          background: " #f8f8f8",
          borderRadius: "32px",
          boxShadow: "-6px -6px 10px rgba(255, 255, 255, 0.8), 6px 6px 10px rgba(0, 0, 0, 0.2)",

        }}>
          <div style={{
            overflow: "scroll",
            fontSize: "20px",
            scrollbarColor: "black",
            width: "80%",
            height: "80%",
            textAlign: "center",
            lineHeight: "1.8",
            padding: "2vw",
          }}>
            {(NBgraph.category.length != 0) && (<HighlightedText text={inputValue} queries={NBgraph.category} />)}
          </div>
        </div>
      </Div_txtShow>


      <Div_NB>

        <h3 style={{ lineHeight: "3", display: "flex", margin: "0vw 0vw 0vw 2vw", height: "2vw" }}> NB ( Naive Bayes )
          {conversionResult && (
            <div>  :  {conversionResult.result1}</div>
          )} </h3>


        <div className="section" style={{ display: "flex", justifyContent: "center" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
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

          {NBgraph.category.length != 0 && (
            <div style={{ width: "100%", height: "120%" }}>
              <div style={{ width: "35vw", height: "11vw", padding: "0vw 2vw 0vw 8vw" }}>
                <Bar data={NBchartData} options={options} style={{}
                } />
              </div>
            </div>
          )}
        </div>
      </Div_NB>


      <Div_SVM>
        <h3 style={{ lineHeight: "3", display: "flex", margin: "0vw 0vw 0vw 2vw", height: "2vw" }}> SVM ( Support Vector Machine )
          {conversionResult && (
            <div>  :  {conversionResult.result2}</div>
          )} </h3>

        <div className="section" style={{ display: "flex", justifyContent: "center" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
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

          {SVMgraph.category.length != 0 && (
            <div style={{ width: "100%", height: "120%" }}>
              <div style={{ width: "35vw", height: "11vw", padding: "0vw 2vw 0vw 8vw" }}>
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
