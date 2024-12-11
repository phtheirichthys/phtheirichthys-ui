<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from 'vue'
import { useNavigateStore } from '../../stores/navigate'
import { usePolarsStore } from '../../stores/polars'
import * as d3 from 'd3'
import { PolarSail, RouteWaypoint } from '@phtheirichthys/phtheirichthys';
import * as utils from '../../lib/utils'

const polarsStore = usePolarsStore()
const navigateStore = useNavigateStore()

const props = defineProps<{
  polarId: string,
  parentWidth: number,
  parentHeight: number,
}>()
const polar = ref(polarsStore.get(props.polarId) || null)
const width = ref(props.parentWidth - 10)
const height = ref(props.parentHeight - 80)

const size = computed(() => {
  return Math.min(height.value / 2 - 50, width.value - 80)
})

const twa = ref(Math.abs(utils.twa(navigateStore.settings.heading, navigateStore.status.wind.direction)))
const windSpeed = ref(navigateStore.status.wind.speed)

function drawDegrees() {
  const degrees = d3.select("#polar").select("#degrees")

  degrees.selectAll("*").remove()

  if (size.value < 100) return

  for(var i = 0 ; i < 181 ; i += 10) {
    degrees.append("line")
      .attr("transform", "translate(25," + height.value / 2 + ") rotate(" + i + ")")
      .style("stroke", "grey")
      .style("stroke-width", 0.33)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", -size.value - 5)
    degrees.append("text")
      .attr("transform", "translate(" + Math.round(25 + (size.value + 12) * Math.sin(Math.PI * i / 180) - 4) + "," + Math.round(height.value / 2 - (size.value + 12) * Math.cos(Math.PI * i / 180) + 4) + ")")
      .text(i + "°")
      .attr("font-size", "12px")
      .attr("fill", "grey")
  }
}

const max = ref(0)
const boatSpeed = ref(new Array<number>())
const upwind = ref(0)
const downwind = ref(0)

const paths = ref(new Map<PolarSail, {sail: PolarSail, points: Array<[number, number]>, tolerences: {up: [number, number] | undefined, down: [number, number] | undefined}}>())

function computeBoatSpeed() {
  if (!polar.value || windSpeed.value < 0) {
    boatSpeed.value = []
    return
  }

  paths.value = new Map<PolarSail, {sail: PolarSail, points: Array<[number, number]>, tolerences: {up: undefined, down: undefined}}>()
  max.value = 0

  upwind.value = 0
  let upwindVmg = 0

  downwind.value = 180
  let downwindVmg = 0

  let previousSail: PolarSail | null = null

  let points = new Array<[number, number]>()

  for(let a = 0 ; a <= 180 ; a+=0.1) {
    const tws = interpolationIndex(polar.value.tws, windSpeed.value)
    const twa = interpolationIndex(polar.value.twa, a)

    let f = foil(a)

    let maxBs = 0
    let maxS = null

    let bss = polar.value.sail.map((sail) => {
      if((sail.name == "LightJib" || sail.name == "LightGnk" || sail.name == "LIGHT_JIB" || sail.name == "LIGHT_GNK") && !navigateStore.options.lt) {
        return
      }
      if((sail.name == "Staysail" || sail.name == "HeavyGnk" || sail.name == "STAYSAIL" || sail.name == "HEAVY_GNK") && !navigateStore.options.gt) {
        return
      }
      if((sail.name == "Code0" || sail.name == "CODE_0") && !navigateStore.options.code0) {
        return
      }

      let bs = (sail.speed[twa.i0][tws.i0]*tws.p0 + sail.speed[twa.i0][tws.i1]*(1-tws.p0))*twa.p0
        + (sail.speed[twa.i1][tws.i0]*tws.p0 + sail.speed[twa.i1][tws.i1]*(1-tws.p0))*(1-twa.p0)

      if(navigateStore.options.foil) {
        bs *= f
      }
      if(navigateStore.options.hull) {
        bs *= polar.value!.hull.speedRatio
      }

      if(bs > maxBs) {
        maxBs = bs
        maxS = sail
      }
      if(bs > max.value) {
        max.value = bs
      }

      return {sail: sail, bs: bs}
    })

    bss.forEach((s) => {
      if (s && s.bs > 0 && s.bs * polar.value!.badSailTolerance >= maxBs) {
        if (!paths.value.has(s.sail)) {
          paths.value.set(s.sail, {sail: s.sail, points: [], tolerences: {up: undefined, down: undefined}})
        }

        if (!paths.value.get(s.sail)!.tolerences.up || paths.value.get(s.sail)!.tolerences.up![0] > a) {
          paths.value.get(s.sail)!.tolerences.up = [a, maxBs]
        }
        if (!paths.value.get(s.sail)!.tolerences.down || paths.value.get(s.sail)!.tolerences.down![0] < a) {
          paths.value.get(s.sail)!.tolerences.down = [a, maxBs]
        }
      }
    })

    const vmg = maxBs * Math.cos(a * Math.PI/180)

    if(vmg > upwindVmg) {
      upwind.value = a
      upwindVmg = vmg
    }
    if(vmg <= downwindVmg) {
      downwind.value = a
      downwindVmg = vmg
    }

    points.push([Math.PI * a / 180, maxBs])

    if(!previousSail) {
      previousSail = maxS
    } else if(maxS != previousSail || a == 180) {
      if (!paths.value.has(previousSail)) {
        paths.value.set(previousSail, {sail: previousSail, points: [], tolerences: {up: undefined, down: undefined}})
      }
      paths.value.get(previousSail)!.points = points
      points = new Array<[number, number]>()
      previousSail = maxS
    }

    if(Math.round(a*10)%10 == 0) {
      boatSpeed.value[Math.round(a)] = maxBs
    }
  }
  if (!paths.value.has(previousSail!)) {
    paths.value.set(previousSail!, {sail: previousSail!, points: [], tolerences: {up: undefined, down: undefined}})
  }
  paths.value.get(previousSail!)!.points = points
}

