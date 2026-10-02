/* global Plotly */

const form = document.querySelector("#controls");
const button = document.querySelector("#simulate-button");
const status = document.querySelector("#status");
const directionProbabilitiesPreview = document.querySelector(
  "#direction-probabilities-preview",
);

const summary = {
  finalPopulation: document.querySelector("#final-population"),
  particlesCreated: document.querySelector("#particles-created"),
  maximumGeneration: document.querySelector("#maximum-generation"),
  meanFinalPosition: document.querySelector("#mean-final-position"),
  minPosition: document.querySelector("#min-position"),
  maxPosition: document.querySelector("#max-position"),
  minFinalPosition: document.querySelector("#min-final-position"),
  maxFinalPosition: document.querySelector("#max-final-position"),
  maxFinalDistance: document.querySelector("#max-final-distance"),
  maxDistance: document.querySelector("#max-distance"),
  maxDistanceTime: document.querySelector("#max-distance-time"),
  firstBranchTime: document.querySelector("#first-branch-time"),
  originVisits: document.querySelector("#origin-visits"),
  proportionTimePositive: document.querySelector("#proportion-time-positive"),
  summaryNote: document.querySelector("#summary-note"),
};

const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
});

let latestResult = null;
let requestId = 0;

function randomSeed() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0];
}

function getSpatialDimensions(graphMode) {
  switch (graphMode) {
    case "xt":
      return 1;
    case "xy":
    case "xyt":
      return 2;
    case "xyz":
      return 3;
  }
}

function getNormalisedDirectionProbabilities(
  dimensions,
  checkValidity = false,
) {
  let valid = true;
  const directionProbabilitiesInputs = [
    document.querySelector("#p-positive-x"),
    document.querySelector("#p-negative-x"),
    document.querySelector("#p-positive-y"),
    document.querySelector("#p-negative-y"),
    document.querySelector("#p-positive-z"),
    document.querySelector("#p-negative-z"),
  ].slice(0, dimensions * 2);

  let directionProbabilities = [];
  for (const input of directionProbabilitiesInputs) {
    directionProbabilities.push(input.valueAsNumber);
    input.setCustomValidity("");
    valid = valid && input.checkValidity();
  }

  const total = directionProbabilities.reduce((sum, v) => sum + v, 0);

  directionProbabilities = directionProbabilities.map((v) => v / total);

  if (checkValidity) {
    if (total === 0 && dimensions !== 0) {
      valid = false;
      for (const input of directionProbabilitiesInputs) {
        input.setCustomValidity("Step direction ratios cannot all be 0.");
      }
    }
    return [directionProbabilities, valid];
  } else {
    return directionProbabilities;
  }
}

