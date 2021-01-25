import { Machine } from "xstate";

export const linear = Machine({
  id: "linear",
  initial: "prepayment",
  states: {
    prepayment: {
      on: {
        PRE_PAY: "grade"
      }
    },
    grade: {
      on: {
        SELECT_GRADE: "pump"
      }
    },
    pump: {
      on: {
        PUMP_GAS: "done"
      }
    },
    done: {
      on: {
        RESET: "prepayment"
      }
    }
  }
});