function drawSpeeds(): number {
  let m: number
  let step: number
  if(max.value < 6) {
    m = Math.round(max.value) + 1
    step = 1
  } else if(max.value < 12) {
    m = Math.round(max.value / 2) * 2 + 2
    step = 2
  } else if(max.value < 18) {
    m = Math.round(max.value / 3) * 3 + 3
    step = 3
  } else if(max.value < 20) {
    m = Math.round(max.value / 4) * 4 + 4
    step = 4
  } else {
    m = Math.round(max.value / 5) * 5 + 5
    step = 5
  }

  let speed = d3.select("#polar").select("#speed")

  speed.selectAll("*").remove()

  if (size.value < 100) return m

  for(var s = step ; s <= m ; s += step) {

    speed.append("path")
      .attr("transform", "translate(25," + height.value / 2 + ")")
      .attr("d", (d: any) => d3.arc()
        .innerRadius( s * size.value / m )
        .outerRadius( s * size.value / m )
        .startAngle( 0 )     // It's in radian, so Pi = 3.14 = bottom.
        .endAngle( Math.PI )       // 2*Pi = 6.28 = top
        (d)
      )
      .attr('stroke', 'grey')
      .style("stroke-width", 0.5)

    speed.append("text")
      .attr("transform", "translate(0," + Math.round(height.value / 2 - (s * size.value / m) + 2) + ")")
      .text(s + "kt")
      .attr("font-size", "12px")
      .attr("fill", "grey")

    speed.append("text")
      .attr("transform", "translate(0," + Math.round(height.value / 2 + (s * size.value / m) + 3) + ")")
      .text(s + "kt")
      .attr("font-size", "12px")
      .attr("fill", "grey")

  }

  return m
}

