let colorApi = "http://www.thecolorapi.com/scheme?";


let quadColors;

const origQuadColors = [
  "#35e2f2",
  "#8c13fb",
  "#ff0080",
  "#f6df0e"
];

const bgColors = {
  dark: "#242424",
  overlay: "#151515A0"
}

const txtColor = {
  light: "#f7fcfe"
}

const orbColors = {
  random: (excp) => {
    let arr = [...quadColors];
    if (excp) arr.splice(arr.indexOf(excp), 1);
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

const checkpointColor = "#484848";

let colorPool = ['#C62828', '#1565C0', '#F9A825', '#FF8F00', '#EF6C00', '#D84315'];

async function initColors() {
  let randomCol = colorPool[Math.floor(Math.random() * colorPool.length)].substring(1);
  console.log(randomCol);
  let queryUrl = `${colorApi}hex=${randomCol}&count=4&mode=quad`;

  let res = await fetch(queryUrl);
  let colorData = await res.json();

  quadColors = Math.random() > .8 ? origQuadColors : colorData.colors.map(el => el.hex.value);

  console.log(quadColors);
}



