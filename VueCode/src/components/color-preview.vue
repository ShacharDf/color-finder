<template>
  <div class="fan-color" :style="getColors">
    <p>rgb:{{ getRGB }}</p>
    <p>name: {{ color["color name"] }}</p>
    <p>family: {{ color["color family"] }}</p>
    <p>number: {{ color["color number"] }}</p>
    <!-- <p>fan page: {{ color["fan page"] }}</p> -->
  </div>
</template>

<script>
export default {
  props: {
    color: Object,
  },
  created() {},
  computed: {
    getRealBackgroundColor() {
      return {
        backgroundColor: `rgb(${this.color.RGB[0]},${this.color.RGB[1]},${this.color.RGB[2]})`,
      };
    },
    getRGB() {
      return `${this.color.RGB[0]},${this.color.RGB[1]},${this.color.RGB[2]}`;
    },
    getColors() {
      return {
        backgroundColor: `rgb(${this.color.RGB[0]},${this.color.RGB[1]},${this.color.RGB[2]})`,
        color:
          this.color.RGB[0] + this.color.RGB[1] + this.color.RGB[2] > 450
            ? "#2c3e50"
            : "#dcdfef",
      };
    },
  },
};
</script>

<style>
.fan-color {
  padding: 5px;
  height: 175px;
  border: 0.5px solid black;
}
</style>