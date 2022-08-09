
import { StorageUserData } from "../../type"
import ptApi from "../pt-api"
import { nanoid } from "nanoid"

const getUserData = (): StorageUserData => {
  let userData = ptApi.getStorageSync<StorageUserData>("user_data")
  if(!userData) {
    userData = {
      nonce: nanoid()
    }
    ptApi.setStorageSync("user_data", userData)
  }
  else if(!userData.nonce) {
    userData.nonce = nanoid()
    ptApi.setStorageSync("user_data", userData)
  }
  return userData
}

const setUserData = (data: StorageUserData): void => {
  ptApi.setStorageSync("user_data", data)
}


export default {
  getUserData,
  setUserData,
}