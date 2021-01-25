import "./styles.css";
import { Machine, interpret } from "xstate";
import { inspect } from "@xstate/inspect";
import { dynamic } from "./workflow-dynamic";
import { linear } from "./workflow-linear";

inspect({
  url: "https://statecharts.io/inspect",
  iframe: false
});

const workflow = interpret(dynamic, { devTools: true });

// Coders only beyond this point!

(window as any).workflow = workflow;

function render() {
  document.getElementById("app").innerHTML = `
  <section>
    <h1>The Atlas Gas Station</h1>
    <div>
    ${(window as any).workflow.state.nextEvents
      .filter(
        (e: string) =>
          !e.startsWith("done.") && !e.startsWith("error.") && !e.endsWith("ED")
      )
      .reduce(
        (prev: string, cur: string) =>
          `${prev}
          <button onclick="window.workflow.send('${cur}')">${cur}!</button>`,
        ""
      )}
    </div>
    <!--
    <p>
      Open the <strong>Console</strong> to view the machine output.
    </p>
    <h2>Shared Context</h2>
    <pre>${JSON.stringify(workflow.state, 0, 2)}</pre>
    -->
  </section>
  `;
}

workflow
  .onTransition((state, event) => {
    console.log(`superService.onTransition`, state, event);
    render();
  })
  .start();

render();
