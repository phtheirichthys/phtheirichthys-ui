<template>
  <div class="container" style="overflow-x:scroll;">

    <div v-if="display" style="display: inline-block">
      <nav v-if="route" class="level is-mobile">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Standard</p>
            <p class="title">{{ formatHours(route.sumup.sailsDuration[0] + route.sumup.sailsDuration[1]) }} hrs</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">LG</p>
            <p class="title">{{ formatHours(route.sumup.sailsDuration[3] + route.sumup.sailsDuration[6]) }} hrs</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Code 0</p>
            <p class="title">{{ formatHours(route.sumup.sailsDuration[4]) }} hrs</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">HG</p>
            <p class="title">{{ formatHours(route.sumup.sailsDuration[2] + route.sumup.sailsDuration[5]) }} hrs</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Foil</p>
            <p class="title">{{ formatHours(route.sumup.foilDuration) }} hrs</p>
          </div>
        </div>
      </nav>

      <div v-if="progs && progs.length > 0 || table == 'progs'" class="tabs is-toggle">
        <ul>
          <li v-if="lines && lines.length > 0" :class="{'is-active': table == 'route'}"><a @click="displayRoute">Route</a></li>
          <li v-if="progs && progs.length > 0" :class="{'is-active': table == 'progs'}"><a @click="displayProgs">Programmations</a></li>
        </ul>
      </div>

      <table v-show="table == 'route'" class="table is-fullwidth is-narrow is-bordered monospace" style="white-space: nowrap;">
        <thead>
          <tr>
            <th v-if="eta" class="is-clickable has-text-centered" @click="eta = !eta">ETA</th>
            <th v-else class="is-clickable has-text-centered" @click="eta = !eta">Duration</th>
            <th class="has-text-centered">Date</th>
            <th class="has-text-centered"><i class='fa fa-compass'></i></th>
            <th class="has-text-centered"><i class='fa fa-location-arrow'></i></th>
            <th></th>
            <th></th>
            <th>Boost</th>
            <th class="has-text-centered" colspan="2"><i class='fa fa-wind'></i></th>
            <th class="has-text-centered"><i class='fa fa-ship'></i></th>
            <th class="has-text-centered"><i class='fa fa-clock'></i></th>
            <th class="has-text-centered">Latitude</th>
            <th class="has-text-centered">Longitude</th>
          </tr>
        </thead>
        <tr
            v-for="(l) in lines"
            :key="l.timeshift"
            v-bind:class="{'has-background-primary-light': l.current, 'has-background-grey-lighter': l.outdated && !l.current}"
            @mouseover="highlight(l.wl)"
            @mouseleave="unhighlight(l.wl)">
          <td v-if="eta" class="has-text-right">{{ l.eta }}</td>
          <td v-else class="has-text-right">{{ l.duration }}</td>
          <td class="has-text-right">{{ l.date }}</td>
          <td class="has-text-right">{{ parseFloat(l.bearing).toFixed(1) }}°</td>
          <td class="has-text-right" :class="{'has-text-danger': l.twa < 0, 'has-text-success': l.twa > 0}">{{ parseFloat(l.twa).toFixed(1) }}°</td>
          <td :class="sailClass(l.sail)">{{ l.sail }}</td>
          <td><span v-if="l.foil > 0" class='foil' v-bind:style="{opacity: l.foil + '%'}"><i class='fa fa-fighter-jet'></i></span></td>
          <td><span v-if="l.boost > 0">{{ l.boost }}%</span></td>
          <td class="has-text-right">{{ parseFloat(l.wind).toFixed(1) }}°</td>
          <td class="has-text-right">{{ parseFloat(l.windSpeed).toFixed(1) }} kt</td>
          <td class="has-text-right">{{ parseFloat(l.boatSpeed).toFixed(1) }} kt</td>
          <td>{{ l.penalty }}</td>
          <td>{{ l.lat }}</td>
          <td>{{ l.lon }}</td>
        </tr>
      </table>

      <table v-show="table == 'progs'" class="table is-fullwidth is-narrow is-bordered monospace" style="white-space: nowrap;">
        <thead>
          <tr>
            <th v-if="eta" class="is-clickable has-text-centered" @click="eta = !eta">ETA</th>
            <th v-else class="is-clickable has-text-centered" @click="eta = !eta">Duration</th>
            <th class="has-text-centered">Date</th>
            <th class="has-text-centered"><i class='fa fa-compass'></i></th>
            <th class="has-text-centered"><i class='fa fa-location-arrow'></i></th>
            <th></th>
            <th></th>
            <th>Boost</th>
            <th class="has-text-centered" colspan="2"><i class='fa fa-wind'></i></th>
            <th class="has-text-centered"><i class='fa fa-ship'></i></th>
            <th class="has-text-centered">Latitude</th>
            <th class="has-text-centered">Longitude</th>
          </tr>
        </thead>
        <tr v-for="(l) in progsLine" :key="l.timeshift" v-bind:class="{'has-background-primary-light': l.current, 'has-background-grey-lighter': l.outdated && !l.current}">
          <td v-if="eta" class="has-text-right">{{ l.eta }}</td>
          <td v-else class="has-text-right">{{ l.duration }}</td>
          <td class="has-text-right">{{ l.date }}</td>
          <td class="has-text-right" :class="{'has-background-warning-light': !l.outdated && !l.isTwa}">{{ parseFloat(l.bearing).toFixed(1) }}°</td>
          <td class="has-text-right" :class="{'has-background-warning-light': !l.outdated && l.isTwa, 'has-text-danger': l.twa < 0, 'has-text-success': l.twa > 0}">{{ parseFloat(l.twa).toFixed(1) }}°</td>
          <td :class="sailClass(l.sail)">{{ l.sail }}</td>
          <td><span v-if="l.foil > 0" class='foil' v-bind:style="{opacity: l.foil + '%'}"><i class='fa fa-fighter-jet'></i></span></td>
          <td><span v-if="l.boost > 0">{{ l.boost }}%</span></td>
          <td class="has-text-right">{{ parseFloat(l.wind).toFixed(1) }}°</td>
          <td class="has-text-right">{{ parseFloat(l.windSpeed).toFixed(1) }} kt</td>
          <td class="has-text-right">{{ parseFloat(l.boatSpeed).toFixed(1) }} kt</td>
          <td>{{ l.lat }}</td>
          <td>{{ l.lon }}</td>
        </tr>
      </table>

      <download-csv v-show="table == 'route'" :data="lines" name="phtheirichthys-route.csv" delimiter=";"
          :fields="['date', 'dlat', 'dlon', 'bearing', 'twa', 'wind', 'windSpeed', 'boatSpeed', 'sail']"
          :labels="{date: 'Date', dlat: 'Latitude', dlon: 'Longitude', bearing: 'HDG', twa: 'TWA', wind: 'TWD', windSpeed: 'TWS', boatSpeed: 'Speed', sail: 'Sail'}"
          >
        <button class="button">
          <span class="icon">
            <i class="fas fa-file-download"></i>
          </span>
          <span>csv</span>
        </button>
        <!--<img src="download_icon.png">-->
      </download-csv>

      <download-csv v-show="table == 'progs'" :data="progsLine" name="phtheirichthys-progs.csv" delimiter=";"
          :fields="['date', 'dlat', 'dlon', 'bearing', 'twa', 'wind', 'windSpeed', 'boatSpeed', 'sail']"
          :labels="{date: 'Date', dlat: 'Latitude', dlon: 'Longitude', bearing: 'HDG', twa: 'TWA', wind: 'TWD', windSpeed: 'TWS', boatSpeed: 'Speed', sail: 'Sail'}"
          >
        <button class="button">
          <span class="icon">
            <i class="fas fa-file-download"></i>
          </span>
          <span>csv</span>
        </button>
        <!--<img src="download_icon.png">-->
      </download-csv>

    </div>
  </div>