function drawSailPaths(max: number) {
  const lineRadial = d3.lineRadial()

  const colors: any = {
    "Jib"      : "#cd0342",
    "Spi"      : "#00ff00",
    "Staysail"    : "#0000ff",
    "LightJib"    : "#f67876",
    "Code0"    : "#00a000",
    "HeavyGnk"    : "#b00000",
    "LightGnk"    : "#d77900",
    "JIB"      : "#cd0342",
    "SPI"      : "#00ff00",
    "STAYSAIL"    : "#0000ff",
    "LIGHT_JIB"    : "#f67876",
    "CODE_0"    : "#00a000",
    "HEAVY_GNK"    : "#b00000",
    "LIGHT_GNK"    : "#d77900"
  }

  let d3path = d3.select("#polar").select("#path")
  d3path.selectAll("*").remove()

  if (size.value < 100) return

  paths.value.forEach((path) => {
    if (path.points.length > 0) {
      let points: Array<[number, number]> = Array.from(path.points).map(([a, s]) => ([a, s * size.value / max]))
      d3path.append("path")
        .attr("transform", "translate(25," + height.value / 2 + ")")
        .attr('d', lineRadial(points))
        .style("stroke", colors[path.sail.name])
        .style("stroke-width", 2)
        .style("fill", "none")

      if (path.tolerences.up) {
        d3path.append("path")
          .attr("transform", "translate(25," + height.value / 2 + ")")
          .attr("d", (d: any) => d3.arc()
            .innerRadius( 0 )
            .outerRadius( size.value )
            .startAngle( points[0][0])
            .endAngle( path.tolerences.up![0] * Math.PI / 180 )(d)
            )
          .attr('stroke', colors[path.sail.name])
          .style("stroke-width", 0.5)
          .attr('fill', colors[path.sail.name])
          .style("opacity", 0.2)
        // d3path.append("text")
        //   .attr("transform", "translate(" + Math.round(25 + (size.value + 25) * Math.sin(Math.PI * upwind.value / 180) - 4) + "," + Math.round(height.value / 2 - (size.value + 25) * Math.cos(Math.PI * upwind.value / 180) + 4) + ")")
        //   .text(upwind.value.toFixed(1) + "°")
        //   .attr("font-size", "12px")
        //   .attr("fill", "red")
      }

      if (path.tolerences.down) {
        d3path.append("path")
          .attr("transform", "translate(25," + height.value / 2 + ")")
          .attr("d", (d: any) => d3.arc()
            .innerRadius( 0 )
            .outerRadius( size.value )
            .startAngle( path.tolerences.down![0] * Math.PI / 180 )
            .endAngle( points[points.length - 1][0] )(d)
            )
          .attr('stroke', colors[path.sail.name])
          .style("stroke-width", 0.5)
          .attr('fill', colors[path.sail.name])
          .style("opacity", 0.2)
        // d3path.append("text")
        //   .attr("transform", "translate(" + Math.round(25 + (size.value + 25) * Math.sin(Math.PI * downwind.value / 180) - 4) + "," + Math.round(height.value / 2 - (size.value + 25) * Math.cos(Math.PI * downwind.value / 180) + 4) + ")")
        //   .text(downwind.value.toFixed(1) + "°")
        //   .attr("font-size", "12px")
        //   .attr("fill", "red")

      }
    }
  })
}

function drawCurrent() {
  const current = d3.select("#polar").select("#current")

  current.selectAll("*").remove()
  
  if (size.value < 100) return

  current.append("line")
    .attr("transform", "translate(25," + height.value / 2 + ") rotate(" + twa.value + ")")
    .style("stroke", "blue")
    .style("stroke-width", 2)
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", -size.value - 5)
  current.append("text")
    .attr("transform", "translate(" + Math.round(0 + (size.value + 40) * Math.sin(Math.PI * twa.value / 180) - 4) + "," + Math.round(height.value / 2 - (size.value + 40) * Math.cos(Math.PI * twa.value / 180) + 4) + ")")
    .text(twa.value + "°")
    .attr("font-size", "12px")
    .attr("fill", "blue")
  current.append("text")
    .attr("transform", "translate(" + Math.round(0 + (size.value + 40) * Math.sin(Math.PI * twa.value / 180) - 4) + "," + Math.round(height.value / 2 - (size.value+ 40) * Math.cos(Math.PI * twa.value / 180) + 4 + 15) + ")")
    .text(boatSpeed.value[twa.value].toFixed(2) + "kt")
    .attr("font-size", "12px")
    .attr("fill", "blue")
}

