import axios from "axios"

const a_followingList = async () => {
    return axios.get('http://localhost:3000/following_list')
}

const a_forYouList = async () => {
    return axios.get('http://localhost:3000/for_you_list')
}

export default {
    a_followingList: a_followingList,
    a_forYouList: a_forYouList
}
