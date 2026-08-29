import express from "express";
import TaskRouter from "./task.routes"
import DocsRouter from "./docs.routes";
import DemoRouter from "./demo.routes";

const MasterRouter = express.Router();

MasterRouter.use("/task", TaskRouter);
MasterRouter.use("/docs", DocsRouter);
MasterRouter.use("/demo", DemoRouter);

export default MasterRouter;