function readParameters() {
  const processType = document.getElementById(`process-type`).value;
  const seed = document.querySelector("#seed").valueAsNumber;
  const seedOn = document.querySelector("#seed-on").checked;

  const graphMode = document.querySelector("#graph-mode").value;
  const dimensions = getSpatialDimensions(graphMode);

  const diffusion = [
    document.querySelector("#diffusion-x").valueAsNumber,
    document.querySelector("#diffusion-y").valueAsNumber,
    document.querySelector("#diffusion-z").valueAsNumber,
  ].slice(0, dimensions);

  const drift = [
    document.querySelector("#drift-x").valueAsNumber,
    document.querySelector("#drift-y").valueAsNumber,
    document.querySelector("#drift-z").valueAsNumber,
  ].slice(0, dimensions);

  const directionProbabilities =
    getNormalisedDirectionProbabilities(dimensions);

  const branchingOn = document.querySelector("#branching-on").checked;

  let startingPosition;
  let endingPosition = null;
  if (processType === "rw") {
    startingPosition = [
      document.querySelector("#integer-starting-position-x").valueAsNumber,
      document.querySelector("#integer-starting-position-y").valueAsNumber,
      document.querySelector("#integer-starting-position-z").valueAsNumber,
    ].slice(0, dimensions);
  } else if (processType === "bm") {
    startingPosition = [
      document.querySelector("#float-starting-position-x").valueAsNumber,
      document.querySelector("#float-starting-position-y").valueAsNumber,
      document.querySelector("#float-starting-position-z").valueAsNumber,
    ].slice(0, dimensions);

    const endingPositionOn = document.querySelector(
      "#ending-position-on",
    ).checked;
    if (endingPositionOn && !branchingOn) {
      endingPosition = [
        document.querySelector("#ending-position-x").valueAsNumber,
        document.querySelector("#ending-position-y").valueAsNumber,
        document.querySelector("#ending-position-z").valueAsNumber,
      ].slice(0, dimensions);
    }
  }

  return {
    processType,
    endTime: document.querySelector("#duration").valueAsNumber,
    dt: processType === `rw` ? 1 : document.querySelector("#dt").valueAsNumber,
    diffusion,
    drift,
    directionProbabilities,
    branchingRate:
      Number(branchingOn) *
      document.querySelector("#branching-rate").valueAsNumber,
    initialParticles:
      document.querySelector("#initial-particles").valueAsNumber,
    maxParticles:
      Number(document.querySelector("#branching-on").checked) *
      Number(document.querySelector("#max-particles-on").checked) *
      document.querySelector("#max-particles").valueAsNumber,
    seed: seedOn === true ? seed : randomSeed(),
    startingPosition,
    endingPosition,
  };
}

function runWorker(parameters) {
  const currentRequest = ++requestId;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
    };

    const onMessage = ({ data }) => {
      if (data.requestId !== currentRequest) return;
      cleanup();
      data.error ? reject(new Error(data.error)) : resolve(data.result);
    };

    const onError = (e) => {
      cleanup();
      reject(new Error(e.message || "Worker error"));
    };

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage({ requestId: currentRequest, parameters });
  });
}

function setTraceTime(state, graphMode, currentTime) {
  const EPSILON = 1e-12;
  const path = state.particle.path;

  while (
    state.nextIndex < path.length &&
    path[state.nextIndex][0] <= currentTime + EPSILON
  ) {
    const [time, position] = path[state.nextIndex];

    // Add point.
    switch (graphMode) {
      case "xt":
        state.x.push(time);
        state.y.push(position[0]);
        break;

      case "xy":
        state.x.push(position[0]);
        state.y.push(position[1]);
        break;

      case "xyt":
        state.x.push(position[0]);
        state.y.push(position[1]);
        state.z.push(time);
        break;

      case "xyz":
        state.x.push(position[0]);
        state.y.push(position[1]);
        state.z.push(position[2]);
        break;
    }

    state.nextIndex += 1;
  }

  while (
    state.nextIndex > 0 &&
    path[state.nextIndex - 1][0] > currentTime + EPSILON
  ) {
    state.nextIndex -= 1;

    // Remove point.
    state.x.pop();
    state.y.pop();
    if (graphMode === "xyt" || graphMode === "xyz") {
      state.z.pop();
    }
  }
}

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function lockCanvas(is2D, plot) {
  if (is2D) {
    await Plotly.relayout(plot, {
      "xaxis.autorange": false,
      "yaxis.autorange": false,
    });
  } else {
    const scene = plot._fullLayout.scene;
    await Plotly.relayout(plot, {
      "scene.xaxis.range": [...scene.xaxis.range],
      "scene.yaxis.range": [...scene.yaxis.range],
      "scene.zaxis.range": [...scene.zaxis.range],
      "scene.xaxis.autorange": false,
      "scene.yaxis.autorange": false,
      "scene.zaxis.autorange": false,
      "scene.aspectratio": {
        x: scene.aspectratio.x,
        y: scene.aspectratio.y,
        z: scene.aspectratio.z,
      },
      "scene.aspectmode": "manual",
    });
  }
}

function reflectPath(path, reflectionAxes, startingPosition) {
  return path.map(([time, position]) => [
    time,
    position.map((value, i) =>
      reflectionAxes[i] ? 2 * startingPosition[i] - value : value,
    ),
  ]);
}

