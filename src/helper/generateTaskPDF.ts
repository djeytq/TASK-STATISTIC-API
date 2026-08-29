
import PDFDocument from 'pdfkit';
import Task from "../model/Task";
import GeneratePDF from "../interfaces/generatePDF";

class GenerateTaskPDF implements GeneratePDF {
	private getValue(t: any, prop: string) {
		return typeof t[`get${prop.charAt(0).toUpperCase() + prop.slice(1)}`] === 'function'
			? t[`get${prop.charAt(0).toUpperCase() + prop.slice(1)}`]()
			: t[prop];
	}

	private classify(progress: number) {
		if (progress >= 100) return 'Done';
		if (progress <= 0) return 'To Do';
		return 'In Progress';
	}

	private drawSummary(doc: PDFKit.PDFDocument, counts: Record<string, number>, total: number, avgProgress: number) {
		const done = counts['Done'] || 0;
		const inProgress = counts['In Progress'] || 0;
		const todo = counts['To Do'] || 0;

		doc.fontSize(14).fillColor('#003366').text('Summary Report', { underline: true });
		doc.moveDown(0.4);
		doc.fontSize(10).fillColor('black');
		doc.text(`Work day overview: ${total} tasks`);
		doc.text(`Done: ${done} (${total ? ((done / total) * 100).toFixed(1) : 0}%)  •  In Progress: ${inProgress} (${total ? ((inProgress / total) * 100).toFixed(1) : 0}%)  •  To Do: ${todo} (${total ? ((todo / total) * 100).toFixed(1) : 0}%)`);
		doc.text(`Average progress: ${avgProgress.toFixed(1)}%`);
		doc.moveDown();
	}

	private drawPieChart(doc: PDFKit.PDFDocument, counts: Record<string, number>, x: number, y: number, r: number) {
		const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
		const colors: Record<string, string> = { 'Done': '#2ecc71', 'In Progress': '#f39c12', 'To Do': '#95a5a6' };
		let start = -Math.PI / 2; // start at top

		Object.keys(colors).forEach((key) => {
			const value = counts[key] || 0;
			const angle = (value / total) * Math.PI * 2;
			const end = start + angle;

			doc.save();
			// compute start point on circle
			const sx = x + r * Math.cos(start);
			const sy = y + r * Math.sin(start);
			doc.moveTo(x, y);
			// line to start of arc
			doc.lineTo(sx, sy);
			// draw arc from start to end
			/* doc.arc(x, y, r, start, end); */
			// line back to center and fill
			doc.lineTo(x, y);
			doc.fill(colors[key]);
			doc.restore();

			start = end;
		});

		// Legend
		let ly = y - r;
		const lx = x + r + 20;
		Object.keys(colors).forEach((key) => {
			doc.rect(lx, ly, 10, 10).fill(colors[key]);
			doc.fillColor('black').fontSize(9).text(` ${key} (${counts[key] || 0})`, lx + 14, ly - 2);
			ly += 16;
		});
	}

	private drawTable(doc: PDFKit.PDFDocument, tasks: any[], startX: number, startY: number, colWidths: number[]) {
		const rowHeight = 20;
		let y = startY;

		// Header
		doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#003366');
		doc.fillColor('white').fontSize(10).text('#', startX + 4, y + 5, { width: colWidths[0] - 8 });
		doc.text('Title', startX + colWidths[0] + 4, y + 5, { width: colWidths[1] - 8 });
		doc.text('Description', startX + colWidths[0] + colWidths[1] + 4, y + 5, { width: colWidths[2] - 8 });
		doc.text('Progress', startX + colWidths[0] + colWidths[1] + colWidths[2] + 4, y + 5, { width: colWidths[3] - 8 });

		y += rowHeight;

		tasks.forEach((t: any, i: number) => {
			const title = String(this.getValue(t, 'title') || '-');
			const desc = String(this.getValue(t, 'description') || '-');
			const prog = Number(this.getValue(t, 'progress') ?? 0);
			const status = this.classify(prog);

			// Row background alternating
			if (i % 2 === 0) {
				doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#f7f9fb');
			}

			// Cells
			doc.fillColor('black').fontSize(9).text(String(i + 1), startX + 4, y + 5, { width: colWidths[0] - 8 });
			doc.text(title, startX + colWidths[0] + 4, y + 5, { width: colWidths[1] - 8 });
			doc.fillColor('gray').text(desc, startX + colWidths[0] + colWidths[1] + 4, y + 5, { width: colWidths[2] - 8 });

			// Progress bar cell
			const progX = startX + colWidths[0] + colWidths[1] + colWidths[2] + 6;
			const barWidth = colWidths[3] - 12;
			const barY = y + 6;
			// bar background
			doc.roundedRect(progX, barY, barWidth, 8, 2).stroke('#dddddd');
			// filled
			const fillW = Math.max(0, Math.min(1, prog / 100)) * barWidth;
			const fillColor = prog >= 100 ? '#2ecc71' : prog > 0 ? '#f39c12' : '#95a5a6';
			if (fillW > 0) doc.rect(progX, barY, fillW, 8).fill(fillColor);

			// Progress text
			doc.fillColor('black').fontSize(8).text(`${prog}%  ${status}`, progX + barWidth + 6, y + 3);

			y += rowHeight;

			// New page if needed
			if (y > doc.page.height - 60) {
				doc.addPage();
				y = 40;
			}
		});
	}

	public async generate(tasks: Task[]): Promise<Buffer> {
		const doc = new PDFDocument({ autoFirstPage: false, size: 'A4', margin: 40 });
		const chunks: Buffer[] = [];

		doc.on('data', (chunk: Buffer) => chunks.push(chunk));

		return new Promise<Buffer>((resolve, reject) => {
			doc.on('end', () => resolve(Buffer.concat(chunks)));
			doc.on('error', (err) => reject(err));

			doc.addPage();
			doc.font('Helvetica-Bold').fontSize(20).fillColor('#111827').text('Daily Tasks Report', { align: 'left' });
			doc.moveDown(0.3);
			doc.font('Helvetica').fontSize(10).fillColor('gray').text(`Generated: ${new Date().toLocaleString()}`);
			doc.moveDown();

			// compute stats
			const total = tasks.length;
			const counts: Record<string, number> = { 'Done': 0, 'In Progress': 0, 'To Do': 0 };
			let sumProg = 0;

			tasks.forEach((t: any) => {
				const prog = Number(this.getValue(t, 'progress') ?? 0);
				const status = this.classify(prog);
				counts[status] = (counts[status] || 0) + 1;
				sumProg += prog;
			});

			const avg = total ? sumProg / total : 0;

			this.drawSummary(doc, counts, total, avg);

			// Chart
			this.drawPieChart(doc, counts, 140, doc.y + 70, 50);

			// Move to table area
			const tableStartY = doc.y + 120;
			const startX = doc.page.margins.left;
			const colWidths = [30, 160, 200, 120];
			this.drawTable(doc, tasks, startX, tableStartY, colWidths);

			doc.end();
		});
	}
}

export default GenerateTaskPDF;