function drawFoil() {

  var opacity = 1
  const minRadius = size.value - 2
  const maxRadius = size.value + 2

  const d3foil = d3.select("#polar").select("#foil")

  if(!polar.value || windSpeed.value <= polar.value.foil.twsMin - polar.value.foil.twsMerge || windSpeed.value >= polar.value.foil.twsMax + polar.value.foil.twsMerge) {
    d3foil.selectAll("*").remove()
    return
  }

  const f = foil(polar.value.foil.twaMin + 1)
  opacity = opacity * (f - 1) / (polar.value.foil.speedRatio - 1)

  d3foil.selectAll("*").remove()

  if (size.value < 100) return

  const step = 0.3
  for(var i = 0 ; i < polar.value.foil.twaMerge ; i += step) {
    d3foil.append("path")
      .attr("transform", "translate(25," + height.value / 2 + ")")
      .attr("d", (d: any) => d3.arc()
        .innerRadius( minRadius )
        .outerRadius( maxRadius )
        .startAngle( (polar.value!.foil.twaMin - i) * Math.PI / 180 )
        .endAngle( (polar.value!.foil.twaMin - i - step) * Math.PI / 180 )(d)
        )
      .style("stroke-width", 0)
      .attr('fill', 'black')
      .style("opacity", opacity * ((10 - i) / 10))
    d3foil.append("path")
      .attr("transform", "translate(25," + height.value / 2 + ")")
      .attr("d", (d: any) => d3.arc()
        .innerRadius( minRadius )
        .outerRadius( maxRadius )
        .startAngle( (polar.value!.foil.twaMax + i) * Math.PI / 180 )
        .endAngle( (polar.value!.foil.twaMax + i + step) * Math.PI / 180 )(d)
        )
      .style("stroke-width", 0)
      .attr('fill', 'black')
      .style("opacity", opacity * ((10 - i) / 10))
  }
  d3foil.append("path")
    .attr("transform", "translate(25," + height.value / 2 + ")")
    .attr("d", (d: any) => d3.arc()
      .innerRadius( minRadius )
      .outerRadius( maxRadius )
      .startAngle( (polar.value!.foil.twaMin) * Math.PI / 180 )
      .endAngle( (polar.value!.foil.twaMax) * Math.PI / 180 )(d)
      )
    .style("stroke-width", 0)
    .attr('fill', 'black')
    .style("opacity", opacity)
}

function drawVmgs() {
  const vmg = d3.select("#polar").select("#vmg")
  vmg.selectAll("*").remove()

  if (size.value < 100) return

  vmg.append("path")
    .attr("transform", "translate(25," + height.value / 2 + ")")
    .attr("d", (d: any) => d3.arc()
      .innerRadius( 0 )
      .outerRadius( size.value )
      .startAngle( 0 )
      .endAngle( upwind.value * Math.PI / 180 )(d)
      )
    .attr('stroke', 'red')
    .style("stroke-width", 0.5)
    .attr('fill', 'red')
    .style("opacity", 0.2)
  vmg.append("text")
    .attr("transform", "translate(" + Math.round(25 + (size.value + 25) * Math.sin(Math.PI * upwind.value / 180) - 4) + "," + Math.round(height.value / 2 - (size.value + 25) * Math.cos(Math.PI * upwind.value / 180) + 4) + ")")
    .text(upwind.value.toFixed(1) + "°")
    .attr("font-size", "12px")
    .attr("fill", "red")

  vmg.append("path")
    .attr("transform", "translate(25," + height.value / 2 + ")")
    .attr("d", (d: any) => d3.arc()
      .innerRadius( 0 )
      .outerRadius( size.value )
      .startAngle( downwind.value * Math.PI / 180 )
      .endAngle( Math.PI )(d)
      )
    .attr('stroke', 'red')
    .style("stroke-width", 0.5)
    .attr('fill', 'red')
    .style("opacity", 0.2)
  vmg.append("text")
    .attr("transform", "translate(" + Math.round(25 + (size.value + 25) * Math.sin(Math.PI * downwind.value / 180) - 4) + "," + Math.round(height.value / 2 - (size.value + 25) * Math.cos(Math.PI * downwind.value / 180) + 4) + ")")
    .text(downwind.value.toFixed(1) + "°")
    .attr("font-size", "12px")
    .attr("fill", "red")

}

function interpolationIndex(values: number[], value: number) {
  let i = 0
  while(values[i] < value) {
    i++
    if(i == values.length) {
      if(values[i-1] < value) {
        return {i0: i - 1, i1: 0, p0: 1}
      }
      return {i0: i - 1, i1: i, p0: (values[i] - value) / (values[i] - values[i-1])}
    }
  }

  if(i > 0) {
    return {i0: i - 1, i1: i, p0: (values[i] - value) / (values[i] - values[i-1])}
  }

  return {i0: 0, i1: 0, p0: 0}
}

