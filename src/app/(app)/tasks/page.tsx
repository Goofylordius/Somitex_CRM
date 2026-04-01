import { listTasks } from "@/lib/data/tasks";

export default async function TasksPage() {
  const tasks = await listTasks();

  return (
    <section className="panel">
      <div className="panel-body">
        <div className="panel-header">
          <div>
            <h3>Aufgabenverwaltung</h3>
            <p>Faelligkeiten, Prioritaeten und Zustaendigkeiten mit Berechtigungssystem.</p>
          </div>
          <span className="status-chip">{tasks.length} offen</span>
        </div>
        <div className="list-stack">
          {tasks.map((task) => (
            <article key={task.id} className="mini-card">
              <div>
                <strong>{task.title}</strong>
                <p>
                  {task.companyName} · {task.priority}
                </p>
              </div>
              <span>{new Date(task.dueAt).toLocaleString("de-DE")}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