function rescalePath(path, rescaleFactor, startingPosition) {
  return path.map(([time, position]) => [
    time / rescaleFactor,
    position.map(
      (value, i) =>
        startingPosition[i] +
        (value - startingPosition[i]) / Math.sqrt(rescaleFactor),
    ),
  ]);
}

function reversePath(path) {
  const [startTime, startPosition] = path[0];
  const [endTime, endPosition] = path.at(-1);

  return path
    .map(([time, position]) => [
      startTime + endTime - time,
      position.map((value, i) => startPosition[i] + endPosition[i] - value),
    ])
    .reverse();
}

function getTraceStates(result) {
  const processType = document.getElementById("process-type").value;
  const branchingOn = document.querySelector("#branching-on").checked;

  const reflectAxes = [
    document.querySelector("#reflect-x").checked,
    document.querySelector("#reflect-y").checked,
    document.querySelector("#reflect-z").checked,
  ].slice(0, result.dimensions);
  const reflectOn = reflectAxes.includes(true) && processType === "bm";
  const rescaleOn =
    document.querySelector("#rescale-on").checked && processType === "bm";
  const rescaleFactor = document.querySelector("#rescale-factor").valueAsNumber;

  const reverseOn =
    document.querySelector("#reverse-on").checked && !branchingOn;

  const traceStates = result.particles.map((particle) => ({
    particle,
    name: reflectOn || rescaleOn || reverseOn ? "Original" : null,
    dash: "solid",
    nextIndex: 0,
    x: [],
    y: [],
    z: [],
  }));

  const dashOptions = ["dash", "dot", "dashdot"];

  if (reflectOn) {
    traceStates.push(
      ...result.particles.map((particle) => ({
        particle: {
          ...particle,
          path: reflectPath(
            particle.path,
            reflectAxes,
            result.parameters.startingPosition,
          ),
        },
        name: "Reflection",
        dash: dashOptions.splice(0, 0),
        nextIndex: 0,
        x: [],
        y: [],
        z: [],
      })),
    );
  }

  if (rescaleOn) {
    traceStates.push(
      ...result.particles.map((particle) => ({
        particle: {
          ...particle,
          path: rescalePath(
            particle.path,
            rescaleFactor,
            result.parameters.startingPosition,
          ),
        },
        name: `Rescale c=${formatNumber(rescaleFactor)}`,
        dash: dashOptions.splice(0, 0),
        nextIndex: 0,
        x: [],
        y: [],
        z: [],
      })),
    );
  }

  if (reverseOn) {
    traceStates.push(
      ...result.particles.map((particle) => ({
        particle: {
          ...particle,
          path: reversePath(particle.path),
        },
        name: "Time reversal",
        dash: dashOptions.splice(0, 0),
        nextIndex: 0,
        x: [],
        y: [],
        z: [],
      })),
    );
  }

  return traceStates;
}

