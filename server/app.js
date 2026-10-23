import express from 'express';
import usersRouter from './src/routes/usersRouter.js';

const app = express()
const PORT = process.env.APP_PORT || 3000

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`)
})