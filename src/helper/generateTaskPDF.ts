
import PDFDocument from 'pdfkit';
import Task from "../model/Task";
import GeneratePDF from "../interfaces/generatePDF";

class GenerateTaskPDF implements GeneratePDF {
	public async generate(tasks: Task[]): Promise<Buffer> {
		const doc = new PDFDocument({ autoFirstPage: false });
		const chunks: Buffer[] = [];

		doc.on('data', (chunk: Buffer) => chunks.push(chunk));

		return new Promise<Buffer>((resolve, reject) => {
			doc.on('end', () => resolve(Buffer.concat(chunks)));
			doc.on('error', (err) => reject(err));

			doc.addPage();
			doc.fontSize(18).text('Tasks Report', { underline: true });
			doc.moveDown();

			tasks.forEach((t, i) => {
				const id = typeof (t as any).getId === 'function' ? (t as any).getId() : (t as any).id;
				const title = typeof (t as any).getTitle === 'function' ? (t as any).getTitle() : (t as any).title;
				const desc = typeof (t as any).getDescription === 'function' ? (t as any).getDescription() : (t as any).description;
				const prog = typeof (t as any).getProgress === 'function' ? (t as any).getProgress() : (t as any).progress;

				doc.fontSize(12).fillColor('black').text(`${i + 1}. ${title}`);
				if (desc) {
					doc.fontSize(10).fillColor('gray').text(desc + "djey");
				}
				doc.fontSize(10).fillColor('black').text(`Progress: ${String(prog)}`);
				doc.moveDown();
			});

			doc.end();
		});
	}
}

export default GenerateTaskPDF;
