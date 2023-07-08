<template>
    <div class="foryou">
        <video ref="videoPlayer"
               :src="currentVideo"
               controls
               autoplay
               @ended="replayVideo"
               @touchstart="handleTouchStart"
               @touchmove="handleTouchMove"
               @touchend="handleTouchEnd">
        </video>

        <div class="progress-bar">
            <div class="progress"
                 :style="{ width: progressBarWidth }"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import Api from "@/@core/api/index"
import Hls from 'hls.js'

const videoItems = ref([])
const videoPlayer = ref(null)
const videos = ref([])
const currentVideo = ref("")
const progressBarWidth = ref("0%")

let touchStartY = 0
let touchEndY = 0
let currentVideoIndex = 0
let timer = null

onBeforeUnmount(() => {
    const progress = {
        videoIndex: currentVideoIndex,
        progress: videoPlayer.value.currentTime
    }
    localStorage.setItem('videoProgress2', JSON.stringify(progress))
})

onMounted(async () => {
    await initTable()

    let savedProgress = localStorage.getItem('videoProgress2')
    if (savedProgress) {
        let parsedProgress = JSON.parse(savedProgress)
        currentVideoIndex = parsedProgress.videoIndex
        videos.value[currentVideoIndex].progress = parsedProgress.progress
    }


    await playVideo()

    // 設置 progress bar 寬度監聽器
    watch(videoPlayer, () => {
        const currentTime = videoPlayer.value.currentTime
        const duration = videoPlayer.value.duration
        const progress = (currentTime / duration) * 100
        progressBarWidth.value = `${progress}%`
    }, { immediate: true })


    // 監聽 video 影片更新進度
    videoPlayer.value.addEventListener('timeupdate', () => {
        const currentTime = videoPlayer.value.currentTime
        const duration = videoPlayer.value.duration
        const progress = (currentTime / duration) * 100
        progressBarWidth.value = `${progress}%`
    })

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
            videoPlayer.value.currentTime = videos.value[currentVideoIndex].progress
            videoPlayer.value.play()
        })
    } else if (videoPlayer.value.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.value.src = videos.value[currentVideoIndex].play_url
        videoPlayer.value.load()
        videoPlayer.value.play()
    }
}

const replayVideo = () => {
    videoPlayer.value.currentTime = 0
    videoPlayer.value.play()
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

.progress-bar {
    background-color: darkred;
    height: 8px;
    margin-top: 10px;
    position: relative;
}

.progress {
    background-color: #007bff;
    height: 100%;
    width: 0;
    transition: width 0.3s ease-in-out;
}
</style>
