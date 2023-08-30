import VConsole from 'vconsole';
import util from "../utils/util";

export function useApp() {
  const _env = util.getEnv()
  if(_env.DEV) {
    new VConsole()
  }

  const plausibleSrc = _env.PLAUSIBLE_SRC
  const plausibleDomain = _env.PLAUSIBLE_DOMAIN
  if(plausibleSrc && plausibleDomain) {
    loadScript(plausibleSrc, [{ key: "data-domain", val: plausibleDomain }])
  }
}


interface AttrAtom {
  key: string
  val: string
}

function loadScript(
  src: string,
  attrs: AttrAtom[] = [],
) {

  const scriptEl = document.createElement('script')
  scriptEl.type = "text/javascript"
  scriptEl.src = src
  
  for(let i=0; i<attrs.length; i++) {
    const v = attrs[i]
    scriptEl.setAttribute(v.key, v.val)
  }
  scriptEl.defer = true

  const headEl = document.querySelector("head")
  if(!headEl) return

  headEl.appendChild(scriptEl)
}