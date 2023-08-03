<template>
  <div>
    <div ref="HeatMapDrawings" class="heatmap2d"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters(['twoD']),
  },
  mounted() {
    this.drawing()
  },
  methods: {
    drawing() {
      console.log('drawing', this.$refs.HeatMapDrawings)
      if (!this.$refs.HeatMapDrawings) return
      const { drawing2D } = require('@/Util/drawing2D')
      console.log(this.twoD)
      drawing2D({
        ref: this.$refs.HeatMapDrawings,
        data: this.twoD.data,
        layout: this.twoD.layout,
        config: this.twoD.config,
        traces: this.twoD.traces,
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>

<style lang="scss" scoped>
.heatmap2d {
  height: 100%;
  width: 100%;
}
</style>
