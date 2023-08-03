import Plotly from 'plotly.js'

export const scatter = ({ ref, data, layout, config }) => {
  Plotly.newPlot(ref, data, layout, config)
}

export const destroy = (ref) => {
  if (document.getElementById(ref)) {
    Plotly.purge(ref)
  }
}

export const drawing2D = ({ ref, data, layout, config, traces = [] }) => {
  const preLayout = {
    showlegend: false,
    type: 'heatmap',
    xaxis: { visible: false },
    yaxis: { visible: false },
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
    },
    hovermode: 'closest',
    autosize: true,
    scene: {
      autosize: true,
      showbackground: false,
    },
    ...layout,
  }
  const preConfig = {
    responsive: true,
    displayModeBar: false,
    ...config,
  }

  Plotly.react(ref, [...data, ...traces], preLayout, preConfig)
}
