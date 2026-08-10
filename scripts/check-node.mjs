// Vite 8 usa APIs que no existen antes de Node 20.19 (por ejemplo
// `util.styleText`). Sin esta comprobación el fallo aparece mucho después, como
// un "SyntaxError: does not provide an export named 'styleText'" que no dice
// nada sobre la versión de Node.

const REQUIRED = [20, 19]
const [major, minor] = process.versions.node.split('.').map(Number)
const ok = major > REQUIRED[0] || (major === REQUIRED[0] && minor >= REQUIRED[1])

if (!ok) {
  const rojo = '[31m'
  const negrita = '[1m'
  const fin = '[0m'
  console.error(`
${rojo}${negrita}Este proyecto necesita Node 20.19 o superior.${fin}
Estás usando Node ${process.versions.node}.

Si usas nvm, desde la carpeta del proyecto:

    nvm use

(el archivo .nvmrc ya indica la versión correcta)

Para dejarla por defecto en todas las terminales:

    nvm alias default 22
`)
  process.exit(1)
}
