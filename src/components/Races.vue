<script setup lang="ts">
import { ref } from 'vue';

import Navbar from './Navbar.vue'

const app = ref(null);


</script>

<template>
  <section class="hero is-fullheight">
    <div class="hero-head">
      <Navbar />
    </div>
    <div class="hero-body">
      <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        <thead>
          <tr>
            <th class="is-fullwidth"><abbr title="Name">Name</abbr></th>
            <th class=""><abbr title="Name">Name</abbr></th>
          </tr>
        </thead>
      </table>
    </div>
  </section>
</template>

<style>
.navbar-item.is-sun {
  --bulma-navbar-dropdown-item-h:42deg;
  --bulma-navbar-dropdown-item-s:100%;
  --bulma-navbar-dropdown-item-color-l:53%;
}

.navbar-item span.text {
  color: var(--bulma-text-strong);
  padding-left: 0.5em;
}

.navbar-item.is-active.is-sun {
  --bulma-navbar-h:42deg;
  --bulma-navbar-s:100%;
  --bulma-navbar-item-color-l:53%;
}

.navbar-item.is-moon {
  --bulma-navbar-dropdown-item-h:256deg;
  --bulma-navbar-dropdown-item-s:89%;
  --bulma-navbar-dropdown-item-color-l:65%;
}

.navbar-item.is-active.is-moon {
  --bulma-navbar-h:256deg;
  --bulma-navbar-s:89%;
  --bulma-navbar-item-color-l:65%;
}

.navbar-item.is-system {
  --bulma-navbar-dropdown-item-h:153deg;
  --bulma-navbar-dropdown-item-s:53%;
  --bulma-navbar-dropdown-item-color-l:53%;
}

.navbar-item.is-system {
  --bulma-navbar-h:153deg;
  --bulma-navbar-s:53%;
  --bulma-navbar-item-color-l:53%;
}

.navbar-item.is-active {
  background-color: hsla(var(--bulma-navbar-dropdown-item-h),var(--bulma-navbar-dropdown-item-s),var(--bulma-navbar-dropdown-item-color-l),.2);
}
/* 
.bd-cycle {
  --h:var(--bulma-sun-h);
  --s:var(--bulma-sun-s);
  --l:var(--bulma-sun-l);
  border-radius:.5em;
  color:hsl(var(--h),var(--s),var(--l));
  display:flex;
  flex-shrink:0;
  height:2.5rem;
  overflow:hidden;
  position:relative;
  transition-property:background-color;
  width:2.5rem
}
.bd-cycle:hover {
  background-color:hsla(var(--h),var(--s),var(--l),.1)
}
.bd-cycle.is-moon {
  --h:var(--bulma-moon-h);
  --s:var(--bulma-moon-s);
  --l:var(--bulma-moon-l)
}
.bd-cycle.is-moon .bd-cycles {
  transform:translate3d(0,-2.5rem,0)
}
.bd-cycles {
  display:flex;
  flex-direction:column;
  flex-shrink:0;
  height:5rem;
  transition-duration:var(--bulma-duration);
  transition-property:transform;
  width:2.5rem
}
.bd-cycle-moon,
.bd-cycle-sun {
  align-items:center;
  color:inherit;
  display:flex;
  flex-shrink:0;
  height:2.5rem;
  justify-content:center;
  transition:none;
  width:2.5rem
}
.bd-cycle-moon.is-active,
.bd-cycle-sun.is-active {
  opacity:1
}
.bd-cycle-sun.is-active {
  color:var(--sun)
}
.bd-cycle-moon.is-active {
  color:var(--moon)
} */
</style>