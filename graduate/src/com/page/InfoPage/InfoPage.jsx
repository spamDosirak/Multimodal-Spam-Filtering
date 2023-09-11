import React, { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import Fade from "react-reveal/Fade"; // Import react-reveal(Fade)



import "./InfoPage.css"

import { Bar as Bar2 } from "react-chartjs-2";



//npm install react-reveal --save

//npm install react-slick --save



//background : linear-gradient(rgb(255, 253, 249),rgb(146, 144, 142),rgb(255, 253, 249));
// margin: 0.5vw;
//    border : 1px solid black;

const IntroBlock = styled.div`
    text-align: center;
    
   
    width: 85vw;
    height : 90vh;
    background :linear-gradient(
        #ECE9E6
        ,
        #FFFFFF
        ,
        #ECE9E6
        );
    background :none;

    border : none;
    border : 1px solid #f5f5f7;


    margin-bottom: 0px;
    @media (max-width: 768px) {
        padding: 25px;
    }
   line-height : 0.3;
    
`;

export default function InfoPage(props) {

  const data1 = {
    labels: ['데이터1', '데이터2', '데이터3', '데이터4', '데이터5', '데이터6', '데이터7', '데이터8', '데이터9'],
    datasets: [
      {
        label: '그래프 제목',
        backgroundColor: '#8276db',
        data: [50, 75, 29, 70, 90, 30, 55, 47, 90],
      },
    ],
  };
  const [data, setData] = useState(data1);
  const colors = ['#513fda', '#d87777', '#6f20c9']; // 3가지 색상 배열
  const [currentIndex, setCurrentIndex] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomColorIndex = (currentIndex % 3);
      const newBackgroundColor = data.datasets[0].data.map(() => colors[randomColorIndex]);
      setCurrentIndex(prevIndex => prevIndex + 1);

      const newData = {
        ...data,
        datasets: [
          {
            ...data.datasets[0],
            backgroundColor: newBackgroundColor,
            data: newBackgroundColor.map(() => Math.random() * 100),
          },
        ],
      };
      setData(newData);
    }, 1500);

    // 컴포넌트가 언마운트될 때 clearInterval로 인터벌 제거
    return () => clearInterval(interval);
  }, [data]);



  const options = {
    scales: {
      x: {
        display: false, // x축 레이블 숨기기
      },
      y: {
        display: false, // y축 레이블 숨기기
      },
    },
    plugins: {
      legend: {
        display: false, // 레이블 숨기기
      },
    },
  };








  return (
    <div

      style={{
        //alignItems : "center",
        textAlign: "center",
        // justifyContent : "center",
        //display : "flex",
        fontSize: "1vw",
        margin: "0",
        width: "100%",
        height: "310%",

        background: "#f5f5f7",
      }}
    >


      <Fade bottom duration={1500} >


        <IntroBlock>


          <br /><br /><br />
          <Fade bottom duration={1500} delay={1000} >
            <p style={{ fontSize: "5vw", margin: "1em 0.5em" }}>Is it</p>
          </Fade>

          <Fade bottom duration={1500} delay={1200}>
            <p style={{ fontSize: "6vw" }}><strong className="gradiHam">Ham </strong> or <strong className="gradiSpam" style={{}}>SPAM</strong>
            </p>
          </Fade>
          <Fade bottom duration={1500} delay={1400}>
            <p style={{ fontSize: "5vw" }}>?
            </p>
          </Fade>
          <br /><br /><br />
          <Fade bottom duration={1500} delay={1400}>
            <p style={{ fontSize: "2vw", lineHeight: "1.3", color: "grey" }} >
              우리 Spam Dosirak은  <br />
              보이스 피싱과 스팸 메일의 증가하는 추세에 따라 <br />
              스팸 여부를 판별하고 2차 피해의 방지를 목표로 합니다.
            </p>
          </Fade>
        </IntroBlock>



        <IntroBlock style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }} >

          <div style={{ width: "30%", height: "35%", margin: "none" }}>
            <Fade bottom duration={1500} delay={1700} >
              <div style={{ background: "white", borderRadius: "24px", width: "20vw", height: "70vh", margin: "8vh 1vw 1vh 5vw", lineHeight: "3" }}>
                SVM은 서로 다른 클래스를 지닌 데이터 사이의 간격이 최대가 되는 선이나 평면을 찾아 이를 기준으로 각 데이터들을 분류하는 모델이다.
                다시 말해 데이터 사이에 존재하는 여백(margin)을 최대화하여 일반화하는 성능을 극대화한 모델이다.
              </div>
            </Fade>
          </div>
          <div style={{ width: "40%", height: "35%", margin: "none" }}>
            <Fade bottom duration={1500} delay={300} >
              <p style={{ fontSize: "6vw", margin: "0.5em" }}>
                <strong className="gradiSVM">SVM</strong>
              </p>
            </Fade>

            <Fade bottom duration={1500} delay={550}>
              <p style={{ fontSize: "5vw" }}>
                and
              </p>
            </Fade>
            <Fade bottom duration={1500} delay={700}>
              <p style={{ fontSize: "6vw" }}>
                <strong className="gradiNB">NB</strong>
              </p>
            </Fade>
          </div>
          <div style={{ width: "30%", height: "35%", margin: "0" }}>
            <Fade bottom duration={1500} delay={1700} >
              <div style={{ background: "white", borderRadius: "24px", width: "20vw", height: "70vh", margin: "8vh 5vw 1vh 1vw", lineHeight: "3" }}>
                나이브 베이즈(Naive Bayes)분류기는 선형 모델과 매우 유사하다. 선형 모델(y=wx+b)과 형태가 같으나, 나이브 베이즈 모델의 계수 w는 기울기가 아니라서 선형 모델과는 의미가 다르다.

                {"https://databasecamp.de/en/ml/svm-explained"}
              </div>
            </Fade>

          </div>




          <br /><br /><br /><br /><br /><br />
          <Fade bottom duration={1500} delay={1100} >
            <p style={{ fontSize: "1.7vw", lineHeight: "1.3", color: "grey", padding: "6vw 0vw 0vw 0vw" }} >
              우리는 스팸을 판별하기 위해  <br />
              Naive Bayes 와 Support Vector Machine<br />
              두 가지 기법을 사용합니다.
            </p>
          </Fade>


        </IntroBlock>


        <IntroBlock style={{ lineHeight: "1", justifyContent: "center", alignItems: "center", justifyItems: "center" }}>


          <Fade bottom duration={1500} delay={1000} >
            <p style={{ fontSize: "7vw" }}>
              <strong className="gradiGraph">Graphs</strong>
            </p>


          </Fade>
          <br />
          <Fade bottom duration={1500} delay={1200} >
            <div style={{ width: "30vw", height: "13vw", alignContent: "center", margin: "0vh 30vw" }}>
              <Bar2 data={data} options={options} />
            </div>
          </Fade>


          <br />
          <Fade bottom duration={1500} delay={1400}>
            <p style={{ fontSize: "1.8vw", lineHeight: "1.3", color: "grey" }} >
              왜 스팸으로 분류 되었는지,혹은 왜 햄으로 분류 되었는지 <br />
              그래프로 한 눈에 확인하세요.
            </p>
          </Fade>

        </IntroBlock>




      </Fade>
    </div>
  );
}

