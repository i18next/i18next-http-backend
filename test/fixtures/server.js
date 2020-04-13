import jsonServer from 'json-server'
let js

const server = (done) => {
  if (js) return done(null, js)

  js = jsonServer.create()

  js.get('/locales/en/test', (req, res) => {
    res.jsonp({
      key: 'passing'
    })
  })
  js.get('/locales/en/nonjson', (req, res) => {
    res.send('<div>sorry no json file</div>')
  })
  js.get('/locales/en/test5', (req, res) => {
    res.send(`{ // this is json5, comments is stripped
      key: "passing"  // keys can be without ""
    }`)
  })

  js.use(jsonServer.defaults())
  js.listen(5001, () => {
    console.log('JSON Server is running')
    done(null, js)
  })
}

export default server
