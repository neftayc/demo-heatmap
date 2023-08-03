import heatmapStatic from '@/static/heatmap.json'

export const state = () => ({
  selectRackTypeFilter: {},
  racksText: [],
  selectVirtualSensors: [],

  selectDetailsFilter: [
    { id: 'critical_racks', name: 'Critical Racks' },
    { id: 'Gateways', name: 'Gateways' },
    { id: 'Sensors', name: 'Sensors' },
    { id: 'Sensors Floor', name: 'Sensors Floor' },
    { id: 'Sensors Grid', name: 'Sensors Grid' },
    { id: 'Sensors Ambient', name: 'Sensors Ambient' },
  ],

  selectDetailsFilterInitial: [
    { id: 'critical_racks', name: 'Critical Racks' },
    { id: 'Gateways', name: 'Gateways' },
    { id: 'Sensors', name: 'Sensors' },
    { id: 'Sensors Floor', name: 'Sensors Floor' },
    { id: 'Sensors Grid', name: 'Sensors Grid' },
    { id: 'Sensors Ambient', name: 'Sensors Ambient' },
  ],
})
export const getters = {
  selectVirtualSensors: (state) => {
    const sensors = []
    state.selectVirtualSensors.map((d) => {
      if (d.sensor_ids && d.sensor_ids[0] && Array.isArray(d.sensor_ids[0])) {
        sensors.push(...d.sensor_ids[0])
      } else if (d.sensor_ids) {
        sensors.push(...d.sensor_ids)
      }
      return d
    })
    return sensors
  },
  racksText: (state) => {
    const typesRack = JSON.parse(JSON.stringify(state.selectRackTypeFilter))
    const racks = state.racksText || []
    const newRacks = []
    newRacks.push(
      ...racks.map((e) => {
        const textos = Object.keys(e.variables)
        let data = ''
        for (let i = 0; i < textos.length; i++) {
          const clave = textos[i]
          if (clave.includes('value_vs')) {
            console.log(e.variables[clave])
            data = data + e.variables[clave]
          }
        }

        return {
          name: e.name,
          variable: typesRack.id,
          text: e.variables,
          data_text: data,
        }
      })
    )

    return newRacks
  },
  twoD: (state, getters) => {
    const { annotations } = heatmapStatic ? heatmapStatic.data[0] : {}
    const dataMain = JSON.parse(JSON.stringify(heatmapStatic.data || []))

    let isAddScale = false
    const itPower = state.selectRackTypeFilter.id === 'it_power'

    const dataVirtualSensorGrid = {
      x: [],
      y: [],
      text: [],
      line: { color: '#ed1c24', dash: 'solid', width: 2.5 },
      marker: { color: '#ed1c24', size: 5, symbol: 136 },
      mode: 'markers',
      type: 'scatter',
      name: 'Sensors Grid',
      hoverinfo: 'text',
    }
    const dataVirtualSensorAmbient = {
      x: [],
      y: [],
      text: [],
      line: { color: '#ed1c24', dash: 'solid', width: 2.5 },
      marker: { color: '#ed1c24', size: 5, symbol: 135 },
      mode: 'markers',
      type: 'scatter',
      name: 'Sensors Ambient',
      hoverinfo: 'text',
    }
    const dataVirtualSensor = {
      x: [],
      y: [],
      text: [],
      line: { color: '#ed1c24', dash: 'solid', width: 2.5 },
      marker: { color: '#ed1c24', size: 8, symbol: 2 },
      mode: 'markers',
      type: 'scatter',
      name: 'Sensors',
      hoverinfo: 'text',
    }
    // Filtro de selectores de Racks
    const joinDataText = dataMain.map((d, index) => {
      const findTexts = getters.racksText.filter((g) => g.name === d.name) || []
      if (findTexts.length) {
        findTexts.forEach((item) => {
          if (item.text) {
            const datos = JSON.parse(JSON.stringify(item.text))
            d.text = d.text + (datos.value ? datos.value : '') + item.data_text

            if (datos.color) {
              d.fillcolor = datos.color
            }
          }
        })
      }

      if (
        d.mode === 'markers' &&
        !isAddScale &&
        state.selectRackTypeFilter.scaleColorRating
      ) {
        isAddScale = true
        d.marker = {
          ...d.marker,
          cmin: itPower ? state.minMaxPower.min : 0,
          cmax: itPower ? state.minMaxPower.max : 100,
          colorbar: {
            x: 1.1,
            title: 'Rack Rating',
            titlefont: 10,
          },
          colorscale: state.selectRackTypeFilter.scaleColorRating,
        }
      }

      const sensors = d.id_sensors || []
      getters.selectVirtualSensors.forEach((vs) => {
        const findSensor = sensors.find((s) =>
          Array.isArray(s) ? s.find((si) => si === vs) : s && s === vs
        )
        if (findSensor) {
          const indexOf = sensors.indexOf(findSensor)
          if (d.name === 'Sensors Ambient') {
            dataVirtualSensorAmbient.y.push(d.y[indexOf])
            dataVirtualSensorAmbient.x.push(d.x[indexOf])
            dataVirtualSensorAmbient.text.push(d.text[indexOf])
          } else if (d.name === 'Sensors Grid') {
            dataVirtualSensorGrid.y.push(d.y[indexOf])
            dataVirtualSensorGrid.x.push(d.x[indexOf])
            dataVirtualSensorGrid.text.push(d.text[indexOf])
          } else {
            dataVirtualSensor.y.push(d.y[indexOf])
            dataVirtualSensor.x.push(d.x[indexOf])
            dataVirtualSensor.text.push(d.text[indexOf])
          }
        }
      })

      return d
    })

    // Filtros de selectores details
    const joinDetailData = []
    const detailFilters =
      JSON.parse(JSON.stringify(state.selectDetailsFilter)) || []

    const excludeFilter = []
    state.selectDetailsFilterInitial.forEach((element) => {
      if (!detailFilters.find((e) => e.id === element.id)) {
        excludeFilter.push(element.id)
      }
    })
    const filter = joinDataText.filter((d) => !excludeFilter.includes(d.name))
    joinDetailData.push(
      ...filter,
      dataVirtualSensor,
      dataVirtualSensorAmbient,
      dataVirtualSensorGrid
    )

    console.log('joinDetailData', joinDetailData)

    // eslint-disable-next-line camelcase
    const { x_max, y_max } = heatmapStatic.room || {}
    const shape = heatmapStatic.shape || []

    // eslint-disable-next-line camelcase
    const isLarge = x_max >= 8 || y_max >= 8 || false
    const criticalRacks = heatmapStatic.critical_racks || []
    const joinShape = JSON.parse(JSON.stringify(shape || []))

    let trace = {}

    if (detailFilters.find((m) => m.id === 'critical_racks')) {
      joinShape.push(...criticalRacks)

      const porcentaje = 10
      const porcentajey = 8
      const traceX = []
      const traceY = []
      const traceLetter = []
      if (isLarge) {
        criticalRacks.forEach((element, index) => {
          joinShape.push({
            fillcolor: '',
            x0: element.x0 - (element.x0 * porcentaje) / 100,
            x1: element.x1 + (element.x1 * porcentaje) / 100,
            y0: element.y0 - (element.y0 * porcentajey) / 100,
            y1: element.y1 + (element.y1 * porcentajey) / 100,
            line: {
              color: 'rgba(0, 0, 0, 1)',
              width: 1,
            },
          })
          traceX.push(element.x0 + (element.x0 * 3) / 100)
          traceY.push(element.y1 + (element.y1 * 3) / 100)
          traceLetter.push('Area ' + (index + 1))
        })
      }
      trace = {
        x: traceX,
        y: traceY,
        text: traceLetter,
        mode: 'text',
        textfont: {
          color: 'black',
          size: 8,
          family: 'Arial',
        },
        hovertemplate: '%{text}<extra></extra>',
      }
    }
    return {
      layout: {
        annotations,
        shapes: joinShape,
        xaxis: {
          showline: false,
          zeroline: false,
          ticklen: 4,
          constrain: 'doiman',
          showgrid: false,
        },
        yaxis: {
          showgrid: false,
          showline: false,
          zeroline: false,
          ticklen: 4,
          constrain: 'doiman',
          scaleanchor: 'x',
        },
        plot_bgcolor: '#e0e0e040',
        paper_bgcolor: '#e0e0e040',
      },
      data: joinDetailData || [],
      traces: isLarge ? [trace] : [],
      config: {
        responsive: true,
        displayModeBar: 'hover',
        positionModeBar: 'left',
        displaylogo: false,
        modeBarButtonsToRemove: [
          'resetScale2d',
          'toggleSpikelines',
          'hoverClosestCartesian',
          'hoverCompareCartesian',
        ],
      },
      isLarge,
    }
  },
}
