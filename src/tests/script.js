const taskListElement =
    document.getElementById("taskList");

const addTaskButton =
    document.getElementById("addTaskButton");

const sendTasksButton =
    document.getElementById("sendTasksButton");

const taskCounter =
    document.getElementById("taskCounter");

const message =
    document.getElementById("message");


/* DIALOG */

const taskDialog =
    document.getElementById("taskDialog");

const taskForm =
    document.getElementById("taskForm");

const dialogTitle =
    document.getElementById("dialogTitle");

const closeDialogButton =
    document.getElementById("closeDialogButton");

const cancelButton =
    document.getElementById("cancelButton");


/* INPUTS */

const titleInput =
    document.getElementById("title");

const descriptionInput =
    document.getElementById("description");

const progressInput =
    document.getElementById("progress");


/* =========================
   STATE
========================= */

let tasks = [];

let editingTaskId = null;

let nextId = 1;


/* =========================
   OPEN ADD MODAL
========================= */

addTaskButton.addEventListener("click", () => {

    editingTaskId = null;

    dialogTitle.textContent = "Add Task";

    taskForm.reset();

    progressInput.value = "TO_DO";

    taskDialog.showModal();

    titleInput.focus();
});


/* =========================
   OPEN EDIT MODAL
========================= */

function openEditModal(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return;
    }


    editingTaskId = id;


    dialogTitle.textContent = "Edit Task";


    titleInput.value =
        task.title;

    descriptionInput.value =
        task.description;

    progressInput.value =
        task.progress;


    taskDialog.showModal();

    titleInput.focus();
}


/* =========================
   SAVE TASK
========================= */

taskForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const title =
        titleInput.value.trim();

    const description =
        descriptionInput.value.trim();

    const progress =
        progressInput.value;


    if (!title || !description) {

        message.textContent =
            "Please fill all fields.";

        return;
    }


    /* EDIT */

    if (editingTaskId !== null) {

        const task = tasks.find(
            task => task.id === editingTaskId
        );


        if (task) {

            task.title =
                title;

            task.description =
                description;

            task.progress =
                progress;
        }

    }

    /* ADD */

    else {

        const task = {

            id: nextId++,

            title,

            description,

            progress
        };


        tasks.push(task);
    }


    renderTasks();

    taskDialog.close();

    taskForm.reset();

    editingTaskId = null;

    message.textContent = "";
});


/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {

    const confirmed =
        confirm("Delete this task?");


    if (!confirmed) {
        return;
    }


    tasks = tasks.filter(
        task => task.id !== id
    );


    renderTasks();
}


/* =========================
   RENDER
========================= */

function renderTasks() {

    taskListElement.innerHTML = "";


    if (tasks.length === 0) {

        taskListElement.innerHTML = `
            <div class="empty">
                No tasks yet.
                <br>
                Click "Add Task" to create one.
            </div>
        `;

    }


    tasks.forEach((task) => {

        const card =
            document.createElement("article");


        card.className =
            "task-card";


        card.innerHTML = `

            <div class="task-info">

                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                <div class="task-description">
                    ${escapeHTML(task.description)}
                </div>

                <span class="task-status">
                    ${formatProgress(task.progress)}
                </span>

            </div>


            <div class="task-actions">

                <button
                    type="button"
                    class="icon-button"
                    data-edit="${task.id}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="icon-button delete-button"
                    data-delete="${task.id}"
                >
                    Delete
                </button>

            </div>
        `;


        taskListElement.appendChild(card);
    });


    updateCounter();
}


/* =========================
   CARD BUTTONS
========================= */

taskListElement.addEventListener(
    "click",
    (event) => {

        const editButton =
            event.target.closest("[data-edit]");


        if (editButton) {

            const id =
                Number(editButton.dataset.edit);

            openEditModal(id);

            return;
        }


        const deleteButton =
            event.target.closest("[data-delete]");


        if (deleteButton) {

            const id =
                Number(deleteButton.dataset.delete);

            deleteTask(id);
        }
    }
);


/* =========================
   FORMAT PROGRESS
========================= */

function formatProgress(progress) {

    const labels = {

        TO_DO: "To Do",

        IN_PROGRESS: "In Progress",

        IN_TEST: "In Test",

        DONE: "Done"
    };


    return labels[progress] || progress;
}


/* =========================
   COUNTER
========================= */

function updateCounter() {

    const amount =
        tasks.length;


    taskCounter.textContent =
        `${amount} ${amount === 1 ? "task" : "tasks"}`;
}


/* =========================
   CLOSE DIALOG
========================= */

closeDialogButton.addEventListener(
    "click",
    () => {

        taskDialog.close();

        taskForm.reset();

        editingTaskId = null;
    }
);


cancelButton.addEventListener(
    "click",
    () => {

        taskDialog.close();

        taskForm.reset();

        editingTaskId = null;
    }
);


/* =========================
   SEND TO API
========================= */

sendTasksButton.addEventListener(
    "click",
    async () => {

        if (tasks.length === 0) {

            message.textContent =
                "Add at least one task.";

            return;
        }


        try {

            message.textContent =
                "Generating PDF...";


            const response =
                await fetch(
                    "http://localhost:8083/dev/task/generate-report",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(tasks)
                    }
                );


            if (!response.ok) {

                const errorText = await response.text();
                throw new Error(
                    `HTTP ${response.status}: ${errorText}`
                );
            }


            /* Handle PDF response as blob */
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            /* Create temporary link to trigger download */
            const link = document.createElement("a");
            link.href = url;
            link.download = "tasks.pdf";
            document.body.appendChild(link);
            link.click();

            /* Cleanup */
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);


            console.log(
                "PDF generated successfully!"
            );


            /* RESET */

            /* tasks = [];

            nextId = 1;

            editingTaskId = null; */


            renderTasks();


            message.textContent =
                "PDF generated successfully!";


        } catch (error) {

            console.error(error);

            message.textContent =
                "Failed to generate PDF: " + error.message;
        }
    }
);


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   INITIAL RENDER
========================= */

renderTasks();