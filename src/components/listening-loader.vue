<script setup lang="ts"></script>

<template>
<div class="waveform">
  <div class="waveform__bar"></div>
  <div class="waveform__bar"></div>
  <div class="waveform__bar"></div>
  <div class="waveform__bar"></div>
</div>
</template>
<style scoped>
.waveform {
  --uib-size: 40px;
  --uib-speed: 1s;
  --uib-color: var(--text-color);
  --uib-line-weight: 3.5px;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  width: var(--uib-size);
  height: calc(var(--uib-size) * 0.9);
}

.waveform__bar {
  width: var(--uib-line-weight);
  height: 100%;
  background-color: var(--uib-color);
}

.waveform__bar:nth-child(1) {
  animation: grow var(--uib-speed) ease-in-out
    calc(var(--uib-speed) * -0.45) infinite;
}

.waveform__bar:nth-child(2) {
  animation: grow var(--uib-speed) ease-in-out
    calc(var(--uib-speed) * -0.3) infinite;
}

.waveform__bar:nth-child(3) {
  animation: grow var(--uib-speed) ease-in-out
    calc(var(--uib-speed) * -0.15) infinite;
}

.waveform__bar:nth-child(4) {
  animation: grow var(--uib-speed) ease-in-out infinite;
}

@keyframes grow {
  0%,
  100% {
    transform: scaleY(0.3);
  }

  50% {
    transform: scaleY(1);
  }
}

</style>

