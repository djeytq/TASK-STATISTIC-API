import Task from "../model/Task";
import TaskService from "../service/TaskService";
import GenerateTaskPDF from "../helper/generateTaskPDF";

class TaskController {

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
            res.status(200);
            res.end(pdfBuffer);
        } catch (err: any) {
            console.error('GeneratePDF error:', err);
            res.status(400).json({ error: err.message || 'Failed to generate PDF' });
        }
    }

    public static Add(req: any, res: any): void {
        res.status(200).json({ message: 'AddTask endpoint' });
    }

    public static Update(req: any, res: any): void {
        res.status(200).json({ message: 'UpdateTask endpoint' });
    }

    public static Delete(req: any, res: any): void {
        res.status(200).json({ message: 'DeleteTask endpoint' });
    }

    public static Get(req: any, res: any): void {
        res.status(200).json({ message: 'GetTask endpoint' });
    }

    public static GetAll(req: any, res: any): void {
        res.status(200).json({ message: 'GetAllTask endpoint' });
    }

}

export default TaskController;