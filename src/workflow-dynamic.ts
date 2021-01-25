import { Machine } from "xstate";

export const dynamic = Machine({
  id: "dynamic",
  initial: "prerequisites",
  states: {
    prerequisites: {
      type: "parallel",
      onDone: "pump",
      states: {
        prepayment: {
          initial: "needed",
          states: {
            needed: {
              on: {
                PRE_PAY: "done"
              }
            },
            done: {
              type: "final"
            }
          }
        },
        grade: {
          initial: "needed",
          states: {
            needed: {
              on: {
                SELECT_GRADE: "done"
              }
            },
            done: {
              type: "final"
            }
          }
        }
      }
    },
    pump: {
      on: {
        PUMP_GAS: "done"
      }
    },
    done: {
      on: {
        RESET: "prerequisites"
      }
    }
  }
});
