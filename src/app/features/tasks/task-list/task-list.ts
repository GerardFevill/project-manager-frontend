import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services';
import { Task, TaskFilterDto, CreateTaskDto } from '../../../core/models';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
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
