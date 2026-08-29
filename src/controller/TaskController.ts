import Task from "../model/Task";
import TaskService from "../service/TaskService";

class TaskController {

    private taskLIst: Task[] = [];
    private static readonly taskService: TaskService = new TaskService();

    public static GeneratePDF(req: any, res: any): void {
        let data: Task[];
        console.log(req.body);

        res.end('GeneratePDF');
    }

   

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