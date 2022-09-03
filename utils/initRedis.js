const redis = require('redis')

const client = redis.createClient({
  host: '127.0.0.1',
  port: 6379
})

const connectRedis = async () => {
  try {
    await client.connect();
    console.log('Redis client connect successfully');
  } catch (error) {
    console.log(error);
    setTimeout(connectRedis, 5000);
  }
};

connectRedis();

module.exports = client


// const client = redis.createClient({
//   host: '127.0.0.1',
//   port: 6379
// })

// const clientCnnect = async () => {
//   try {
//     await client.connect();
//   } catch (err) {
//     console.log(err);
//   }
// }



// client.on('connect', () => {
//   console.log('Client connected to redis...')
// })

// clientCnnect()



// client.on('ready', () => {
//   console.log('Client connected to redis and ready to use...')
// })
// // client.setAsync = promisify(client.SET);
// client.on('error', (err) => {
//   console.log(err.message)
// })

// client.on('end', () => {
//   console.log('Client disconnected from redis')
// })

// process.on('SIGINT', () => {
//   client.quit()
// })

// module.exports = client