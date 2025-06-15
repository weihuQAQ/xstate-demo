import { assign, fromPromise, setup } from "xstate";
import {
  mockFetchUser,
  mockSignin,
  mockFetchSubscription,
  mockSubscribe,
  mockFetchPoints,
  mockDonate,
} from "@/api/pointsMockApi";

export const pointsMachine = setup({
  actors: {
    mockFetchUser: fromPromise(mockFetchUser),
    mockSignin: fromPromise(mockSignin),
    mockFetchSubscription: fromPromise(mockFetchSubscription),
    mockSubscribe: fromPromise(mockSubscribe),
    mockFetchPoints: fromPromise(mockFetchPoints),
    mockDonate: fromPromise(mockDonate),
  },
  actions: {
    assignUser: assign({
      user: ({ event }) => {
        console.log(123, event);
        return { id: event.output?.id };
      },
    }),
  },
  guards: {
    isValidUser: ({ event }) => !!event.output?.id,
    isValidOutput: ({ event }) => !!event.output,
  },
  types: {
    context: {
      user: null as null | { id: string },
      subscription: null as null | { subscribed: boolean },
      points: 0,
      donateResult: null as null | boolean,
    },
  },
}).createMachine({
  id: "points",
  initial: "unauthenticated",
  context: {
    user: null,
    subscription: null,
    points: 0,
    donateResult: null,
  },
  states: {
    unauthenticated: {
      invoke: {
        src: "mockFetchUser",
        onDone: [
          {
            target: "authenticated",
            actions: "assignUser",
            guard: "isValidOutput",
          },
          { target: "unauthenticated" },
        ],
        onError: { target: "unauthenticated" },
      },
      on: {
        SIGNIN: "signing_in",
      },
    },
    signing_in: {
      invoke: {
        src: "mockSignin",
        onDone: [
          {
            target: "authenticated",
            actions: "assignUser",
            guard: "isValidUser",
          },
          {
            target: "unauthenticated",
          },
        ],
        onError: "unauthenticated",
      },
    },
    authenticated: {
      initial: "subscription_loading",
      entry: assign({ subscription: null }),
      states: {
        subscription_loading: {
          invoke: {
            src: "mockFetchSubscription",
            onDone: [
              {
                target: "subscribed",
                guard: ({ event }) => event.output.subscribed,
                actions: assign({
                  subscription: ({ event }) => event.output,
                }),
              },
              {
                target: "not_subscribed",
                actions: assign({
                  subscription: ({ event }) => event.output,
                }),
              },
            ],
          },
        },
        not_subscribed: {
          on: {
            SUBSCRIBE: "subscribing",
          },
        },
        subscribing: {
          invoke: {
            src: "mockSubscribe",
            onDone: {
              target: "subscribed",
              actions: assign({ subscription: () => ({ subscribed: true }) }),
            },
            onError: "not_subscribed",
          },
        },
        subscribed: {
          // initial: "points_empty",
          initial: "points_loading",
          entry: assign({ points: 0 }),
          invoke: {
            src: "mockFetchPoints",
            onDone: [
              {
                target: ".points_available",
                guard: ({ event }) => event.output.points > 0,
                actions: assign({
                  points: ({ event }) => event.output.points,
                }),
              },
              {
                target: ".points_empty",
                actions: assign({
                  points: ({ event }) => event.output.points,
                }),
              },
            ],
          },
          states: {
            points_loading: {},
            points_empty: {},
            points_available: {
              on: {
                DONATE: "donating",
              },
            },
            donating: {
              invoke: {
                src: "mockDonate",
                onDone: [
                  {
                    target: "donate_success",
                    guard: ({ event }) => event.output.success,
                  },
                  { target: "donate_failed" },
                ],
              },
            },
            donate_success: {
              on: {
                FETCH_POINTS: "points_available",
              },
              entry: assign({ points: 0 }),
            },
            donate_failed: {
              on: {
                RETRY: "points_available",
              },
            },
          },
          on: {
            FETCH_POINTS: [
              {
                target: ".points_empty",
                guard: (ctx) => ctx.context.points === 0,
              },
              {
                target: ".points_available",
                guard: (ctx) => ctx.context.points > 0,
              },
            ],
          },
        },
      },
    },
  },
});
