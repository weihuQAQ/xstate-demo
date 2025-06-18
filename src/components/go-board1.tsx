import clsx from "clsx";

export type Player = "white" | "black";

export interface Cell {
  id: number;
  row: number;
  col: number;
  owner: Player | null;
}

export interface GoBoard1Props {
  board?: Cell[];
  onClick?: (cell: Omit<Cell, "id" | "owner">, e: React.MouseEvent<HTMLButtonElement>) => void;
}

const stars = [
  { row: 3, col: 3 },
  { row: 3, col: 9 },
  { row: 3, col: 15 },
  { row: 9, col: 3 },
  { row: 9, col: 9 },
  { row: 9, col: 15 },
  { row: 15, col: 3 },
  { row: 15, col: 9 },
  { row: 15, col: 15 },
];

const emptyBoard = Array.from<unknown, Cell>({ length: 17 ** 2 }, (_, i) => ({
  id: i,
  row: Math.floor(i / 17),
  col: i % 17,
  owner: null,
}));

export function GoBoard1({ board: _board, onClick }: GoBoard1Props) {
  const board = _board ?? emptyBoard;

  return (
    <div className="">
      <div
        className="tw:grid tw:bg-amber-100"
        style={{
          gridTemplateColumns: "repeat(19, 40px)",
          gridTemplateRows: "repeat(19, 40px)",
        }}
      >
        {board.map(({ row, col, owner }) => (
          <button
            key={`${row}-${col}`}
            className="tw:relative tw:cursor-pointer tw:group"
            onClick={(e) => onClick?.({ row, col }, e)}
          >
            <div
              className={clsx("tw:absolute tw:top-1/2 tw:w-full tw:-translate-y-1/2 tw:h-[2px] tw:bg-black", {
                "tw:!w-[calc(50%+1px)] tw:!right-0": col === 0,
                "tw:!w-[calc(50%+1px)] tw:!left-0": col === 18,
              })}
            />
            <div
              className={clsx("tw:absolute tw:top-0 tw:left-1/2 tw:-translate-x-1/2 tw:w-[2px] tw:h-full tw:bg-black", {
                "tw:!h-[calc(50%+1px)] tw:!top-1/2": row === 0,
                "tw:!h-[calc(50%+1px)] tw:top-0": row === 18,
              })}
            />
            {stars.find((star) => star.row === row && star.col === col) && (
              <div className="tw:absolute tw:top-1/2 tw:left-1/2 tw:-translate-1/2 tw:w-3 tw:h-3 tw:bg-black tw:rounded-full"></div>
            )}

            <div
              className={clsx(
                "tw:absolute tw:top-1/2 tw:left-1/2 tw:-translate-1/2 tw:w-8 tw:h-8 tw:rounded-full tw:group-hover:!block tw:group-hover:opacity-50",
                {
                  "tw:hidden": !owner,
                  "tw:bg-gradient-to-b tw:from-gray-400 tw:to-gray-900": owner === "black" || !owner, // 黑色棋子渐变
                  "tw:bg-gradient-to-b tw:from-white tw:to-gray-300 tw:border tw:border-gray-300":
                    owner === "white" || !owner, // 白色棋子渐变
                }
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
