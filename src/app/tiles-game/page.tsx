"use client";

import clsx from "clsx";
import { Button } from "@mui/material";
import { useMachine } from "@xstate/react";
import { cloneDeep } from "lodash-es";
import { useEffect, useRef } from "react";
import { and, assign, setup } from "xstate";

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
  selectedTile: null as Tile | null,
  hoveredTile: null as Tile | null,
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
      selectedTile: ({ event }) => event.tile,
    }),
    setHoverTile: assign({
      hoveredTile: ({ event }) => event.tile,
    }),
    cleanSelectedTile: assign({
      selectedTile: null,
    }),
    cleanHoveredTile: assign({
      hoveredTile: null,
    }),
    moveTile: assign({
      tiles: ({ context }) => {
        const tiles = cloneDeep(context.tiles);
        const { selectedTile, hoveredTile } = context;

        const { realRow: row, realCol: col } = selectedTile!;
        const { realRow: row2, realCol: col2 } = hoveredTile!;
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
    hasSelectedTile: ({ context }) => context.selectedTile !== null,
    hasHoveredTile: ({ context }) => context.hoveredTile !== null,
    isValidHoverTile: ({ context, event }) => {
      if (!event.tile) return false;
      const { selectedTile } = context;
      const { realRow: row, realCol: col } = selectedTile!;
      const { realRow: row2, realCol: col2 } = event.tile;
      return Math.abs(row - row2) + Math.abs(col - col2) === 1;
    },
    hasTile: and(["hasSelectedTile", "hasHoveredTile"]),
    isValidMoveState: and(["hasSelectedTile", "isValidHoverTile"]),
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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCWAbMBxAhgWzAGIAlAUQGVSAVAbQAYBdRUABwHtZU02A7ZkAB6IALACYANCACeiABwBGAHQBWOmvmrls5QHYAbHVkBfI5LSZcBRagiZC5KgEFitRv3adufJIMQBmOmFFWWE-HR1lPR0ATmFZWT1JGQQFFTU6DTotXQNjUxBzbHwwRRZ0HClUHihCeiYfDy5UXn4hFL89RT9QmL0-SNlREKTEPXlRFT9o+R1hOmis2OUTMwwiqzKKqqhFWDBMAGM0asIqAEkAGVIAfUorgGFXetYOJpafNtUg4T0EiL95LI6FF5MIRghhLpFNFlADdAkQqEYSsCmtLCVNpVqrt9mAjpBTpcbgAJADyADVSMQ6u5Xl5Woh5N1FPJ5mEFtpQfJQeC9HNFGMdEMFAC-KIdHlVhZiqVylidntDsgCecrtcyZTqfJniBGvSPnIdODlMIgno+fIDH4gXR+tEUYV0bKttjFXjlRBCWqALIU0g0hp05reUBtMTKNLqKKBaKybrgnR0Cb6XTw-pTaL2-KOmWY7Y4pUqonXX2Umja2meYMMiGiCOqKOJ4Sx+PSRBaOhdZRLCXKeTRUT9kz5HhsCBwfg5giVt4h3wIAC00XBC4jmfXG83fgdaJlNkwM-1ocZ2mCPVCoN0rPk4NZQSFel0cw6EtCeh30o2cu2h+rBoQUzgmEnaQgCYhArGUSyDoH7rBi36uriRw-oGVbvMeCC-BGBjRNadbAmKkS8v2XTjN2aiyAszbLNmu5fi6CpIR6v7ofO-ZKBE6jhOuDZ+AmwhKLogQaPEohjMitGfiUEC8GALFzm0MLRMEnExlkg6yMaOh+IotrTDMgwJD877DkAA */
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
      always: [
        {
          target: "#done",
          guard: "isDone",
        },
      ],
      states: {
        selecting: {
          on: {
            TILE_SELECT: {
              target: "selected",
              actions: ["cleanHoveredTile", "setSelectTile"],
            },
          },
        },
        selected: {
          on: {
            TILE_HOVER: [
              {
                guard: "isValidMoveState",
                actions: "setHoverTile",
              },
              {
                actions: "cleanHoveredTile",
              },
            ],
            TILE_MOVE: [
              {
                target: "selecting",
                guard: "hasTile",
                actions: ["moveTile", "cleanSelectedTile", "cleanHoveredTile"],
              },
              {
                target: "selecting",
                actions: ["cleanSelectedTile", "cleanHoveredTile"],
              },
            ],
          },
        },
      },
    },
    done: {
      id: "done",
      entry: ["cleanSelectedTile", "cleanHoveredTile"],
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

  const onMouseDown = (tile: Tile) => () => {
    send({
      type: "TILE_SELECT",
      tile,
    });
  };
  const onMouseEnter = (tile: Tile) => () => {
    send({
      type: "TILE_HOVER",
      tile,
    });
  };
  const onMouseLeave = () => {
    send({
      type: "TILE_HOVER",
    });
  };
  const onMouseUp = () => {
    send({
      type: "TILE_MOVE",
    });
  };

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div className="tw:flex tw:justify-center tw:items-center tw:w-dvw tw:h-dvh tw:flex-col tw:space-y-4">
      <h1 className="tw:text-2xl tw:font-bold">Tiles Game </h1>
      <h2 className="tw:text-xl tw:font-bold">
        <span>Status: </span>
        {state.matches("idle") && <span>Idle</span>}
        {state.matches({ playing: "selecting" }) && <span>Selecting</span>}
        {state.matches({ playing: "selected" }) && <span>Selected</span>}
        {state.matches("done") && <span>Done</span>}
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
                "tw:outline": state.context.selectedTile?.id === id || state.context.hoveredTile?.id === id,
              })}
              style={{
                backgroundImage: "inherit",
                backgroundPosition: `${-col * tileWidth}px ${-row * tileWidth}px`,
              }}
              onMouseDown={onMouseDown(tile)}
              onMouseEnter={onMouseEnter(tile)}
              onMouseLeave={onMouseLeave}
              onMouseUp={onMouseUp}
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
