import express from "express";
import TaskRouter from "./task.routes"

const MasterRouter = express.Router();

MasterRouter.use("/task", TaskRouter);


export default MasterRouter;