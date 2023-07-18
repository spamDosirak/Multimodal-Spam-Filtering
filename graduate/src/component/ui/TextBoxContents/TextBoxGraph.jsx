//https://goddino.tistory.com/191

// const chart1 = document.querySelector('.doughnut1');
// const chart2 = document.querySelector('.doughnut2');
// const chart3 = document.querySelector('.doughnut3');

// const makeChart = (percent, classname, color) => {
//   let i = 1;
//   let chartFn = setInterval(function() {
//     if (i <= percent) { // < 에서 <=로 수정
//       colorFn(i, classname, color);
//       i++;
//     } else {
//       clearInterval(chartFn);
//     }
//   }, 10);
// }

// const colorFn = (i, classname, color) => { //js로 css 적용
//   classname.style.background = "conic-gradient(" + color + " 0% " + i + "%, #dedede " + i + "% 100%)";
// }

// const replay = () => {
//   makeChart(80, chart1, '#f5b914');
//   makeChart(40, chart2, '#0A174E');
//   makeChart(60, chart3, '#66d2ce');
// }

// makeChart(80, chart1, '#f5b914');
// makeChart(40, chart2, '#0A174E');
// makeChart(60, chart3, '#66d2ce');