async function drawAnimated(result, graphMode, animationDuration) {
  const frameCount = Math.min(
    (20 * animationDuration) / 1000 + 1,
    result.summary.steps + 1,
  );
  const startTime = result.summary.startTime;
  const endTime = result.summary.endTime;
  const times = Array.from(
    { length: frameCount },
    (_, index) =>
      startTime + ((endTime - startTime) * index) / (frameCount - 1),
  );

  const traceStates = getTraceStates(result);
  const traceIds = traceStates.map((_, index) => index);

  // Set traces to last frame.
  for (const state of traceStates) {
    setTraceTime(state, graphMode, endTime);
  }

  const is2D = graphMode === "xt" || graphMode === "xy";

  const appliedLegends = new Set();
  const traces = traceStates.map((state) => {
    const showlegend = !appliedLegends.has(state.name);
    appliedLegends.add(state.name);

    return {
      type: is2D ? "scattergl" : "scatter3d",
      mode: "lines",
      x: state.x,
      y: state.y,
      ...(is2D ? {} : { z: state.z }),
      line: {
        width: is2D ? 1 : 2,
        dash: state.dash,
      },
      name: state.name,
      legendgroup: state.name,
      showlegend,
    };
  });

  const frameDuration = animationDuration / Math.max(times.length - 1, 1);

  const updatemenus = [
    {
      type: "buttons",
      direction: "left",
      showactive: false,
      yref: "container",
      xanchor: "right",
      yanchor: "top",
      x: 0.1,
      y: -0.04,
      pad: {
        l: 0,
        r: 0,
        t: 0,
        b: 0,
      },
      font: {
        size: 16,
      },
      buttons: [
        {
          label: "&#9654;",
          method: "skip",
        },
      ],
    },
  ];

  const sliders = [
    {
      active: times.length - 1,
      yref: "container",
      len: 0.88,
      xanchor: "left",
      x: 0.1,
      y: 0,
      pad: {
        l: 0,
        r: 0,
        t: 0,
        b: 5,
      },
      currentvalue: {
        prefix: "Time: ",
      },
      steps: times.map((time) => ({
        label: time.toFixed(2),
        method: "skip",
      })),
    },
  ];

  const zerolinecolor2D = "#aaa";
  let layout;

  if (is2D) {
    layout = {
      xaxis: {
        title: { text: graphMode === "xt" ? "Time" : "X" },
        domain: [0.07, 0.97],
        zerolinecolor: zerolinecolor2D,
      },

      yaxis: {
        title: { text: graphMode === "xt" ? "X" : "Y" },
        domain: [0.07, 0.96],
        zerolinecolor: zerolinecolor2D,
      },

      legend: {
        orientation: "h",
        yanchor: "bottom",
        y: 1,
        xanchor: "left",
        x: 0,
      },

      showlegend: appliedLegends.size > 1 ? null : false,

      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 0,
      },
      updatemenus,
      sliders,
    };
  } else {
    layout = {
      scene: {
        xaxis: {
          title: { text: "X" },
        },

        yaxis: {
          title: { text: "Y" },
        },

        zaxis: {
          title: { text: graphMode === "xyt" ? "Time" : "Z" },
        },

        aspectmode: "data",
      },

      legend: {
        orientation: "h",
        yanchor: "bottom",
        y: 1,
        xanchor: "left",
        x: 0,
      },

      showlegend: appliedLegends.size > 1 ? null : false,

      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 0,
      },
      updatemenus,
      sliders,
    };
  }

  Plotly.purge("trajectory-plot");

  const plot = await Plotly.newPlot("trajectory-plot", traces, layout, {
    responsive: true,
    displaylogo: false,
  });

  await lockCanvas(is2D, plot);

  let isPlaying = false;
  let currentFrame = times.length - 1;

  async function renderFrame(index, updateSlider = true) {
    const currentTime = times[index];

    for (const state of traceStates) {
      setTraceTime(state, graphMode, currentTime);
    }

    const update = {
      x: traceStates.map((state) => state.x),
      y: traceStates.map((state) => state.y),
    };

    if (!is2D) update.z = traceStates.map((state) => state.z);

    await Plotly.restyle(plot, update, traceIds);

    currentFrame = index;

    if (updateSlider && plot.layout.sliders[0].active !== index) {
      await Plotly.relayout(plot, {
        "sliders[0].active": index,
      });
    }
  }

  plot.on("plotly_relayout", async (event) => {
    if (is2D) {
      if (!event["xaxis.autorange"] && !event["yaxis.autorange"]) return;

      await lockCanvas(is2D, plot);
    } else if (
      Object.keys(event).some((key) => key.startsWith("scene.camera."))
    ) {
      await lockCanvas(is2D, plot);
    }
  });

  plot.on("plotly_sliderchange", async (event) => {
    if (isPlaying) {
      isPlaying = false;

      await Plotly.relayout(plot, {
        "updatemenus[0].buttons[0].label": "&#9654;",
      });
    }

    await renderFrame(event.slider.active, false);
  });

  plot.on("plotly_buttonclicked", async () => {
    if (isPlaying) {
      // Pause
      isPlaying = false;

      await Plotly.relayout(plot, {
        "updatemenus[0].buttons[0].label": "&#9654;",
      });

      return;
    }

    // Play
    if (currentFrame === times.length - 1) {
      // At the end then restart from the beginning.
      await renderFrame(0);
    }

    isPlaying = true;

    await Plotly.relayout(plot, {
      "updatemenus[0].buttons[0].label": "&#9208;",
    });

    while (isPlaying && currentFrame < times.length - 1) {
      // Paused partly through then continue from current frame.
      const start = performance.now();

      await renderFrame(currentFrame + 1);

      // Account for rendering time.
      const elapsed = performance.now() - start;

      await delay(Math.max(0, frameDuration - elapsed));
    }

    isPlaying = false;

    await Plotly.relayout(plot, {
      "updatemenus[0].buttons[0].label": "&#9654;",
    });
  });
}

