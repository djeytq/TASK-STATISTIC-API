import PDFDocument from 'pdfkit';
import Task from "../model/Task";
import GeneratePDF from "../interfaces/generatePDF";

/**
 * Assumindo 4 categorias de status. Se o seu Task model ainda não tem
 * um campo "status", veja o fallback em getStatus() abaixo — ele deriva
 * o status a partir de "progress" (numérico), mas isso NÃO distingue
 * "IN_TEST" de "IN_PROGRESS". O ideal é adicionar um campo real
 * `status: 'DONE' | 'IN_PROGRESS' | 'IN_TEST' | 'TO_DO'` no Task.
 */
type TaskStatus = 'DONE' | 'IN_PROGRESS' | 'IN_TEST' | 'TO_DO';

interface StatusStyle {
    label: string;
    color: string;
    light: string;
}

const STATUS_STYLES: Record<TaskStatus, StatusStyle> = {
    DONE:        { label: 'Concluída',    color: '#16a34a', light: '#dcfce7' },
    IN_PROGRESS: { label: 'Em Progresso', color: '#f59e0b', light: '#fef3c7' },
    IN_TEST:     { label: 'Em Teste',     color: '#2563eb', light: '#dbeafe' },
    TO_DO:        { label: 'A Fazer',      color: '#6b7280', light: '#f3f4f6' },
};

class GenerateTaskPDF implements GeneratePDF {

    public async generate(tasks: Task[]): Promise<Buffer> {
        const doc = new PDFDocument({ autoFirstPage: false, margin: 40, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));

        return new Promise<Buffer>((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            doc.addPage();

            const stats = this.computeStats(tasks);

            this.drawHeader(doc, stats);
            this.drawSummaryCards(doc, stats);
            this.drawPieChart(doc, stats);
            this.drawTable(doc, tasks);

            doc.end();
        });
    }

    // ---------- leitura segura dos campos do Task ----------

    private getId(t: any): string | number {
        return typeof t.getId === 'function' ? t.getId() : t.id;
    }
    private getTitle(t: any): string {
        return typeof t.getTitle === 'function' ? t.getTitle() : t.title;
    }
    private getDescription(t: any): string {
        return (typeof t.getDescription === 'function' ? t.getDescription() : t.description) || '';
    }
    private getStatus(t: any): TaskStatus {
        const raw = typeof t.getStatus === 'function' ? t.getStatus() : t.status;
        if (raw && STATUS_STYLES[raw as TaskStatus]) return raw as TaskStatus;

        // Fallback: deriva de um "progress" numérico (0-100) se não houver status.
        const progress = typeof t.getProgress === 'function' ? t.getProgress() : t.progress;
        const p = Number(progress) || 0;
        if (p >= 100) return 'DONE';
        if (p > 0) return 'IN_PROGRESS';
        return progress;
    }

    // ---------- estatísticas ----------

    private computeStats(tasks: Task[]) {
        const counts: Record<TaskStatus, number> = { DONE: 0, IN_PROGRESS: 0, IN_TEST: 0, TO_DO: 0 };
        tasks.forEach((t) => counts[this.getStatus(t)]++);

        const total = tasks.length || 1;
        const percentages: Record<TaskStatus, number> = {
            DONE: Math.round((counts.DONE / total) * 100),
            IN_PROGRESS: Math.round((counts.IN_PROGRESS / total) * 100),
            IN_TEST: Math.round((counts.IN_TEST / total) * 100),
            TO_DO: Math.round((counts.TO_DO / total) * 100),
        };

        return { total: tasks.length, counts, percentages, overallProgress: percentages.DONE };
    }

    // ---------- desenho ----------

    private drawHeader(doc: PDFKit.PDFDocument, stats: ReturnType<GenerateTaskPDF['computeStats']>) {
        doc.rect(0, 0, doc.page.width, 90).fill('#111827');

        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20)
            .text('Relatório de Tarefas', 40, 25);

        const today = new Date();
        const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        doc.font('Helvetica').fontSize(10).fillColor('#d1d5db')
            .text(`Dia de trabalho: ${dateStr}`, 40, 55);

        doc.fontSize(10)
            .text(`Progresso geral: ${stats.overallProgress}% concluído (${stats.counts.DONE}/${stats.total} tarefas)`, 40, 70);

