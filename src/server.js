import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { getEnvVar } from './utils/getEnvVar.js';
import { getAllStudents, getStudentById } from './services/students.js';

// * Читаємо змінну оточення PORT
const PORT = Number(getEnvVar('PORT', '3000')); // const PORT = 3000;

export const startServer = () => {
  const app = express();

  // * Для включення middleware в наш застосунок потрібно на сервері викликати метод use, передавши йому:
  // * першим аргументом paths (визначає шляхи, до яких буде застосований цей middleware)
  // * другим — власне сам middleware
  // * app.use(paths, middleware);

  app.use((req, res, next) => {
    console.log('');
    console.log('A new request has come');
    console.log(`Time: ${new Date().toLocaleString()}`);
    next();
  });
  // app.use('/', (req, res, next) => {
  //   console.log(`Time: ${new Date().toLocaleString()}`);
  //   next();
  // });

  // * Якщо до виклику app.use не передати перший аргумент зі шляхом або передати рядок '*' ,
  // * то тоді middleware буде застосований до всіх можливих роутів (маршрутів) на сервері:
  // app.use(middleware);
  // app.use('*', middleware);
  app.use(express.json());

  app.use(cors());
  // const corsOptions = {
  //   origin: 'https//localhost:3003',
  //   optionsSuccessStatus: 200,
  // };
  // app.use(cors(corsOptions));

  // * Middleware для логування, такий як pino-http, слід розташовувати якомога раніше у ланцюгу middleware,
  // * щоб він міг логувати всі вхідні запити до вашого додатку, а також відповіді та можливі помилки,
  // * що виникають під час обробки цих запитів.
  // * Це означає, що pino повинен бути одним з перших мідлварів, які ви додаєте до екземпляру app.
  app.use(
    pino({
      transport: { target: 'pino-pretty' },
    }),
  );

  app.get('/', (req, res) => {
    res.json({ message: 'Hello world' });
  });

  app.get('/students', async (req, res) => {
    const students = await getAllStudents();

    res.status(200).json({
      data: students,
    });
  });

  app.get('/students/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const student = await getStudentById(studentId);

    if (!student) {
      res.status(404).json({
        message: 'Student not found',
      });
      return;
    }

    res.status(200).json({
      data: student,
    });
  });

  const extraMiddleware = (req, res, next) => {
    console.log('Extra middleware was done');

    next();
  };

  // app.get(
  //   '/extramiddleware',
  //   extraMiddleware,
  //   extraMiddleware,
  //   extraMiddleware,
  //   (req, res) => {
  //     res.json({ message: 'Controller with extra middleware' });
  //   },
  // );
  app.get(
    '/extramiddleware',
    [extraMiddleware, extraMiddleware, extraMiddleware],
    (req, res) => {
      res.json({ message: 'Controller with extra middleware' });
    },
  );

  app.use((req, res, next) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
    });
  });

  app.listen(PORT, (err) => {
    if (err) {
      throw err;
    }

    console.log(`Server is running on port: ${PORT}`);
  });
};
