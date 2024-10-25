type HighlightArea = {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  color?: string;
};

type Props = {
  matrix: boolean[][];
  indices?: number[] | null;
  toggleCell?: (i: number, j: number) => void;
  highlightAreas?: HighlightArea[];
  defaultHighlightColor?: string;
};

const Matrix = ({ 
  matrix, 
  toggleCell, 
  indices = null, 
  highlightAreas = [],
  defaultHighlightColor = 'rgba(255, 0, 0, 0.2)' // Color rojo semi-transparente por defecto
}: Props) => {
  const getLetter = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  const getHighlightColor = (row: number, col: number) => {
    for (const area of highlightAreas) {
      const { startRow, startCol, endRow, endCol, color } = area;
      if (row >= startRow && row <= endRow && col >= startCol && col <= endCol) {
        return color || defaultHighlightColor;
      }
    }
    return undefined;
  };

  return (
    <div className="overflow-x-auto overflow-y-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2"></th>
            {matrix[0].map((_, index) => (
              <th key={index} className="p-2 font-bold text-foreground">
                {getLetter(indices ? indices[index] : index)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="p-2 pr-0 font-bold text-foreground">
                {getLetter(indices ? indices[i] : i)}
              </td>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`border border-border p-2 text-center cursor-pointer transition-colors duration-200 hover:bg-accent/50`}
                  style={{
                    backgroundColor: getHighlightColor(i, j),
                  }}
                  onClick={() => toggleCell && toggleCell(i, j)}
                  role="button"
                  aria-label={`Cambiar valor en fila ${getLetter(
                    i
                  )}, columna ${getLetter(j)}. Actualmente ${
                    cell ? "verdadero" : "falso"
                  }.`}
                >
                  {Number(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Matrix;