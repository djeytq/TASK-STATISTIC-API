import Task from "../model/Task";
import TaskService from "../service/TaskService";
import GenerateTaskPDF from "../helper/generateTaskPDF";

class TaskController {

    private taskLIst: Task[] = [];
    private static readonly taskService: TaskService = new TaskService();

    public static async GeneratePDF(req: any, res: any): Promise<void> {
        try {
            const raw = req.body;
            const tasks: Task[] = TaskController.taskService.processTasks(raw);

            const generator = new GenerateTaskPDF();
            const pdfBuffer = await generator.generate(tasks);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="tasks.pdf"');
            res.setHeader('Content-Length', String(pdfBuffer.length));
            res.end(pdfBuffer);
        } catch (err: any) {
            console.error('GeneratePDF error:', err);
            res.statusCode = 400;
            res.end(String(err.message || err));
        }
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