import { send, assign, Machine } from "xstate";

const context = {
  credit: 0,
  creditCardMessage: ""
};

const creditCardApi = {
  process(amount: number) {
    return new Promise((resolve, reject) => {
      console.log("creditCardApi, process...", amount);
      setTimeout(() => {
        console.log("creditCardApi, response received!", amount);
        if (amount <= 0) {
          return reject("Cannot charge less than $0");
        }

        if (amount <= 10) {
          return resolve(amount);
        }

        resolve(0);
      }, 300);
    });
  }
};

// interface PaymentSubmission extends AnyEventObject {
//   amount: number;
// }

export const paymentMachine = Machine<typeof context /*, PaymentSubmission*/>(
  {
    id: "payment",
    initial: "idle",
    context,
    states: {
      idle: {
        on: { SUBMIT_PAYMENT: "processing" }
      },
      processing: {
        invoke: {
          id: "process",
          src: (context, event) => {
            console.log("payment => processing", context, event);
            return creditCardApi.process(event.amount);
          },
          onDone: {
            target: "processed",
            actions: assign({
              credit: (context, event) => {
                console.log(
                  "payment => processing, done (credit)",
                  context,
                  event
                );
                return event.data as number;
              },
              creditCardMessage: (context, event) => {
                console.log(
                  "payment => processing, done (err)",
                  context,
                  event
                );
                return event.data ? "" : "Insufficient funds";
              }
            })
          },
          onError: {
            target: "error",
            actions: assign({
              creditCardMessage: (context, event) => {
                console.log(
                  "payment => processing, creditCardMessage",
                  context,
                  event
                );
                return event.data as string;
              }
            })
          }
        }
      },
      processed: {
        always: [
          {
            target: "accepted",
            cond: "hasCredit"
          },
          {
            target: "declined"
          }
        ]
      },
      accepted: {
        type: "final",
        entry: send((context, event) => ({
          type: "PAYMENT_ACCEPTED",
          payload: { credit: context.credit }
        }))
      },
      declined: {
        type: "final"
      },
      error: {
        on: {
          RETRY: "idle",
          CANCEL: "declined"
        }
      }
    }
  },
  {
    guards: {
      hasCredit: (context, event) => {
        console.log("payment => hasCredit", context, event);
        return context.credit > 0;
      },
      has0Credit: (context, event) => {
        console.log("payment => has0Credit", context, event);
        return context.credit === 0;
      }
    }
  }
);
