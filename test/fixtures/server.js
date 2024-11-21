import expect from 'expect.js'
import jsonServer from 'json-server'
let js

const server = (done) => {
  if (js) return done(null, js)

  js = jsonServer.create()
  js.use((req, res, next) => {
    // disable keep alive so the test server can close quickly.
    res.setHeader('Connection', 'close')
    next()
  })
  js.use(jsonServer.bodyParser)

  js.get('/locales/en/testqs', (req, res) => {
    res.jsonp(req.query)
  })

  js.patch('/locales/it/testns', (req, res) => {
    res.jsonp({
      via: 'patch'
    })
  })

  js.patch('/create/it/testns', (req, res) => {
    expect(req.body).not.to.eql({})
    res.jsonp()
  })

  js.get('/locales/en/test', (req, res) => {
    res.jsonp({
      key: 'passing'
    })
  })
  js.get('/locales/en/test2', (req, res) => {
    res.send(JSON.stringify({
      key: 'passing'
    }))
  })
  js.get('/locales/en/nonjson', (req, res) => {
    res.send('<div>sorry no json file</div>')
  })
  js.get('/locales/en/test5', (req, res) => {
    res.send(`{ // this is json5, comments is stripped
      key: "passing"  // keys can be without ""
    }`)
  })
  js.get('/locales/en/testc', (req, res) => {
    res.send(`{ // this is jsonc, comments is stripped
      "key": "passing"
    }`)
  })
  js.post('/locales/missing/en/test', (req, res) => {
    expect(req.body).not.to.eql({})
    res.jsonp()
  })
  js.post('/locales/addCustom/en/test', (req, res) => {
    expect(req.body).not.to.eql({})
    res.jsonp()
  })

  js.use(jsonServer.defaults())
  js.listen(5001, () => {
    console.log('JSON Server is running')
    done(null, js)
  }).unref()
}

export default server
