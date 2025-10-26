import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          [style.width.%]="progress"
          [class.low]="progress < 33"
          [class.medium]="progress >= 33 && progress < 66"
          [class.high]="progress >= 66 && progress < 100"
          [class.complete]="progress === 100"
        ></div>
      </div>
      @if (showLabel) {
        <span class="progress-label">{{ progress }}%</span>
      }
    </div>
  `,
  styles: [`
    .progress-container {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
      border-radius: 4px;
      position: relative;
    }

    .progress-fill.low {
      background: linear-gradient(90deg, #dc3545 0%, #e74c3c 100%);
    }

    .progress-fill.medium {
      background: linear-gradient(90deg, #fd7e14 0%, #ff9800 100%);
    }

    .progress-fill.high {
      background: linear-gradient(90deg, #0d6efd 0%, #0dcaf0 100%);
    }

    .progress-fill.complete {
      background: linear-gradient(90deg, #198754 0%, #20c997 100%);
    }

    .progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    .progress-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      min-width: 40px;
      text-align: right;
    }
  `]
})
export class TaskProgressBarComponent {
  @Input({ required: true }) progress!: number;
  @Input() showLabel = true;
}