async function draw(result) {
  const graphMode = document.querySelector("#graph-mode").value;
  const animationDuration =
    document.querySelector("#animation").valueAsNumber * 1000;
  await drawAnimated(result, graphMode, animationDuration);
}

function formatNumber(item, sigFigs = 4) {
  return item === null || item === undefined
    ? "—"
    : []
        .concat(item)
        .map((value) => Number(value.toPrecision(sigFigs)).toString())
        .join(", ");
}

function showSummary(result) {
  summary.finalPopulation.textContent = formatNumber(
    result.summary.finalPopulation,
  );
  summary.particlesCreated.textContent = formatNumber(
    result.summary.totalParticlesCreated,
  );
  summary.maximumGeneration.textContent = formatNumber(
    result.summary.maximumGeneration,
  );
  summary.meanFinalPosition.textContent = formatNumber(
    result.summary.meanFinalPosition,
  );
  summary.minPosition.textContent = formatNumber(result.summary.minPosition);
  summary.maxPosition.textContent = formatNumber(result.summary.maxPosition);
  summary.minFinalPosition.textContent = formatNumber(
    result.summary.minFinalPosition,
  );
  summary.maxFinalPosition.textContent = formatNumber(
    result.summary.maxFinalPosition,
  );

  summary.maxFinalDistance.textContent = formatNumber(
    result.summary.maxFinalDistance,
  );
  summary.maxDistance.textContent = formatNumber(result.summary.maxDistance);
  summary.maxDistanceTime.textContent = formatNumber(
    result.summary.maxDistanceTime,
  );
  summary.firstBranchTime.textContent = formatNumber(
    result.summary.firstBranchTime,
  );
  summary.originVisits.textContent = formatNumber(result.summary.originVisits);
  summary.proportionTimePositive.textContent = formatNumber(
    result.summary.proportionTimePositive,
  );
  summary.summaryNote.textContent = result.summary.populationCapReached
    ? "The population cap was reached."
    : "The population cap was not reached.";
}

