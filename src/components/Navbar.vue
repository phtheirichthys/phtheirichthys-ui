<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Themes = "light" | "dark" | "system"
const theme = ref("light" as Themes)

onMounted(() => {
  //let theme = document.documentElement.getAttribute('data-theme')
})

function light() {
  theme.value = "light"
  switchTheme()
}

function dark() {
  theme.value = "dark"
  switchTheme()
}

function system() {
  theme.value = "system"
  switchTheme()
}

function switchTheme() {
  document.documentElement.setAttribute('data-theme', theme.value)
}

</script>

<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
      </a>

      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbar">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbar" class="navbar-menu">
      <div class="navbar-start">
        <a class="navbar-item">
          Home
        </a>

        <a class="navbar-item">
          Races
        </a>

        <a class="navbar-item">
          Polars
        </a>
      </div>

      <div class="navbar-end">
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link is-arrowless" :class="{'is-sun':theme==='light', 'is-moon':theme==='dark', 'is-system':theme==='system'}">
            <span v-if="theme==='light'" class="icon"><i class="fas fa-lg fa-sun" aria-hidden="true"></i></span>
            <span v-if="theme==='dark'" class="icon"><i class="fas fa-moon" aria-hidden="true"></i></span>
            <span v-if="theme==='system'" class="icon"><i class="fas fa-desktop" aria-hidden="true"></i></span>
          </a>

          <div class="navbar-dropdown is-boxed">
            <a class="navbar-item is-sun" :class="{'is-active':theme==='light'}" data-scheme="light" @click="light">
              <span class="icon"><i class="fas fa-lg fa-sun" aria-hidden="true"></i></span> <span class="text">Light</span>
            </a>
            <a class="navbar-item is-moon" :class="{'is-active':theme==='dark'}" data-scheme="dark" @click="dark">
              <span class="icon"><i class="fas fa-moon" aria-hidden="true"></i></span> <span class="text">Dark</span>
            </a>
            <a class="navbar-item is-system" :class="{'is-active':theme==='system'}" data-scheme="system" @click="system">
              <span class="icon"><i class="fas fa-desktop" aria-hidden="true"></i></span> <span class="text">System</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style>
.navbar-item.is-sun,
.navbar-link.is-sun {
  --bulma-navbar-h:42deg;
  --bulma-navbar-s:100%;
  --bulma-navbar-item-color-l:53%;
}

.navbar-item.is-moon,
.navbar-link.is-moon {
  --bulma-navbar-h:256deg;
  --bulma-navbar-s:89%;
  --bulma-navbar-item-color-l:65%;
}

.navbar-item.is-system,
.navbar-link.is-system {
  --bulma-navbar-h:153deg;
  --bulma-navbar-s:53%;
  --bulma-navbar-item-color-l:53%;
}

.navbar-item span.text {
  color: var(--bulma-text-strong);
  padding-left: 0.5em;
}

.navbar-item.is-active {
  background-color: hsla(var(--bulma-navbar-dropdown-item-h),var(--bulma-navbar-dropdown-item-s),var(--bulma-navbar-dropdown-item-color-l),.2);
}

.navbar-dropdown {
  margin-left: -101.95px;
}



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