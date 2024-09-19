const isChangedComponents = (prev: { from: number, to: number[] }[][], next: { from: number, to: number[] }[][]) => {
  if (prev.length !== next.length) return true;

  for (let i = 0; i < prev.length; i++) {
    if (prev[i].length !== next[i].length) return true;
    
    for (let j = 0; j < prev[i].length; j++) {
      if (prev[i][j].from !== next[i][j].from) return true;
      if (prev[i][j].to.length !== next[i][j].to.length) return true;

      for (let k = 0; k < prev[i][j].to.length; k++) {
        if (prev[i][j].to[k] !== next[i][j].to[k]) return true;
      }
    }
  }

  return false;
}

export default isChangedComponents;