async function simulate(event) {
  event.preventDefault();
  button.disabled = true;

  const maxParticlesInput = document.querySelector("#max-particles");

  const initialParticles =
    document.querySelector("#initial-particles").valueAsNumber;
  const maxParticles = maxParticlesInput.valueAsNumber;
  const maxParticlesOn =
    document.querySelector("#max-particles-on").checked &&
    document.querySelector("#branching-on").checked;

  maxParticlesInput.setCustomValidity("");

  if (maxParticles < initialParticles * maxParticlesOn) {
    maxParticlesInput.setCustomValidity(
      "Population cap cannot be less than initial particles.",
    );
    maxParticlesInput.reportValidity();
    button.disabled = false;
    return;
  }

  status.textContent = "Running...";
  summary.summaryNote.textContent = "";

  try {
    latestResult = await runWorker(readParameters());
    document.querySelector("#seed").value = latestResult.parameters.seed;
    await draw(latestResult);
    showSummary(latestResult);
    status.textContent = "Complete";
  } catch (error) {
    status.textContent = "Error";
    summary.summaryNote.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

form.addEventListener("submit", simulate);

document.querySelector("#max-particles").addEventListener("input", (event) => {
  event.target.setCustomValidity("");
});

document.querySelector("#initial-particles").addEventListener("input", () => {
  document.querySelector("#max-particles").setCustomValidity("");
});

document.querySelector("#max-particles-on").addEventListener("change", () => {
  document.querySelector("#max-particles").setCustomValidity("");
});

// Jump parameter.
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll('input[type="number"][data-jump]');

  inputs.forEach((input) => {
    const jump = parseFloat(input.dataset.jump);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);

    let previousValue = parseFloat(input.value);
    let isManualChange = false;

    function decimalPlaces(value) {
      const string = String(value);

      if (string.includes("e-")) {
        return parseInt(string.split("e-")[1], 10);
      }

      return (string.split(".")[1] || "").length;
    }

    function jumpValue(value, direction) {
      const precision = Math.max(
        decimalPlaces(value),
        decimalPlaces(jump),
        Number.isNaN(min) ? 0 : decimalPlaces(min),
        Number.isNaN(max) ? 0 : decimalPlaces(max),
      );

      const scale = 10 ** precision;

      const scaledValue = Math.round(value * scale);
      const scaledJump = Math.round(jump * scale);

      let result;

      if (direction > 0) {
        result =
          scaledValue % scaledJump === 0
            ? scaledValue + scaledJump
            : Math.ceil(scaledValue / scaledJump) * scaledJump;
      } else {
        result =
          scaledValue % scaledJump === 0
            ? scaledValue - scaledJump
            : Math.floor(scaledValue / scaledJump) * scaledJump;
      }

      if (!Number.isNaN(min)) {
        result = Math.max(result, Math.round(min * scale));
      }

      if (!Number.isNaN(max)) {
        result = Math.min(result, Math.round(max * scale));
      }

      return result / scale;
    }

    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();

        const currentValue = parseFloat(input.value);

        input.value = jumpValue(currentValue, event.key === "ArrowUp" ? 1 : -1);

        previousValue = parseFloat(input.value);
        isManualChange = false;
      } else {
        isManualChange = true;
      }
    });

    input.addEventListener("input", () => {
      const currentValue = parseFloat(input.value);
      const step = parseFloat(input.step);

      const difference = Math.abs(currentValue - previousValue);

      const isStepChange = Math.abs(difference - step) < step * 0.001;

      if (!isManualChange && isStepChange) {
        input.value = jumpValue(
          previousValue,
          currentValue > previousValue ? 1 : -1,
        );
      }

      previousValue = parseFloat(input.value);
      isManualChange = false;
    });
  });
});

// Stop scroll from changing inputs.
document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();

      window.scrollBy({
        top: event.deltaY,
        left: event.deltaX,
      });
    },
    { passive: false },
  );
});

const inputFields = document.querySelectorAll(`input`);

function updateEnabled() {
  const branchingOn = document.getElementById("branching-on").checked;
  const maxParticlesOn = document.getElementById("max-particles-on").checked;
  const seedOn = document.getElementById("seed-on").checked;
  const endingPositionOn =
    document.getElementById("ending-position-on").checked;

  for (const field of inputFields) {
    let disabled = false;

    for (
      let element = field;
      element && element !== form;
      element = element.parentElement
    ) {
      if (getComputedStyle(element).display === "none") {
        disabled = true;
      }
    }

    switch (field.id) {
      case `branching-rate`:
        disabled ||= !branchingOn;
        break;
      case `max-particles-on`:
        disabled ||= !branchingOn;
        break;
      case `max-particles`:
        disabled ||= !branchingOn || !maxParticlesOn;
        break;
      case `seed`:
        disabled ||= !seedOn;
        break;
      case `ending-position-on`:
        disabled ||= branchingOn;
        break;
      case `ending-position-x`:
      case `ending-position-y`:
      case `ending-position-z`:
        disabled ||= branchingOn || !endingPositionOn;
        break;
      case `reverse-on`:
        disabled ||= branchingOn;
        break;
    }

    field.disabled = disabled;
  }
}

