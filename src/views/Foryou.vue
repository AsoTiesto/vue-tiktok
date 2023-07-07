<template>
    <div class="foryou"
         @touchstart="handleTouchStart"
         @touchmove="handleTouchMove"
         @touchend="handleTouchEnd">
        <video ref="videoPlayer"
               :src="currentVideo"
               controls
               autoplay></video>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import Api from "@/@core/api/index"
import Hls from 'hls.js'

const videoItems = ref([])
const videoPlayer = ref(null)
const videos = ref([])
const currentVideo = ref("")

let touchStartY = 0
let touchEndY = 0
let currentVideoIndex = 0
let timer = null

onMounted(async () => {
    await initTable()
    await playVideo()
})

const initTable = async () => {
    const res = await Api.a_forYouList()

    if (res.data) {
        videoItems.value = res.data
        videos.value = videoItems.value.items
    }
}

const handleTouchStart = (event) => {
    touchStartY = event.touches[0].clientY
}

const handleTouchMove = (event) => {
    touchEndY = event.touches[0].clientY
}

const handleTouchEnd = async () => {
    const diff = touchStartY - touchEndY
    const threshold = 100 // 滑動閾值

    if (diff > threshold && currentVideoIndex < videos.value.length - 1) {
        // 向上滑動切換到下一個影片
        currentVideoIndex++
    } else if (diff < -threshold && currentVideoIndex > 0) {
        // 向下滑動切換到上一個影片
        currentVideoIndex--
    }

    // 重設觸摸位置
    touchStartY = 0
    touchEndY = 0

    // 切換影片
    await playVideo()
}

const playVideo = async () => {
    if (Hls.isSupported()) {
        let hls = new Hls()
        if (hls) {
            hls.destroy()
        }
        hls = new Hls()
        hls.loadSource(videos.value[currentVideoIndex].play_url)
        hls.attachMedia(videoPlayer.value)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoPlayer.value.play()
        })
    } else if (videoPlayer.value.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.value.src = videos.value[currentVideoIndex].play_url
        videoPlayer.value.load()
        videoPlayer.value.play()
    }
}
</script>

<style>
@media (min-width: 1024px) {
    .about {
        min-height: 100vh;
        display: flex;
        align-items: center;
    }
}
</style>
