"use client";

import { Button } from "@mui/material";
import { useMachine } from "@xstate/react";
import clsx from "clsx";
import { assertEvent, assign, setup } from "xstate";

type Player = "X" | "O";
const players: Player[] = ["X", "O"];
const initialPlayer = players[0];
const context = {
  board: Array(9).fill(null) as Array<Player | null>,
  moves: 0,
  player: initialPlayer,
  winner: undefined as Player | undefined,
};

const machine = setup({
  types: { context },
  guards: {
    checkWin: ({ context }) => {
      const { board } = context;
      const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
      for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return true;
        }
      }
      return false;
    },
    checkDraw: ({ context }) => {
      return context.moves === 9;
    },
    isValidMove: ({ context, event }) => {
      if (event.type !== "PLAY") {
        return false;
      }
      return context.board[event.value] === null;
    },
  },
  actions: {
    updateBoard: assign({
      board: ({ context, event }) => {
        const updatedBoard = [...context.board];
        updatedBoard[event.value] = context.player;
        return updatedBoard;
      },
      moves: ({ context }) => context.moves + 1,
      player: ({ context }) => (context.player === "X" ? "O" : "X"),
    }),
    setWinner: assign({
      winner: ({ context }) => (context.player === "X" ? "O" : "X"),
    }),
    resetGame: assign(context),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCWBjAtMghl5A9mAHQAOANjgJ6oB2UAxAAoAyAggJoDaADALqJQpArFRoCtQSAAeiACwAmADQgqiBQFYexAGwK5ADh0BmA3I0BGAOwWAvrZVp8ebETKUa9BrwFIQw0XFJP1kEfQViAE4ePQ0rPUjjSPNjFTUEYwsDYgUeYx4LRL0rOUiLHXtHDGwXQhIKajpGLgtfIRExVAkpUPComM14hUTkjVTVRGMdORy8vLk9CzGDBUqQJxr8NygcAFswAHkANzAAJwYAJQBRAGUrgBUfKQDO7pDEcuyLQqtI6eMtKZ9GlEAYLMRSpEoQC5IYrAYeHJ7A4QLQCBA4FINrgtmBnh0gj1EJgdCCECTiDwqdSaTSrGtsbU3A1PFB8YEusFQKEVlExhZNJExjoSsMyQDwXFfn85CUNDoNHEGdUca4SDt9sczuzXlyZPJ8sQDNFpjxNAZ4SayeVIhD+QodNZFFYHcrnLjiBrDidTsQAO50WjavwvQnvBCy7LGmJyM0aC3R0kTMLyvn5IUKnQ6UZuzZqz17b1nYgQU44P06sPc+Two0m2Pmy0xcV6O35UoGBHGBRWYzI2xAA */
  id: "tic-tac-toe",
  initial: "playing",
  context,
  states: {
    playing: {
      always: [
        { target: "gameOver.winner", guard: "checkWin" },
        { target: "gameOver.draw", guard: "checkDraw" },
      ],
      on: {
        PLAY: [
          {
            target: "playing",
            guard: "isValidMove",
            actions: "updateBoard",
          },
        ],
      },
    },
    gameOver: {
      initial: "winner",
      states: {
        winner: {
          tags: "winner",
          entry: "setWinner",
        },
        draw: {
          tags: "draw",
        },
      },
      on: {
        RESET: {
          target: "playing",
          actions: "resetGame",
        },
      },
    },
  },
});

function Tile(props: { index: number; onClick: () => void; player: Player | null }) {
  const { index, onClick, player } = props;
  return (
    <div
      className={clsx({
        "tw:border-b": index < 6,
        "tw:border-r": index % 3 !== 2,
      })}
      key={index}
      onClick={onClick}
      data-player={player}
    >
      {player}
    </div>
  );
}

export default function Page() {
  const [state, send] = useMachine(machine);

  return (
    <div className="game">
      <h1>Tic-Tac-Toe</h1>
      {state.matches("gameOver") && (
        <div>
          {state.hasTag("winner") && <h2>Winner: {state.context.winner}</h2>}
          {state.hasTag("draw") && <h2>Draw</h2>}
          <Button variant="contained" onClick={() => send({ type: "RESET" })}>
            Reset
          </Button>
        </div>
      )}
      <div className="tw:grid tw:grid-rows-3 tw:grid-cols-3 tw:w-50 tw:h-50">
        {Array.from({ length: 9 }).map((_, index) => {
          return (
            <Tile
              key={index}
              index={index}
              onClick={() => send({ type: "PLAY", value: index })}
              player={state.context.board[index]}
            />
          );
        })}
      </div>
    </div>
  );
}