const processDimensionsFields = document.querySelectorAll(
  "[data-process][data-dimensions]",
);
const processFields = document.querySelectorAll(
  "[data-process]:not([data-dimensions])",
);
const dimensionsFields = document.querySelectorAll(
  "[data-dimensions]:not([data-process])",
);

function updateInputs(type = "all") {
  const processType = document.getElementById(`process-type`).value;
  const dimensions = getSpatialDimensions(
    document.getElementById(`graph-mode`).value,
  );

  function update(fields, datasets) {
    for (const field of fields) {
      let allowedParameters;
      switch (datasets) {
        case "both":
          allowedParameters = [
            field.dataset.process.split(` `),
            field.dataset.dimensions.split(` `).map(Number),
          ];
          break;
        case "process":
          allowedParameters = [field.dataset.process.split(` `), [dimensions]];
          break;
        case "dimensions":
          allowedParameters = [
            [processType],
            field.dataset.dimensions.split(` `).map(Number),
          ];
          break;
      }

      if (
        allowedParameters[0].includes(processType) &&
        allowedParameters[1].includes(dimensions)
      ) {
        field.style.display = "contents";
      } else {
        field.style.display = "none";
      }
    }

    updateEnabled();
    return;
  }

  switch (type) {
    case "all":
      update(processFields, "process");
      update(dimensionsFields, "dimensions");
      update(processDimensionsFields, "both");
      updateDirectionProbabilitiesPreview();
      return;
    case "process":
      update(processFields, "process");
      update(processDimensionsFields, "both");
      return;
    case "dimensions":
      update(dimensionsFields, "dimensions");
      update(processDimensionsFields, "both");
      updateDirectionProbabilitiesPreview();
      return;
  }
}

function updateDirectionProbabilitiesPreview() {
  let dimensions = getSpatialDimensions(
    document.getElementById(`graph-mode`).value,
  );
  if (document.getElementById(`process-type`).value !== "rw") {
    dimensions = 0;
  }
  const result = getNormalisedDirectionProbabilities(dimensions, true);

  let previewHTML = "";

  if (result[1]) {
    const directionProbabilities = result[0].map((v) => formatNumber(v));

    let dimensionsStringList = [];
    if (dimensions === 1) {
      dimensionsStringList = ["&nbsp;p="];
    } else {
      dimensionsStringList = ["x:&nbsp;p=", "y:&nbsp;p=", "z:&nbsp;p="];
    }

    for (let i = 0; i < dimensions; i++) {
      previewHTML +=
        "      <wbr><span&ensp;style='display:&ensp;contents;&ensp;" +
        "white-space:&ensp;nowrap'>+" +
        dimensionsStringList[i] +
        directionProbabilities[2 * i] +
        "&nbsp;&nbsp;&nbsp;-" +
        dimensionsStringList[i] +
        directionProbabilities[2 * i + 1] +
        "</span>";
    }
    previewHTML = previewHTML
      .trim()
      .replaceAll(" ", "&nbsp;")
      .replaceAll("&ensp;", " ");
  } else {
    previewHTML =
      "<span style='color: color-mix(in srgb, var(--main-regular-color) 70%," +
      "transparent);'>INVALID INPUTS</span>";
  }

  directionProbabilitiesPreview.innerHTML = previewHTML;
}

document
  .getElementById(`process-type`)
  .addEventListener(`change`, () => updateInputs("process"));

document
  .getElementById(`graph-mode`)
  .addEventListener(`change`, () => updateInputs("dimensions"));

document.querySelectorAll(`input[type="checkbox"]`).forEach((checkbox) => {
  checkbox.addEventListener(`change`, updateEnabled);
});

document
  .getElementById(`direction-frequency-ratio`)
  .addEventListener(`input`, () => updateDirectionProbabilitiesPreview());

document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.required = true;
});

updateInputs("all");
updateDirectionProbabilitiesPreview();
