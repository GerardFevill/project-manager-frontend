import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-progress-bar.html',
  styleUrl: './task-progress-bar.scss'
})
export class TaskProgressBarComponent {
  @Input({ required: true }) progress!: number;
  @Input() showLabel = true;
}
