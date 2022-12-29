import * as mongoose from 'mongoose'

export const connectDB = () =>{
  mongoose.connect(process.env.CONSUMER_DB_CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
  autoIndex: true,
  connectTimeoutMS: 1000 * 60 * 10,
  socketTimeoutMS: 1000 * 60 * 10,
})}