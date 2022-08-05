<script setup lang="ts">
import { computed, ref } from 'vue';
import { hasPreviousRouteInApp, goHome, useRouteAndPtRouter } from "../../routes/pt-router";
import PtButton from "../../components/pt-button.vue"

const inputValue = ref<string>("")

</script>

<template>
  <h1>新建房间页</h1>
</template>