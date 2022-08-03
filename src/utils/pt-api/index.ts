import characteristic from "./characteristic"
import device from "./device"
import storage from "./storage"

export default {
  copyToClipboard: device.copyToClipboard,
  getStorageSync: storage.getStorageSync,
  setStorageSync: storage.setStorageSync,
  removeStorageSync: storage.removeStorageSync,
  getCharacteristic: characteristic.getCharacteristic,
}