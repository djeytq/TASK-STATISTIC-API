

import Task from "../model/Task";
import Progress from "../interfaces/Progress";

class TaskService {
	public processTasks(rawTasks: any): Task[] {
		if (!Array.isArray(rawTasks)) {
			console.error('Invalid payload: expected an array of tasks', rawTasks);
			throw new Error('Invalid payload: expected an array of tasks');
		}

		const allowed: Progress[] = ["TO_DO", "IN_PROGRESS", "IN_TEST", "DONE"];

		return rawTasks.map((r: any, idx: number) => {
			const id = Number(r.id ?? idx + 1);
			const title = String(r.title ?? '');
			const description = String(r.description ?? '');
			const rawProg = String(r.progress ?? 'TO_DO') as Progress;
			const progress = allowed.includes(rawProg as Progress) ? (rawProg as Progress) : 'TO_DO';

			return new Task(id, title, description, progress);
		});
	}
}

export default TaskService;