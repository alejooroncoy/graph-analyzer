// Función para generar las conexiones entre nodos dentro de un componente conexo y agrupar los 'to' en un array
function generateConnectionsForComponent(matrix: boolean[][], component: number[]) {
  const connections = [];

  for (let i = 0; i < component.length; i++) {
    const from = component[i]; // Convertimos de 0-index a 1-index
    const toNodes = [];

    for (let j = 0; j < component.length; j++) {
      const to = component[j]; // Convertimos de 0-index a 1-index

      // Verificamos si hay conexión entre los nodos del mismo componente
      if (matrix[component[i]][component[j]]) {
        toNodes.push(to);
      }
    }

    if (toNodes.length > 0) {
      connections.push({ from, to: toNodes });
    } else {
      connections.push({ from, to: [from] });
    }
  }

  return connections;
}


// Paso 1: Construcción de la matriz de adyacencia y agregar 1's en la diagonal
function createAdjacencyMatrix(matrix: boolean[][]): boolean[][] {
  const n = matrix.length;
  const matrixCopy = Array.from(matrix, row => row.slice()); // Copia de la matriz original

  // Asegurar que cada nodo está conectado consigo mismo
  for (let i = 0; i < n; i++) {
    matrixCopy[i][i] = true;
  }

  return matrixCopy;
}

// Paso 2: Algoritmo de Warshall para encontrar la matriz de caminos
function warshall(matrix: boolean[][]): boolean[][] {
  const n = matrix.length;
  const paths = matrix.map(row => row.slice()); // Copia de la matriz de adyacencia

  // Aplicar el algoritmo de Warshall
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        paths[i][j] = paths[i][j] || (paths[i][k] && paths[k][j]); // Cerradura transitiva
      }
    }
  }
  return paths;
}

// Paso 3: Ordenar las filas por el número de 1's (conexiones)
function sortRowsByConnections(matrix: boolean[][]): number[] {
  const counts = matrix.map(row => row.reduce((acc, val) => acc + (val ? 1 : 0), 0)); // Número de conexiones en cada fila

  const sortedIndices = counts
    .map((count, index) => ({ count, index }))
    .sort((a, b) => b.count - a.count) // Ordenar de mayor a menor
    .map(item => item.index);

  return sortedIndices;
}

// Paso 4: Ordenar las columnas de acuerdo al orden de las filas, manteniendo el índice original
function reorderMatrix(matrix: boolean[][], sortedIndices: number[]) {
  const n = matrix.length;
  const reorderedMatrix = [];

  // Guardar los índices originales
  const originalIndices = sortedIndices.map(index => index); // Clonar los índices originales

  // Reordenar filas
  for (let i = 0; i < n; i++) {
    reorderedMatrix[i] = matrix[sortedIndices[i]].slice();
  }

  // Reordenar columnas según el orden de las filas
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      reorderedMatrix[i][j] = matrix[sortedIndices[i]][sortedIndices[j]];
    }
  }

  // Devolvemos tanto la matriz reordenada como los índices originales
  return { reorderedMatrix, originalIndices };
}

// Función para identificar los bloques diagonales de 1's
function getDiagonalBlocks(matrix: boolean[][]): number[][] {
  const n = matrix.length;
  const visited = new Array(n).fill(false);
  const components = [];

  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      const component = [i]; // Empezamos con el nodo en la diagonal
      visited[i] = true; // Marcamos la fila i como visitada

      // Exploramos los nodos que están conectados dentro del bloque diagonal
      for (let j = i + 1; j < n; j++) {
        if (matrix[i][j] && matrix[j][i]) { // Verificamos que sea parte del bloque diagonal (bidireccional)
          component.push(j);
          visited[j] = true; // Marcamos también la columna correspondiente
        } else {
          break; // Si no hay conexión bidireccional, salimos del bloque
        }
      }

      // Añadimos el componente (bloque) encontrado
      components.push(component);
    }
  }

  return components;
}

// Función principal que ejecuta los pasos
function findConnectedComponents(matrix: boolean[][]): {
  steps: {
    adjacencyMatrix: boolean[][],
    pathMatrix: boolean[][],
    sortedIndices: number[],
    reorderedMatrix: boolean[][],
    originalIndices: number[],
    components: number[][],
  },
  components: { from: number, to: number[] }[][]
} {
  // Paso 1: Crear la matriz de adyacencia y agregar 1's en la diagonal
  const adjMatrix = createAdjacencyMatrix(matrix);

  // Paso 2: Calcular la matriz de caminos
  const pathMatrix = warshall(adjMatrix);

  // Paso 3: Ordenar las filas según el número de conexiones
  const sortedIndices = sortRowsByConnections(pathMatrix);

  // Paso 4: Reordenar las filas y columnas
  const { reorderedMatrix, originalIndices } = reorderMatrix(pathMatrix, sortedIndices);

  // Encontrar los bloques diagonales de 1's que representan los componentes conexos
  const components = getDiagonalBlocks(reorderedMatrix);

  // Convertir los índices de los componentes a los índices originales
  const componentsWithConnections = components.map(component => {
    // Convertir los índices del componente a los originales
    const originalComponent = component.map(index => originalIndices[index]);
    return generateConnectionsForComponent(matrix, originalComponent);
  });

  return {
    steps: {
      adjacencyMatrix: adjMatrix,
      pathMatrix,
      sortedIndices,
      reorderedMatrix,
      originalIndices,
      components,
    },
    components: componentsWithConnections,
  };
}


export default findConnectedComponents;