import Task from "../model/Task";

class TaskController {

    private taskLIst: Task[] = [];

    public static Add(req: any, res: any): void {
        
        res.end('AddTask');
    }

    public static Update(req: any, res: any): void {
        res.end('UpdateTask');
    }

    public static Delete(req: any, res: any): void {
        res.end('DeleteTask');
    }

    public static Get(req: any, res: any): void {
        res.end('GetTask');
    }

    public static GetAll(req: any, res: any): void {
        res.end('GetAllTask');
    }

    public getTaskList(): Task[] {
        return this.taskLIst;
    }

    public setTaskList(taskList: Task[]): void {
        this.taskLIst = taskList;
    }

}

export default TaskController;