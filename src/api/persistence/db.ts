import * as mongoose from 'mongoose'

export const connectDB = () => mongoose.connect(process.env.API_DB_CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
  autoIndex: true,
})