function foil(twa: number): number {
  if (!polar.value) {
    return 1
  }

  var ct = 0.0
  var cv = 0.0
  if (twa <= polar.value.foil.twaMin-polar.value.foil.twaMerge) {
    return 1.0
  } else if (twa < polar.value.foil.twaMin) {
    ct = (twa-(polar.value.foil.twaMin-polar.value.foil.twaMerge)) / polar.value.foil.twaMerge
  } else if (twa < polar.value.foil.twaMax) {
    ct = 1
  } else if (twa < polar.value.foil.twaMax+polar.value.foil.twaMerge) {
    ct = (polar.value.foil.twaMax+polar.value.foil.twaMerge-twa) / polar.value.foil.twaMerge
  } else {
    return 1.0
  }
  if (windSpeed.value <= polar.value.foil.twsMin-polar.value.foil.twsMerge) {
    return 1.0
  } else if (windSpeed.value < polar.value.foil.twsMin) {
    cv = (windSpeed.value - (polar.value.foil.twsMin - polar.value.foil.twsMerge)) / polar.value.foil.twsMerge
  } else if (windSpeed.value < polar.value.foil.twsMax) {
    cv = 1
  } else if (windSpeed.value < polar.value.foil.twsMax+polar.value.foil.twsMerge) {
    cv = (polar.value.foil.twsMax + polar.value.foil.twsMerge - windSpeed.value) / polar.value.foil.twsMerge
  } else {
    return 1.0
  }
  return 1.0 + (polar.value.foil.speedRatio-1)*ct*cv
}


function update() {
  drawDegrees()
  const max = drawSpeeds()
  drawSailPaths(max)
  drawCurrent()
  drawFoil()
  drawVmgs()
}

onMounted(() => {
  computeBoatSpeed()
  update()
})

watch([() => windSpeed, () => navigateStore.options], () => {
  computeBoatSpeed()
  update()
}, { deep: true })

watch([() => props.parentWidth, () => props.parentHeight], () => {
  width.value = props.parentWidth - 10
  height.value = props.parentHeight - 80
  update()
})

const dragStart: Ref<number | null> = ref(null)

function startDragTwa(e: { layerX: number; layerY: number; }) {
  const dx = e.layerX - 25
  const dy = e.layerY - height.value / 2

  const drag = (180 - Math.round(Math.acos(dy / Math.sqrt(dx * dx + dy * dy)) * 180 / Math.PI))
  twa.value = drag
  dragStart.value = drag
  drawCurrent()
}

function dragTwa(e: { layerX: number; layerY: number; }) {
  if(dragStart.value == null) return

  const dx = e.layerX - 25
  const dy = e.layerY - height.value / 2

  const drag = (180 - Math.round(Math.acos(dy / Math.sqrt(dx * dx + dy * dy)) * 180 / Math.PI))
  twa.value = twa.value - (dragStart.value - drag)
  dragStart.value = drag
  drawCurrent()
}

function stopDragTwa(e: Event) {
  e.stopPropagation()
  dragStart .value= null
}

utils.emitter.on("select", (wp: RouteWaypoint) => {
  twa.value = Math.abs(utils.twa(wp.boat_settings.heading, wp.status.wind.direction))
  windSpeed.value = wp.status.wind.speed
  drawCurrent()
})
</script>
  
<template>
  <div class="test">
      <label id="label" class="label" v-if="polar">{{ polar.label }}</label>
      <svg id="polar" :width="width" :height="height" @mousedown="startDragTwa" @mouseup="stopDragTwa" @mousemove="dragTwa">
        <g id="degrees"></g>
        <g id="speed"></g>
        <g id="path"></g>
        <g id="vmg"></g>
        <g id="foil"></g>
        <g id="current"></g>
      </svg>
      <input id="windSpeed" class="slider has-output is-fullwidth" step="0.1" min="0" max="70" type="range" v-model="windSpeed">
      <output for="windSpeed">{{windSpeed}}</output>
  </div>
</template>


<style scoped>

#label {
  margin-bottom: -25px;
  text-align: right;
  padding-right: 10px;
}

input[type="range"].slider:not([orient="vertical"]).has-output + output {
  padding-left: 3px;
  padding-right: 3px;
}
</style>
