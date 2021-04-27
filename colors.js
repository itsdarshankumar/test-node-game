const quadColors = {
  cyan: "#35e2f2",
  magenta: "#8c13fb",
  pink: "#ff0080",
  yellow: "#f6df0e"
}

const bgColors = {
  dark: "#242424",
  overlay: "#15151580"
}

const orbColors = {
  light: "#ffffff",
  random: () => {
    let arr = Object.values(quadColors);
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

const checkpointColor = "#484848";