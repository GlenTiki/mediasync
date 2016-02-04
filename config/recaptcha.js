// so, in prod (da browser), we don't have access to the server's env...
// so, the actual site client key is put here. you need to overwrite with your
// own if you want to run a public mediasync server yourself
exports.client = process.env.clientRecaptchaKey || '6LcEWhcTAAAAAHSz59UydKrCbtk3dCNaC5CoKs6-'
exports.server = process.env.serverRecaptchaKey
