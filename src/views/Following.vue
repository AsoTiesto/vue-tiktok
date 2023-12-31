<template>
    <div class="following">
        <video ref="videoPlayer"
               :src="currentVideo"
               controls
               autoplay
               @ended="replayVideo();handleVideoEnded();"
               @touchstart="handleTouchStart"
               @touchmove="handleTouchMove"
               @touchend="handleTouchEnd">
        </video>

        <input type="range"
               min="0"
               :max="videoDuration"
               v-model="currentTime"
               class="slider"
               @input="seekVideo">
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
const currentTime = ref(0)
const videoDuration = ref(0)

let touchStartY = 0
let touchEndY = 0
let currentVideoIndex = 0
let timer = null

onBeforeUnmount(() => {
    const progress = {
        videoIndex: currentVideoIndex,
        progress: videoPlayer.value.currentTime
    }
    localStorage.setItem('videoProgress1', JSON.stringify(progress))
})

onMounted(async () => {
    await initTable()

    let savedProgress = localStorage.getItem('videoProgress1')
    if (savedProgress) {
        let parsedProgress = JSON.parse(savedProgress)
        currentVideoIndex = parsedProgress.videoIndex
        videos.value[currentVideoIndex].progress = parsedProgress.progress
    }

    await playVideo()

    watch(videoPlayer.value, () => {
        videoDuration.value = videoPlayer.value.duration
    }, { immediate: true })

    // 監聽視頻時間更新事件
    videoPlayer.value.addEventListener('timeupdate', () => {
        currentTime.value = videoPlayer.value.currentTime
        const progress = (videoPlayer.value.currentTime / videoPlayer.value.duration) * 100
        progressBarWidth.value = `${progress}%`
    })

    videoPlayer.value.addEventListener('loadedmetadata', () => {
        videoDuration.value = videoPlayer.value.duration
    })
})

const initTable = async () => {
    const res = await Api.a_followingList()

    if (res.data) {
        videoItems.value = res.data
        videos.value = videoItems.value.items
    }
}

const removeCoverImage = () => {
    const coverImage = document.querySelector('.cover-image')
    if (coverImage) {
        coverImage.remove()
    }
}

const showCoverImage = (cover) => {
    removeCoverImage()
    const coverImage = document.createElement('img')
    coverImage.src = cover
    coverImage.classList.add('cover-image')
    coverImage.style.position = 'absolute'
    coverImage.style.top = '0'
    coverImage.style.left = '0'
    coverImage.style.width = '100%'
    coverImage.style.height = '100%'
    document.querySelector('.following').appendChild(coverImage)
}

const handleTouchStart = (event) => {
    touchStartY = event.touches[0].clientY
}

const handleTouchMove = (event) => {
    touchEndY = event.touches[0].clientY

    const diff = touchStartY - touchEndY
    const threshold = 100 // 滑動閾值

    if (diff > threshold && currentVideoIndex < videos.value.length - 1) {

        // 顯示下一個影片的過場圖片
        showCoverImage(videos.value[currentVideoIndex + 1].cover)
    } else if (diff < -threshold && currentVideoIndex > 0) {

        // 顯示上一個影片的過場圖片
        showCoverImage(videos.value[currentVideoIndex - 1].cover)
    }
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

    // 移除過場圖片
    removeCoverImage()
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

const seekVideo = () => {
    videoPlayer.value.currentTime = currentTime.value
}

const handleVideoEnded = () => {
    // 等待影片元數據載入完成
    videoPlayer.value.addEventListener('loadedmetadata', () => {
        videoDuration.value = videoPlayer.value.duration

        // 將進度條寬度設置為 100%
        progressBarWidth.value = "100%"
    })
}
</script>

<style>
input.slider {
    -webkit-appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: #eaeaea;
    outline: none;
    opacity: 1;
    -webkit-transition: 0.2s;
    transition: opacity 0.2s;
}

input.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
}

input.slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
}
</style>
