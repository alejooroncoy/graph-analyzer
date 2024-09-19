type Props = {
  matrix: boolean[][];
  toggleCell?: (i: number, j: number) => void;
};

const Matrix = ({ matrix, toggleCell }: Props) => {
  const getLetter = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="overflow-x-auto overflow-y-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2"></th>
            {matrix[0].map((_, index) => (
              <th key={index} className="p-2 font-bold text-foreground">
                {getLetter(index)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="p-2 pr-0 font-bold text-foreground">
                {getLetter(i)}
              </td>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`border border-border p-2 text-center cursor-pointer transition-colors duration-200 hover:bg-accent/50`}
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
