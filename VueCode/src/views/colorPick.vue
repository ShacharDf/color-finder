<template>
  <div class="main" :style="getAvgColor">
    <div class="color-list">
      <color-preview
        v-for="color1 in colors"
        :color="color1"
        :key="color1['color number']"
      />
    </div>
    <p :style="getFontColor">color:{{ rgb }}</p>
    <label class="custom-file-upload">
      <input
        type="file"
        class="file-input btn"
        @change="loadImageFromInput($event)"
      />
      Upload image
    </label>
    <div class="wrap-con">
      <span class="wrap" :style="getWidthHeight"></span>
      <img
        class="img-f-canvas"
        @mousedown.prevent="start($event)"
        @touchstart="start($event)"
        @mousemove="end($event)"
        @touchmove="end($event)"
        @mouseup="
          end($event);
          isDraggin = false;
        "
        @touchend="
          end($event);
          isDraggin = false;
        "
        @mouseleave="
          end($event);
          isDraggin = false;
        "
        ref="imageCaller"
        :src="getBasicImg"
      />
    </div>
  </div>
</template>

<script>
import { colorService } from "../services/color-service.js";
import colorPreview from "../components/color-preview.vue";
import { imgData } from "../services/basicImgLoad.js";
export default {
  name: "color-pick",
  props: {},
  data() {
    return {
      rgb: { r: 0, g: 0, b: 0 },
      failCount: 0,
      isDraggin: false,
      pos: { start: 0, end: 0 },
      colors: [],
    };
  },
  mounted() {
    this.getAverageRGB();
    this.failCount = 0;
    window.addEventListener("resize", () => {
      this.getAverageRGB();
      this.pos = { start: 0, end: 0 };
    });
  },
  computed: {
    getBasicImg(){
      return imgData;
    },
    getAvgColor() {
      return {
        backgroundColor: `rgb(${this.rgb.r},${this.rgb.g},${this.rgb.b})`,
      };
    },
    getFontColor() {
      return {
        color:
          this.rgb.r + this.rgb.g + this.rgb.b > 450 ? "#2c3e50" : "#dcdfef",
      };
    },
    getWidthHeight() {
      const { start, end } = this.pos;
      if (start.x === end.x && start.y === end.y) {
        return {
          width: 0 + "px",
          height: 0 + "px",
          left: 0 + "px",
          top: 0 + "px",
        };
      }
      const xDiff = Math.abs(start.x - end.x) || 1;
      const yDiff = Math.abs(start.y - end.y) || 1;
      const startX = Math.min(start.x, end.x);
      const startY = Math.min(start.y, end.y);
      return {
        width: xDiff + "px",
        height: yDiff + "px",
        left: startX + "px",
        top: startY + "px",
      };
    },
  },
  methods: {
    start(ev) {
      this.isDraggin = true;
      let pos = { x: ev.offsetX, y: ev.offsetY };
      this.pos = { start: 0, end: 0 };
      ev.preventDefault();
      this.pos.start = { x: ev.offsetX, y: ev.offsetY };
      if (!ev.offsetX) {
        const bounds = ev.target.getBoundingClientRect();
        const currX = ev.changedTouches[0].clientX - bounds.x;
        const currY = ev.changedTouches[0].clientY - bounds.y;
        pos = {
          x: currX,
          y: currY,
        };
        this.pos.start = pos;
      }
    },
    end(ev) {
      ev.preventDefault();
      let pos = { x: ev.offsetX, y: ev.offsetY };
      if (!this.isDraggin) return;
      if (!ev.offsetX) {
        const evTouch = ev.changedTouches[0];
        const bounds = ev.target.getBoundingClientRect();
        const currX = evTouch.clientX - bounds.x;
        const currY = evTouch.clientY - bounds.y;
        if (
          currX < 0 ||
          currX > evTouch.target.width ||
          currY < 0 ||
          currY > evTouch.target.height
        ) {
          return;
        }
        pos = {
          x: currX,
          y: currY,
        };
      }
      this.pos.end = pos;
      this.getAverageRGB();
    },
    getAverageRGB() {
      const elImg = this.$refs.imageCaller;
      let blockSize = 5, // pixels jumping
        elCanvas = document.createElement("canvas"),
        context = elCanvas.getContext("2d"),
        i = -4,
        rgb = { r: 0, g: 0, b: 0 },
        count = 0;

      if (!context) {
        return { r: 0, g: 0, b: 0 };
      }

      const height = (elCanvas.height =
        elImg?.clientHeight ||
        elImg?.naturalHeight ||
        elImg?.offsetHeight ||
        elImg?.height ||
        0);
      const width = (elCanvas.width =
        elImg?.clientWidth ||
        elImg?.naturalWidth ||
        elImg?.offsetWidth ||
        elImg?.width ||
        0);

      try {
        context.drawImage(elImg, 0, 0);
        const { start, end } = this.pos;
        if (start.x !== end.x || start.y !== end.y) {
          const xDiff = Math.abs(start.x - end.x) || 1;
          const yDiff = Math.abs(start.y - end.y) || 1;
          const startX = Math.min(start.x, end.x);
          const startY = Math.min(start.y, end.y);
          console.log({startX,startY,xDiff,yDiff});
          var data = context.getImageData(startX, startY, xDiff, yDiff);
        } else {
          var data = context.getImageData(0, 0, width, height);
        }
      } catch (e) {
        this.failCount++;
        console.error("Canvas not supported or didnt load yet");
        if (this.failCount < 5) {
          setTimeout(this.getAverageRGB, 69);
        }
        return { r: 0, g: 0, b: 0 }; //return black when not supporting
      }
      const length = data.data.length;

      while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
      }

      rgb.r = ~~(rgb.r / count);
      rgb.g = ~~(rgb.g / count);
      rgb.b = ~~(rgb.b / count);

      this.rgb = rgb;

      const rgbLength =
        window.innerWidth / 150 >= 6 ? 6 : window.innerWidth / 150;
      this.colors = colorService.getColorName(rgb, rgbLength) || [];

      return rgb;
    },
    loadImageFromInput(ev) {
      this.pos = { start: 0, end: 0 };
      var reader = new FileReader();
      reader.onload = (event) => {
        const img = this.$refs.imageCaller;
        img.src = event.target.result;
        img.onload = () => {
          this.getAverageRGB(img);
        };
      };
      reader.readAsDataURL(ev.target.files[0]);
    },
  },
  components: {
    colorPreview,
  },
  destroyed() {
    window.removeEventListener("resize", () => {
      this.getAverageRGB();
      this.pos = { start: 0, end: 0 };
    });
  },
};
</script>

<style scoped>
input[type="file"] {
  display: none;
}

.custom-file-upload {
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  background-color: aliceblue;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

img {
  user-select: none;
  width: 100%;
  display: block;
}

.file-input {
  width: 176px;
}
.color-list {
  height: 175px;
  display: flex;
  width: 100%;
  justify-content: center;
}
.color-list > * {
  flex-grow: 1;
}

.wrap-con {
  position: relative;
  max-width: 70%;
  user-select: none;
  border: 1px solid rgb(149, 150, 161);
}

.wrap {
  position: absolute;
  border: 1px solid white;
  pointer-events: none;
}
</style>
