module.exports = () => {
  // Load The FS Module & The Config File
  fs = require('fs');

  // Load The Path Module
  path = require('path');

  config = JSON.parse(fs.readFileSync('config.json'));

  // Load Express Module
  express = require('express');
  app = express();

  // Load Body Parser Module
  bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  // Load Express Handlebars Module & Setup Express View Engine
  expressHandlebars = require('express-handlebars');
  app.set('views', __dirname+'/views/'); // Set The Views Directory
  app.engine('html', expressHandlebars({ // Setup View Engine Middleware
    layoutsDir:__dirname + '/views/layouts',
  	defaultLayout: 'main',
  	extname: '.html',
  	helpers: {
  		section: function(name, options) {

  			if(!this._sections) {
  				this._sections = {};
  			}

  			this._sections[name] = options.fn(this);
  			return null;
  		}
  	}
  }));
  
  app.set('view engine', 'html');

  // Setup Globally Included Directories
  app.use(express.static(path.join(__dirname, '/../bower_components/')));
  app.use(express.static(path.join(__dirname, '/../node_modules/')));
  app.use(express.static(path.join(__dirname, '/../controllers/')));
  app.use(express.static(path.join(__dirname, '/../public/')));

  // Load Available Modules For Dependancy Injection Into Models & Routes
  modules = {
  	app: app,
  	bodyParser: bodyParser,
  	config: config,
  	express: express,
  	expressHandlebars: expressHandlebars,
  	fs: fs,
  	path: path
  };

  // Setup Globally Included Routes
  fs.readdirSync(path.join(__dirname, 'routes')).forEach(function(filename) {
  	if(~filename.indexOf('.js'))
  		require(path.join(__dirname, 'routes/'+filename))(modules);
  });

  const notifier = require('node-notifier');
  app.get('/ring', function(req, res) {
    var name = req.query.name
    if (name === '' || name === undefined) {
      name = 'Unknown'
    }

    var msg = name + ' is here'

    notifier.notify({
        title: 'Ring ring...',
        message: msg
    })

    //console.log(name + ' is ringing...')
    res.send(msg)
  });

  // Start The HTTP Server
  app.listen(config.server.port, config.server.host);
}
