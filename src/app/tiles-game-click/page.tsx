"use client";

import clsx from "clsx";
import { Button } from "@mui/material";
import { useMachine } from "@xstate/react";
import { cloneDeep } from "lodash-es";
import { assign, setup } from "xstate";
import Confetti from "react-confetti";

type Tile = {
  id: number;
  row: number;
  col: number;
  realRow: number;
  realCol: number;
};

const _CONTAINER_WIDTH = 600;
const _TILE_COUNT = 9;
const _TILE_SIZE = _TILE_COUNT ** 0.5;
const context = {
  CONTAINER_WIDTH: _CONTAINER_WIDTH,
  TILE_COUNT: _TILE_COUNT,
  TILE_SIZE: _TILE_SIZE,
  selectedTiles: [] as Tile[],
  tiles: Array.from({ length: _TILE_COUNT }).map((_, i) => ({
    id: i,
    row: Math.floor(i / _TILE_SIZE),
    col: i % _TILE_SIZE,
    realRow: Math.floor(i / _TILE_SIZE),
    realCol: i % _TILE_SIZE,
  })) as Tile[],
};

const tileMachine = setup({
  types: {
    context,
  },
  actions: {
    shuffleTiles: assign({
      tiles: ({ context }) => {
        const tiles = cloneDeep(context.tiles);
        for (let i = tiles.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          // 交换tile后，保留当前下表对应的realRow和RealCol
          [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
          // 交换后，更新realRow和realCol
          [tiles[i].realRow, tiles[j].realRow] = [tiles[j].realRow, tiles[i].realRow];
          [tiles[i].realCol, tiles[j].realCol] = [tiles[j].realCol, tiles[i].realCol];
        }
        return tiles;
      },
    }),
    setSelectTile: assign({
      selectedTiles: ({ context, event }) => [...context.selectedTiles, event.tile],
    }),
    cleanSelectedTile: assign({
      selectedTiles: [],
    }),
    moveTile: assign({
      tiles: ({ context }) => {
        const tiles = cloneDeep(context.tiles);
        const { selectedTiles } = context;

        const { realRow: row, realCol: col } = selectedTiles[0]!;
        const { realRow: row2, realCol: col2 } = selectedTiles[1]!;
        const index = row * _TILE_SIZE + col;
        const index2 = row2 * _TILE_SIZE + col2;

        [tiles[index], tiles[index2]] = [tiles[index2], tiles[index]];
        [tiles[index].realRow, tiles[index2].realRow] = [tiles[index2].realRow, tiles[index].realRow];
        [tiles[index].realCol, tiles[index2].realCol] = [tiles[index2].realCol, tiles[index].realCol];

        return tiles;
      },
    }),
    resetGame: assign({ ...context }),
  },
  guards: {
    isEmptySelectedTiles: ({ context }) => context.selectedTiles.length === 0,
    isValidSelectedTile: ({ context, event }) => {
      if (!event.tile) return false;
      const { selectedTiles } = context;
      const { realRow: row, realCol: col } = selectedTiles[0]!;
      const { realRow: row2, realCol: col2 } = event.tile;
      return Math.abs(row - row2) + Math.abs(col - col2) === 1;
    },
    isDone: ({ context }) => {
      const { tiles } = context;
      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        if (tile.id !== i) {
          return false;
        }
      }
      return true;
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCWAbMBxAhgWzAGIAlAUQGVSAVAbQAYBdRUABwHtZU02A7ZkAB6IAjAE46AOlEAOYQCYArABZ5c4QroK5AGhABPRMolLRp00oBs0haYDM0pQF9HutJlwEJqCJkLkqAILEtIz87JzcfEiCiLYA7LYSckrxthZ0cQl0tqK6BghydNIScXRldMnCShmlFs6uGNj4YBIs6Dh6qDxQErBgmADGaN2EVACSADKkAPqUUwDCIUzR4VyovPxCCNKSYmYWchYa8tK2eYiZiRWyinTpCcJ1LiBuTZ5tHV09fYPDUKOTGZzUiLGjCZasDhrDbRLaWYoWWzyJTKOIKDS2M76C4JCTXeQae5Ip4NdzNVrtTrdXr9MBDSCEegQkCrSKbETZURJOKyazSKxVSznBCIuQSA5qeIWdSYqz1F6NDwtD5U760+kQRngsJQtmwxBKORxCTCOLCaRo4VKBx44S2OgqU2nawKZzPHhsCBwfivJU6iLrKKgLYAWnUEh25VSJgtpp02IQIcxePKdBOwk0Gldz195O8mH90KDMQQeyk2XkVVERoUFmFciRxkOtZMVRqd3lufelK+hb1wdiYr2pgORzTclOwpySiSiIqCke5jE2dJb2VPepPzpfz7gfZpYteNsNkxcTHJytshKc8UomXogsThzivJKq+NN+kF3MIHCGUkh2JQzSlREEnjfIFGkLkFBySCgPEaQoKfVclQkCBeDAb9iy2eREXFOhRBSOJqkedRhURRIEgfMpH3NDMn2cIA */
  id: "tileGame",
  context,
  initial: "idle",
  states: {
    idle: {
      on: {
        START: {
          target: "playing",
          actions: "shuffleTiles",
        },
      },
    },
    playing: {
      initial: "selecting",
      states: {
        selecting: {
          on: {
            TILE_SELECT: [
              {
                guard: "isEmptySelectedTiles",
                actions: "setSelectTile",
              },
              {
                target: "selected",
                guard: "isValidSelectedTile",
                actions: "setSelectTile",
              },
            ],
          },
        },
        selected: {
          entry: ["moveTile", "cleanSelectedTile"],
          always: [
            {
              guard: "isDone",
              target: "#done",
            },
            {
              target: "selecting",
            },
          ],
        },
      },
    },
    done: {
      id: "done",
      entry: "cleanSelectedTile",
    },
  },
  on: {
    RESET: {
      target: ".idle",
      actions: "resetGame",
    },
  },
});

export default function TilesGame() {
  const [state, send] = useMachine(tileMachine);

  const onClick = (tile: Tile) => () => {
    send({
      type: "TILE_SELECT",
      tile,
    });
  };

  return (
    <div className="tw:flex tw:justify-center tw:items-center tw:w-dvw tw:h-dvh tw:flex-col tw:space-y-4">
      <h1 className="tw:text-2xl tw:font-bold">Tiles Game </h1>
      <h2 className="tw:text-xl tw:font-bold">
        <div>
          <span>Selected Tiles: </span>
          {state.context.selectedTiles?.map((tile) => (
            <span key={tile.id}>{tile.id}</span>
          ))}
        </div>
        <span>Status: </span>
        {state.matches("idle") && <span>Idle</span>}
        {state.matches({ playing: "selecting" }) && <span>Selecting</span>}
        {state.matches({ playing: "selected" }) && <span>Selected</span>}
        {state.matches("done") && (
          <>
            <span>Done</span>
            <Confetti />
          </>
        )}
      </h2>

      <div
        className="tw:grid"
        style={{
          width: state.context.CONTAINER_WIDTH,
          height: state.context.CONTAINER_WIDTH,
          backgroundImage: 'url("/tile-game.png")',
          gridTemplateColumns: `repeat(${state.context.TILE_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${state.context.TILE_SIZE}, minmax(0, 1fr))`,
        }}
      >
        {state.context.tiles.map((tile) => {
          const { id, row, col } = tile;

          const tileWidth = state.context.CONTAINER_WIDTH / state.context.TILE_SIZE;

          return (
            <button
              key={id}
              className={clsx("tw:cursor-pointer tw:outline-offset-[-1px]", {
                "tw:outline": state.context.selectedTiles?.some((tile) => tile.id === id),
              })}
              style={{
                backgroundImage: "inherit",
                backgroundPosition: `${-col * tileWidth}px ${-row * tileWidth}px`,
              }}
              onClick={onClick(tile)}
            />
          );
        })}
      </div>

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
            Shuffle
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
