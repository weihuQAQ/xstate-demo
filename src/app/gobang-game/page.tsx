"use client";

import clsx from "clsx";
import { Button } from "@mui/material";
import { useMachine } from "@xstate/react";
import { assign, setup } from "xstate";
import Confetti from "react-confetti";

import { type Cell, type Player, GoBoard1 } from "@/components/go-board1";

const _BOARD_WIDTH = 17;
const context = {
  BOARD_WIDTH: _BOARD_WIDTH,
  board: Array.from<unknown, Cell>({ length: _BOARD_WIDTH ** 2 }, (_, i) => ({
    id: i,
    row: Math.floor(i / _BOARD_WIDTH),
    col: i % _BOARD_WIDTH,
    owner: Math.random() > 0.3 ? "white" : "black",
  })),
  currentPlayer: null as Player | null,
};

const gameMachine = setup({
  types: {
    context,
  },
  actions: {
    resetGame: assign({ ...context }),
  },
  guards: {
    isDone: () => {
      return false;
    },
  },
}).createMachine({
  id: "GobangGame",
  context,
  initial: "idle",
  states: {
    idle: {
      on: {
        START: {
          target: "playing",
        },
      },
    },
    playing: {
      initial: "selecting",
      states: {
        selecting: {},
        selected: {},
      },
    },
    done: {
      id: "done",
    },
  },
  on: {
    RESET: {
      target: ".idle",
      actions: "resetGame",
    },
  },
});

export default function GobangGame() {
  const [state, send] = useMachine(gameMachine);

  return (
    <div className="tw:flex tw:items-center tw:h-dvh tw:flex-col tw:space-y-4">
      <h1 className="tw:text-2xl tw:font-bold">Tiles Game </h1>
      <h2 className="tw:text-xl tw:font-bold">
        <span>Status: </span>
        {state.matches("idle") && <span>Idle</span>}
        {state.matches("done") && (
          <>
            <span>Done</span>
            <Confetti />
          </>
        )}
      </h2>

      <GoBoard1
        board={state.context.board}
        onClick={(cell) => {
          console.log(123, cell);
        }}
      />

      <div className="tw:flex tw:space-x-4">
        <div>
          <Button
            disabled={!state.matches("idle")}
            variant="contained"
            onClick={() => {
              send({
                type: "START",
              });
            }}
          >
            Start
          </Button>
        </div>
        <div>
          <Button
            disabled={state.matches("idle")}
            variant="contained"
            onClick={() => {
              send({
                type: "RESET",
              });
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