        doc.y = 110;
    }

    private drawSummaryCards(doc: PDFKit.PDFDocument, stats: ReturnType<GenerateTaskPDF['computeStats']>) {
        const cardsY = doc.y;
        const cardWidth = 120;
        const gap = 12;
        const startX = 40;

        const cards: { key: TaskStatus; value: number }[] = [
            { key: 'DONE', value: stats.counts.DONE },
            { key: 'IN_PROGRESS', value: stats.counts.IN_PROGRESS },
            { key: 'IN_TEST', value: stats.counts.IN_TEST },
            { key: 'TO_DO', value: stats.counts.TO_DO },
        ];

        cards.forEach((card, i) => {
            const style = STATUS_STYLES[card.key];
            const x = startX + i * (cardWidth + gap);

            doc.roundedRect(x, cardsY, cardWidth, 60, 6).fill(style.light);
            doc.rect(x, cardsY, 4, 60).fill(style.color);

            doc.fillColor(style.color).font('Helvetica-Bold').fontSize(20)
                .text(String(card.value), x + 14, cardsY + 10);

            doc.fillColor('#374151').font('Helvetica').fontSize(9)
                .text(style.label, x + 14, cardsY + 34, { width: cardWidth - 20 });
        });

        doc.y = cardsY + 80;
    }

    private drawPieChart(doc: PDFKit.PDFDocument, stats: ReturnType<GenerateTaskPDF['computeStats']>) {
        const centerX = 120;
        const centerY = doc.y + 90;
        const radius = 70;

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827')
            .text('Distribuição das Tarefas', 40, doc.y);

        const slices = (Object.keys(STATUS_STYLES) as TaskStatus[])
            .map((key) => ({ key, value: stats.counts[key] }))
            .filter((s) => s.value > 0);

        let startAngle = -Math.PI / 2;

        if (slices.length === 0) {
            doc.font('Helvetica').fontSize(10).fillColor('#6b7280')
                .text('Sem tarefas para exibir.', 40, centerY);
        } else if (slices.length === 1) {
            doc.circle(centerX, centerY, radius).fill(STATUS_STYLES[slices[0].key].color);
        } else {
            slices.forEach((slice) => {
                const sliceAngle = (slice.value / stats.total) * Math.PI * 2;
                this.drawPieSlice(doc, centerX, centerY, radius, startAngle, startAngle + sliceAngle, STATUS_STYLES[slice.key].color);
                startAngle += sliceAngle;
            });
        }

        const legendX = centerX + radius + 40;
        let legendY = centerY - radius;
        slices.forEach((slice) => {
            const style = STATUS_STYLES[slice.key];
            doc.rect(legendX, legendY, 10, 10).fill(style.color);
            doc.fillColor('#111827').font('Helvetica').fontSize(10)
                .text(`${style.label} — ${stats.percentages[slice.key]}%`, legendX + 16, legendY - 1);
            legendY += 20;
        });

        doc.y = centerY + radius + 30;
    }

    private drawPieSlice(doc: PDFKit.PDFDocument, cx: number, cy: number, radius: number, startAngle: number, endAngle: number, color: string) {
        const steps = 48;
        doc.moveTo(cx, cy);
        for (let i = 0; i <= steps; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / steps);
            doc.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
        }
        doc.closePath().fill(color);
    }

    private drawTable(doc: PDFKit.PDFDocument, tasks: Task[]) {
        const startX = 40;
        const colWidths = { id: 30, title: 130, description: 190, status: 80, progress: 60 };
        const tableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
        const rowHeight = 26;

        if (doc.y + 40 > doc.page.height - 60) doc.addPage();

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827')
            .text('Detalhamento das Tarefas', startX, doc.y);
        doc.moveDown(0.5);

        let y = doc.y;

        const drawHeaderRow = () => {
            doc.rect(startX, y, tableWidth, rowHeight).fill('#111827');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
            let x = startX;
            const headers: [string, number][] = [
                ['ID', colWidths.id], ['Título', colWidths.title], ['Descrição', colWidths.description],
                ['Status', colWidths.status], 
                /* ['Progresso', colWidths.progress], */
            ];
            headers.forEach(([label, w]) => {
                doc.text(label, x + 6, y + 8, { width: w - 8 });
                x += w;
            });
            y += rowHeight;
        };

        drawHeaderRow();

        tasks.forEach((t, i) => {
            const status = this.getStatus(t);
            const style = STATUS_STYLES[status];

            if (y + rowHeight > doc.page.height - 60) {
                doc.addPage();
                y = 40;
                drawHeaderRow();
            }

            doc.rect(startX, y, tableWidth, rowHeight).fill(i % 2 === 0 ? '#ffffff' : '#f9fafb');

            let x = startX;
            doc.fillColor('#374151').font('Helvetica').fontSize(9);

            doc.text(String(this.getId(t)), x + 6, y + 8, { width: colWidths.id - 8 }); x += colWidths.id;
            doc.text(this.getTitle(t), x + 6, y + 8, { width: colWidths.title - 8 }); x += colWidths.title;
            doc.text(this.getDescription(t), x + 6, y + 8, { width: colWidths.description - 8 }); x += colWidths.description;

            doc.roundedRect(x + 6, y + 5, colWidths.status - 12, 16, 8).fill(style.light);
            doc.fillColor(style.color).font('Helvetica-Bold').fontSize(8)
                .text(style.label, x + 6, y + 9, { width: colWidths.status - 12, align: 'center' });
            x += colWidths.status;

         /*    const progress = typeof (t as any).getProgress === 'function' ? (t as any).getProgress() : (t as any).progress;
            doc.fillColor('#374151').font('Helvetica').fontSize(9)
                .text(progress != null ? `${progress} teste %` : '—', x + 6, y + 8, { width: colWidths.progress - 8 });
 */
            y += rowHeight;
        });

        doc.y = y + 20;

        
    }

    private generateFooter(doc: PDFKit.PDFDocument) {
        doc.fontSize(8).fillColor('#bdc3c7').text(
            'This is an automated task report.',
            50,
            780,
            { align: 'center', width: 500 }
        );
    }
}

export default GenerateTaskPDF;