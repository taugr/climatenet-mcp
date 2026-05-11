# Armenia Air Quality Map

<script setup>
import YerevanAirQualityMap from "./.vitepress/components/YerevanAirQualityMap.vue";
</script>

This live map shows the latest available particulate readings from ClimateNet stations across Armenia.

<ClientOnly>
  <YerevanAirQualityMap />
</ClientOnly>

The status colors are based on PM2.5 concentration bands and are meant as a quick particulate-reading guide, not an official AQI conversion.
