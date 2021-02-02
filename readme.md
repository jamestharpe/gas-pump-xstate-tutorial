# Learn to define Statecharts!

To get started, open this project at <https://codesandbox.io/s/gas-pump-xstate-tutorial-7t4xz>. Follow the instructions in this readme to learn to define statecharts (a.k.a. workflows) step-by-step.

This tutorial convers how to define statecharts control how users flow through an application (in this case, a gas station). A dynamic UI is provided "out of the box" - coding skills are not required!

## Tips

- Move the XState Inspector _tab_ to a new _window_ to prevent it from taking focus when you save
- Save your work (`Ctrl`+`S`) as you go!
- The preview frame sometimes needs to be refreshed - use the in-frame refresh button rather than your browser's refresh button.

## Challenges

### A. Linear Gas Station Workflow

Define a statechart to map out the workflow of purchasing gasoline. Each step must be completed before proceeding to the next.

The steps are:

1. Accept a prepayment
2. Choose a grade
3. Pump the gas

#### 1. Get started

Open `workflow-linear.ts` and you should see code that looks like this:

```typescript
export const linear = Machine({
  // Put your code here
});
```

#### 2. Outline the required states

Update the code in `workflow-linear.ts` to define the required states from our workflow:

```typescript
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
```

On save, the XState inspection window will refresh to show the four states you just defined. The "prepayment" state will be highlighted because it is defined as the "initial" state.

Make sure to save your work so that it shows up!

#### 3. Define transitions between states

To get from one state to another, we define transition events by adding "on" to each state, then specifying an event name and target state in the format `EVENT_NAME: "targetState"`:

```typescript
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
        SELECT: "pump"
      }
    },
    pump: {
      on: {
        PUMP: "done"
      }
    },
    done: {
      on: {
        RESET: "prepayment"
      }
    }
  }
});
```

Make sure to save your work so that it shows up!

#### 4. Try it!

Congrats! You just built a simple UI based on a business defined workflow! Note that the application UI (on the right of the Code Sandbox) the XState inspection window will update interactively as you move through the flow. Try it out!

#### 5. Experiment (Optional)

Try to add a "BACK" event to each state that will take the user to the previous step of the workflow. Can you figure out how to do it? (hint: Add more events)

### B. Dynamic Gas Station Workflow

A "dynamic" workflow is one where the user can choose the path they take from one state to another, without violating the defined business rules. In the case of our gas station example, that can mean deciding to choose a grade first or to make the prepayment first. However, the user should not be able to pump gas unless a prepayment is made AND a grade is selected are done.

#### 1. Get started

Change the word `linear` to `dynamic` on line 12 of `index.ts`. Next, open `workflow-dynamic.ts` and you should see code that looks like this:

```typescript
export const dynamic = Machine({
  // Put your code here
});
```

We'll start with the linear workflow that you've already defined. Copy and paste the Linear Gas Station Workflow configuration as a starting point, remove all the transitions, and change the ID to "dynamic":

```typescript
export const dynamic = Machine({
  id: "dynamic",
  initial: "prepayment",
  states: {
    prepayment: {},
    grade: {},
    pump: {},
    done: {}
  }
});
```

Next, open `index.ts` and change the word "linear" on line 12 to "dynamic". This will tell the UI to use the dynamic workflow. The UI and XState Inspector should update when you save.

#### 2. Parallelize the Prepayment and Grade States

We want our users to be able to choose whether they select a grade or make a payment first. Therefore, these states must be available _in parallel_, meaning we can be in two states at once.

To do this, group them under their own nested state machine called `prerequisites` with `type: "parallel"` specified:

```typescript
export const dynamic = Machine({
  id: "dynamic",
  initial: "prerequisites",
  states: {
    prerequisites: {
      type: "parallel",
      states: {
        prepayment: {},
        grade: {}
      }
    },
    pump: {},
    done: {}
  }
});
```

When you save (`Ctrl+S`), the XState Inspector should show doted lines around the `prepayment` and `grade` states, indicating that they can be run in parallel.

#### 3. Add "done" states to `prepayment` and `grade`

For the `prerequisites` state to be completed, all child states must be in a state marked `"final"`. To do this, further nest each parallel state to distinguish between `needed` and `done` (a prepayment is either "needed" or "done", a grade selection is either "needed" or "done") - be sure to set the initial state for each as "needed". Mark the `done` state as `type: "final"`:

```typescript
export const dynamic = Machine({
  id: "dynamic",
  initial: "prerequisites",
  states: {
    prerequisites: {
      type: "parallel",
      states: {
        prepayment: {
          initial: "needed",
          states: {
            needed: {},
            done: {
              type: "final"
            }
          }
        },
        grade: {
          initial: "needed",
          states: {
            needed: {},
            done: {
              type: "final"
            }
          }
        }
      }
    },
    pump: {},
    done: {}
  }
});
```

For parallel state machines, only when all child state-machines are in a `type: "final"` state is the parent state-machine considered to be in a "final" state.

#### 3. Add Prerequisite Transitions

Add the following transitions:

- Add a `PAY` event to transition the `prepayment` state from `needed` to `done`
- Add a `SELECT_GRADE` event to transition the `prepayment` state from `needed` to `done`

Because the `done` state is `type:"final"` this indicates that the step is complete - when all child states are in a `type:"final"` state, the parent state is also completed.

When completed this, your code should look as follows:

```typescript
export const dynamic = Machine({
  id: "dynamic",
  initial: "prerequisites",
  states: {
    prerequisites: {
      type: "parallel",
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
    pump: {},
    done: {}
  }
});
```

#### 4. Enable the "pump" state when prerequisites are met

We have a _dependency_ between the prereqisite parallel states and the ability to pump gas: The grade _must_ be selected and the prepayment _must_ be made _before_ the user can be allowed to pump gas.

To accomplish this, we add a special `onDone` transition to the `prerequisites` state-machine:

```typescript
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
    pump: {},
    done: {}
  }
});
```

This tells our state machine that when all of the prerequisites are completed, automatically transition to the "pump" state.

(Note: You may notice that the `onDone` transition can technically be triggered without the `prerequisite` child states - this can be prevented with "guards" but guards are beyond the scope)

#### 5. Add the final transitions

Finally, add a `PUMP_GAS` event to transition from the `pump` state to the `done` state, and add the `RESET` event to transition from the `done` state back to `prerequisites`:

```typescript
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
```

You can now go through the entire, non-linear workflow! You can choose to pay first, then select a grade, or select a grade before you pay. However, you cannot pump gas unless you've done both because the workflow does not define a path that allows this.

### C. Switch!

Finally, to understand the power of this approach, try switching out the workflows on line 12 of `index.ts`. Note that the UI updates automatically as business requirements are changed!