</template>

<script>
import {EventBus} from '../event-bus.js';

export default {
  name: 'Table',
  components: {
  },
  props: {
    display: Boolean
  },
  data: function() {
    return {
      route: null,
      lines: [],
      progs: null,
      progsLine: [],
      eta: true,
      table: "route"
    }
  },
  mounted: function() {
    EventBus.$on('route', this.onRoute)
    EventBus.$on('progs', this.onProgs)
  },
  computed: {
    //
    // var n = sumup.sailsDuration[0] + sumup.sailsDuration[1]
    // var l = sumup.sailsDuration[3] + sumup.sailsDuration[6]
    // var c = sumup.sailsDuration[4]
    // var h = sumup.sailsDuration[2] + sumup.sailsDuration[5]
    //
    // var title = dateFormat(sumup.start, "dd mmm HH:MM") + " " + Math.floor(sumup.duration/24) + "j" + (sumup.duration%24).toFixed(1)
    // var message = format("Std", n) + " | " + format("LG", l) + " | " + format("C0", c) + " | " + format("HG", h) + " | " + format("Foil", sumup.foilDuration)
    // if (Notification.permission === 'granted') {
    //   new Notification(title, {
    //       body: message,
    //   });
    // }

  },
  methods: {
    convertDDToDMS: function(D){
      var wrap = false
      if (D > 180) {
        D -= 360
        wrap = true
      }
      const res = {
        p : D<0?-1:1,
        d : 0|(D<0?D=-D:D),
        m : 0|D%1*60,
        s :(0|D*60%1*6000)/100
      }
      if (wrap === true) {
        res.wrap = true
      }
      return res
    },
    sailClass: function(s) {
      return s
    },
    formatHours: function(duration) {
      return Math.floor(duration / 24) * 24 + Math.round(duration % 24)
    },
    formatEta: function(delta) {
      var d = delta > 0?"+":"-"

      delta = Math.abs(delta)
      var j = Math.floor(delta / 24)
      var h = Math.floor(delta % 24)
      var m = Math.round(60 * (delta - j * 24 - h))
      if (m == 60) {
        m = 0
        h ++
      }
      if (h == 24) {
        h = 0
        j ++
      }

      if(j > 0) {
        d += j + "j"
      }
      if(h > 0) {
        d += String(h).padStart(2, ' ') + "h"
      }
      if(m > 0) {
        d += String(m).padStart(2, ' ') + "m"
      }

      return d
    },
    formatPenalties: function(penalties) {
      if (!penalties || penalties.length == 0) {
        return ""
      }

      var res = ""

      for (var p in penalties) {
        const minutes = (penalties[p].DurationSec / 60).toFixed(0)
        const secondes = String(penalties[p].DurationSec % 60).padStart(2, '0')

        if (res.length > 0) {
          res += " - "
        }

        res += minutes+"'"+secondes+"\" " + (penalties[p].Ratio * 100).toFixed(0) + "%"
      }

      return res
    },
    addLines: function(route, lines, isTwa) {
      this.loading = true
      const pad = (num, places) => String(num).padStart(places, '0')

      const sails = ["Jib", "Spi", "Stay", "LJ", "C0", "HG", "LG"];

      for (var i = 0 ; i < Math.min(500, route.windline.length) ; i++) {
        const wl = route.windline[i]

        var date = new Date(route.date.getTime())
        date.setMinutes(date.getMinutes() + wl.duration * 60);

        const delta = (date - new Date()) / 36e5;

        var year = date.getFullYear();
        var month = pad(date.getMonth() + 1, 2);
        var day = pad(date.getDate(), 2);
        var hrs = pad(date.getHours(), 2);
        var min = pad(date.getMinutes(), 2);

        var lat = this.convertDDToDMS(wl.lat)
        var lon = this.convertDDToDMS(wl.lon)

        var current = delta <= 0 && (!lines[0] || !lines[0].outdated && !lines[0].current)
        lines.unshift({
          outdated: delta < 0 && !current,
          current:  current,
          duration: this.formatEta(wl.duration),
          eta: this.formatEta(delta),
          date: year + "-" + month + "-" + day + " " + hrs + ":" + min,
          bearing: wl.bearing.toFixed(4),
          twa: wl.twa.toFixed(4),
          dlat: wl.lat,
          dlon: wl.lon,
          lat: pad(lat.d, 2) + "°" + (lat.p < 0 ? "S" : "N") + " " + pad(lat.m, 2) + "'" + pad(lat.s, 2) + "\"",
          lon: pad(lon.d, 2) + "°" + (lon.p < 0 ? "W" : "E") + " " + pad(lon.m, 2) + "'" + pad(lon.s, 2) + "\"",
          sail: sails[wl.sail],
          foil: wl.foil,
          boost: wl.boost,
          wind: wl.wind.toFixed(4),
          windSpeed: wl.windSpeed.toFixed(4),
          boatSpeed: wl.boatSpeed.toFixed(4),
          penalty: this.formatPenalties(wl.penalties),
          isTwa: isTwa,
          wl: wl
        })
      }
      this.loading = false
    },
    onRoute(route) {
      this.route = route
      this.lines = []
      this.addLines(route, this.lines)
    },
    onProgs(progs) {
      console.log(progs)
      this.progs = progs
      this.progsLine = []
      for(var p = progs.length - 1; p >= 0; p--) {
        var progLine = []
        for(var j = 0; j < progs[p].line.length - 1; j++) {
          progLine.unshift(progs[p].line[j])
        }
        this.addLines({date: progs[p].line[0].date, windline: progLine}, this.progsLine, progs[p].isTwa)
      }
    },
    refresh() {
      if(this.table == "route") {
        this.displayRoute()
        this.lines = []
        if (this.route)
          this.addLines(this.route, this.lines)
      } else if(this.table == "progs") {
        this.displayProgs()
        if (this.progs)
          this.onProgs(this.progs)

      }
    },
    displayRoute() {
      if (this.route) {
        this.table = "route"
      }
    },
    displayProgs() {
      if (this.progs) {
        this.table = "progs"
      }
    },
    highlight(wl) {
      EventBus.$emit('highlight', wl.date)
    },
    unhighlight(wl) {
      EventBus.$emit('unhighlight', wl.date)
    }
  }
}
</script>

<style scoped>
.monospace {
  font-family: Roboto Mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
}
.outdated {
  background-color: #fafafa;
}
.Jib {
  background-color: #ff9999;
}
.LJ {
  background-color: #ffff99;
}
.Stay {
  background-color: #99ff99;
}
.C0 {
  background-color: #99ddff;
}
.HG {
  background-color: #ff99ff;
}
.LG {
  background-color: #ffdd99;
}
.Spi {
  background-color: #9999ff;
}
</style>