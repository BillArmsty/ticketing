import cors from 'cors';
import express, {Application} from 'express';

import { signUpRouter } from './routes/signup';
import { loginRouter } from './routes/login';
import { eventRouter } from './routes/event';


export const App = (App: Application) => {
    App.use(cors());
    App.use(express.json());
    App.use(signUpRouter);
    App.use(loginRouter);
    App.use(eventRouter);
}

