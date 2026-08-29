import Progress from "../interfaces/Progress";


class Task {
    private id: number;
    private title: string;
    private description: string;
    private progress: Progress;

    constructor(id: number, title: string, description: string, progress: Progress) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.progress = progress;
    }

    public getId(): number {
        return this.id;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public getTitle(): string {
        return this.title;
    }

    public setTitle(title: string): void {
        this.title = title;
    }

    public getDescription(): string {
        return this.description;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

    public getProgress(): Progress {
        return this.progress;
    }

    public setProgress(progress: Progress): void {
        this.progress = progress;
    }

}

export default Task;