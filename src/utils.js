export function getInstance() {
  const app = document.getElementById("app")
  return app.__vue__
}

export function getStore() {
  const instance = getInstance()
  return instance.$store
}
