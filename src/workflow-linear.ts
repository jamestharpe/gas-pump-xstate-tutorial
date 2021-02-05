import { Machine } from "xstate";

export const linear = Machine({
  id: "linear",
  initial: "prepayment",
  states: {
    prepayment: {},
    grade: {},
    pump: {},
    done: {}
  }
});