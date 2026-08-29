import express from 'express';
import TaskController from '../controller/TaskController';

const Router = express.Router();

Router.post('/add', TaskController.Add);
Router.put('/update', TaskController.Update);
Router.delete('/delete', TaskController.Delete);
Router.get('/get', TaskController.Get);
Router.get('/getAll', TaskController.GetAll);

export default Router;