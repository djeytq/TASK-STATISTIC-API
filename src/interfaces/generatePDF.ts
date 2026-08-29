import Task from "../model/Task";

export default interface GeneratePDF {
	generate(tasks: Task[]): Promise<Buffer>;
}
