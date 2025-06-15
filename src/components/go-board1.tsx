import clsx from "clsx";
import { useMemo } from "react";

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
  { row: 2, col: 2 },
  { row: 2, col: 8 },
  { row: 2, col: 14 },
  { row: 8, col: 2 },
  { row: 8, col: 8, type: "Tengen" },
  { row: 8, col: 14 },
  { row: 14, col: 2 },
  { row: 14, col: 8 },
  { row: 14, col: 14 },
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
    <div className="tw:grid tw:border-3 tw:bg-amber-100">
      <div
        className="tw:grid"
        style={{
          gridTemplateColumns: "60px repeat(15, 40px) 60px",
          gridTemplateRows: "60px repeat(15, 40px) 60px",
        }}
      >
        {board.map(({ row, col, owner }) => (
          <button
            key={`${row}-${col}`}
            className="tw:relative tw:cursor-pointer"
            onClick={(e) => onClick?.({ row, col }, e)}
          >
            <div
              className={clsx("tw:absolute tw:top-1/2 tw:left-0 tw:w-full tw:h-[2px] tw:bg-black", {
                "tw:!top-2/3": row === 0,
                "tw:!top-1/3": row === 16,
              })}
            />
            <div
              className={clsx("tw:absolute tw:top-0 tw:left-1/2 tw:w-[2px] tw:h-full tw:bg-black", {
                "tw:!left-2/3": col === 0,
                "tw:!left-1/3": col === 16,
              })}
            />
            {stars.find((star) => star.row === row && star.col === col) && (
              <div className="tw:absolute tw:top-1/2 tw:left-1/2 tw:-translate-1/2 tw:w-3 tw:h-3 tw:bg-black tw:rounded-full"></div>
            )}

            {owner && (
              <div
                className={clsx(
                  "tw:absolute tw:top-1/2 tw:left-1/2 tw:-translate-1/2 tw:w-8 tw:h-8 tw:rounded-full",
                  "tw:shadow-lg tw:shadow-black/20", // 添加阴影效果
                  {
                    "tw:!top-2/3": row === 0,
                    "tw:!top-1/3": row === 16,
                    "tw:!left-2/3": col === 0,
                    "tw:!left-1/3": col === 16,
                    "tw:bg-gradient-to-b tw:from-gray-200 tw:to-gray-900": owner === "black", // 黑色棋子渐变
                    "tw:bg-gradient-to-b tw:from-white tw:to-gray-200": owner === "white", // 白色棋子渐变
                  }
                )}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
