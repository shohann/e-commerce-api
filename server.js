const app = require ('./app.js');
const dotenv = require('dotenv');
const port = process.env.PORT || 3001;
dotenv.config();

global.__basedir = __dirname;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})
