import VConsole from 'vconsole';
import util from "../utils/util";

export const useApp = () => {
  const _env = util.getEnv()
  if(_env.DEV) {
    new VConsole()
  }
}