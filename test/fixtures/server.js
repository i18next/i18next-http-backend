import expect from 'expect.js'
import jsonServer from 'json-server'
let js

const server = (done) => {
  if (js) return done(null, js)

  js = jsonServer.create()
  js.use(jsonServer.bodyParser)

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
  js.post('/locales/missing/en/test', (req, res) => {
    expect(req.body).not.to.eql({})
    res.jsonp()
  })

  js.use(jsonServer.defaults())
  js.listen(5001, () => {
    console.log('JSON Server is running')
    done(null, js)
  })
}

export default server
