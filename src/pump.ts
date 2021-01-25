import { Machine, send } from "xstate";

const context = {
  gallons: 0
};

export const pumpMachine = Machine<typeof context>(
  {
    id: "pump",
    initial: "notReady",
    context,
    states: {
      notReady: {
        type: "parallel",
        onDone: "ready",
        states: {
          credit: {
            initial: "waiting",
            states: {
              waiting: {
                on: {
                  PAYMENT_ACCEPTED: "received"
                }
              },
              received: {
                type: "final"
              }
            }
          },
          grade: {
            initial: "notSet",
            states: {
              notSet: {
                on: {
                  GRADE_SELECTED: "set"
                }
              },
              set: {
                type: "final"
              }
            }
          },
          docked: {
            initial: "inPump",
            states: {
              inPump: {
                on: {
                  INSERT_PUMP: "inCar"
                }
              },
              inCar: {
                type: "final",
                on: {
                  RETRACT_PUMP: "inPump"
                }
              }
            }
          }
        }
      },
      ready: {
        on: {
          START_PUMP: "pumping"
        }
      },
      pumping: {
        entry: ["notifyPumpStarted"],
        on: { STOP_PUMP: "done" }
      },
      done: {
        type: "final"
      }
    }
  },
  {
    actions: {
      notifyPumpStarted: send((context, event) => ({ type: "PUMP_STARTED" }))
    }
  }
);
