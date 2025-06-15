"use client";

import { Button } from "@mui/material";
import { useActor, useMachine } from "@xstate/react";
import { setup } from "xstate";

const machine = setup({}).createMachine({
  id: "stateMachineActor",
  context: ({ input }: any) => ({
    rating: input.defaultRating,
  }),
  initial: "idle",
  states: {
    idle: {
      on: {
        START: "running",
      },
    },
    running: {
      on: {
        STOP: "idle",
      },
    },
  },
});

export default function StateMachineActorPage() {
  const [state, sent] = useMachine(machine, { input: { defaultRating: 5 } });

  console.log("Current state:", state.value);

  return (
    <div>
      <h1>State Machine Actor</h1>
      <p>This page will demonstrate the state machine actor pattern.</p>
      {/* Add your state machine actor implementation here */}

      <div>
        {state.matches("idle") && <div>is Idle</div>}
        {state.matches("running") && <div>is Running</div>}

        <div className="tw:flex tw:space-x-4">
          <div>
            <Button variant="contained" onClick={() => sent({ type: "START" })}>
              Start
            </Button>
          </div>
          <div>
            <Button variant="outlined" color="error" onClick={() => sent({ type: "STOP" })}>
              Stop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
