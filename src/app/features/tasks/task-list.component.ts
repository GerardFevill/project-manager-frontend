import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services';
import { Task, TaskFilterDto, CreateTaskDto } from '../../core/models';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="task-list-container">
      <div class="header">
        <h1>Project Manager</h1>
        <button class="btn-primary" (click)="showCreateForm = !showCreateForm">
          {{ showCreateForm ? 'Cancel' : 'New Task' }}
        </button>
      </div>

      <!-- Create Task Form -->
      @if (showCreateForm) {
        <div class="task-form">
          <h2>Create New Task</h2>
          <input
            [(ngModel)]="newTask.title"
            placeholder="Task title"
            class="input-field"
          />
          <textarea
            [(ngModel)]="newTask.description"
            placeholder="Description (optional)"
            class="input-field"
          ></textarea>
          <select [(ngModel)]="newTask.priority" class="input-field">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <input
            type="date"
            [(ngModel)]="newTask.dueDate"
            class="input-field"
          />
          <div class="form-actions">
            <button (click)="createTask()" class="btn-primary">Create</button>
            <button (click)="showCreateForm = false" class="btn-secondary">Cancel</button>
          </div>
        </div>
      }

      <!-- Filters -->
      <div class="filters">
        <select [(ngModel)]="filters.status" (change)="loadTasks()" class="input-field">
          <option value="all">All Tasks</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <select [(ngModel)]="filters.priority" (change)="loadTasks()" class="input-field">
          <option [value]="undefined">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="filters.onlyRoot" (change)="loadTasks()" />
          Root tasks only
        </label>
      </div>

      <!-- Task List -->
      <div class="tasks">
        @if (loading()) {
          <div class="loading">Loading tasks...</div>
        } @else if (tasks().length === 0) {
          <div class="empty">No tasks found. Create your first task!</div>
        } @else {
          @for (task of tasks(); track task.id) {
            <div class="task-card" [class.completed]="task.completed">
              <div class="task-header">
                <input
                  type="checkbox"
                  [checked]="task.completed"
                  (change)="toggleTask(task.id)"
                  class="task-checkbox"
                />
                <h3 [class.completed-text]="task.completed">{{ task.title }}</h3>
                <span class="priority priority-{{ task.priority }}">{{ task.priority }}</span>
              </div>

              @if (task.description) {
                <p class="task-description">{{ task.description }}</p>
              }

              <div class="task-meta">
                <span>Level: {{ task.level }}</span>
                @if (task.dueDate) {
                  <span>Due: {{ task.dueDate | date:'short' }}</span>
                }
                <span>Created: {{ task.createdAt | date:'short' }}</span>
              </div>

              <div class="task-actions">
                <button (click)="viewChildren(task.id)" class="btn-small">
                  View Subtasks
                </button>
                <button (click)="deleteTask(task.id)" class="btn-danger-small">
                  Delete
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .task-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    h1 {
      font-size: 2rem;
      color: #333;
    }

    .task-form {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .input-field {
      width: 100%;
      padding: 10px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    textarea.input-field {
      min-height: 80px;
      resize: vertical;
    }

    .form-actions {
      display: flex;
      gap: 10px;
    }

    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      align-items: center;
    }

    .filters .input-field {
      width: auto;
      margin-bottom: 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .tasks {
      display: grid;
      gap: 15px;
    }

    .task-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      transition: box-shadow 0.3s;
    }

    .task-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .task-card.completed {
      background: #f9f9f9;
      opacity: 0.8;
    }

    .task-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .task-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .task-header h3 {
      flex: 1;
      margin: 0;
      font-size: 1.2rem;
    }

    .completed-text {
      text-decoration: line-through;
      color: #999;
    }

    .priority {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .priority-low { background: #e3f2fd; color: #1976d2; }
    .priority-medium { background: #fff3e0; color: #f57c00; }
    .priority-high { background: #fce4ec; color: #c2185b; }
    .priority-urgent { background: #ffebee; color: #d32f2f; }

    .task-description {
      color: #666;
      margin: 10px 0;
    }

    .task-meta {
      display: flex;
      gap: 15px;
      font-size: 12px;
      color: #999;
      margin: 10px 0;
    }

    .task-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
    }

    .btn-primary:hover {
      background: #1565c0;
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d5d5d5;
    }

    .btn-small {
      padding: 6px 12px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .btn-small:hover {
      background: #45a049;
    }

    .btn-danger-small {
      padding: 6px 12px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .btn-danger-small:hover {
      background: #da190b;
    }

    .loading, .empty {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  `]
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);

  tasks = signal<Task[]>([]);
  loading = signal(false);
  showCreateForm = false;

  filters: TaskFilterDto = {
    status: 'all',
    onlyRoot: true
  };

  newTask: CreateTaskDto = {
    title: '',
    priority: 'medium'
  };

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading.set(true);
    this.taskService.findAll(this.filters).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.loading.set(false);
      }
    });
  }

  createTask() {
    if (!this.newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    this.taskService.create(this.newTask).subscribe({
      next: () => {
        this.loadTasks();
        this.newTask = { title: '', priority: 'medium' };
        this.showCreateForm = false;
      },
      error: (err) => {
        console.error('Error creating task:', err);
        alert('Failed to create task');
      }
    });
  }

  toggleTask(id: string) {
    this.taskService.toggle(id).subscribe({
      next: () => this.loadTasks(),
      error: (err) => console.error('Error toggling task:', err)
    });
  }

  deleteTask(id: string) {
    if (confirm('Are you sure? This will delete the task and all its subtasks.')) {
      this.taskService.remove(id).subscribe({
        next: () => this.loadTasks(),
        error: (err) => {
          console.error('Error deleting task:', err);
          alert('Failed to delete task');
        }
      });
    }
  }

  viewChildren(id: string) {
    this.filters.parentId = id;
    this.filters.onlyRoot = false;
    this.loadTasks();
  }
}
