import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitProgress, HabitStats } from '../../models/habit.model';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="habit-card" 
         [class.completed]="todayProgress?.completed"
         [style.--habit-color]="habit.color">
      
      <div class="habit-card-header">
        <div class="habit-info">
          <div class="habit-category-badge">
            {{ getCategoryIcon(habit.category) }} {{ habit.category }}
          </div>
          <h3 class="habit-name">{{ habit.name }}</h3>
          <p class="habit-description" *ngIf="habit.description">{{ habit.description }}</p>
        </div>
        
        <div class="completion-section">
          <div class="progress-ring" [style.--progress]="getProgressPercentage()">
            <div class="progress-content">
              <span class="progress-number">{{ getProgressPercentage() }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="habit-stats-row">
        <div class="stat-item">
          <span class="stat-icon">🔥</span>
          <div class="stat-content">
            <span class="stat-value">{{ stats.currentStreak }}</span>
            <span class="stat-label">Streak</span>
          </div>
        </div>
        
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <div class="stat-content">
            <span class="stat-value">{{ stats.completionRate | number:'1.0-0' }}%</span>
            <span class="stat-label">Success</span>
          </div>
        </div>
        
        <div class="stat-item">
          <span class="stat-icon">🎯</span>
          <div class="stat-content">
            <span class="stat-value">{{ stats.completedDays }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
      </div>
      
      <div class="habit-actions">
        <div class="completion-controls">
          <button class="quick-complete-btn"
                  [class.active]="todayProgress?.completed"
                  (click)="onQuickComplete()"
                  [title]="todayProgress?.completed ? 'Mark as incomplete' : 'Mark as complete'">
            <span class="btn-icon">{{ todayProgress?.completed ? '✓' : '○' }}</span>
            <span class="btn-text">{{ todayProgress?.completed ? 'Completed' : 'Complete' }}</span>
          </button>
          
          <button class="progress-btn"
                  (click)="onProgressClick()"
                  title="Set custom progress">
            <span class="btn-icon">%</span>
          </button>
        </div>
        
        <div class="menu-actions">
          <button class="action-btn edit" (click)="onEdit()" title="Edit habit">
            <span>✏️</span>
          </button>
          <button class="action-btn delete" (click)="onDelete()" title="Delete habit">
            <span>🗑️</span>
          </button>
        </div>
      </div>
      
      <div class="habit-footer" *ngIf="todayProgress?.notes">
        <div class="notes-preview">
          <span class="notes-icon">📝</span>
          <span class="notes-text">{{ todayProgress?.notes }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./habit-card.component.scss']
})
export class HabitCardComponent {
  @Input() habit!: Habit;
  @Input() stats!: HabitStats;
  @Input() todayProgress?: HabitProgress;
  
  @Output() quickComplete = new EventEmitter<void>();
  @Output() progressClick = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Health': '🏃‍♂️',
      'Learning': '📚',
      'Productivity': '⚡',
      'Mindfulness': '🧘‍♀️',
      'Social': '👥',
      'Creative': '🎨',
      'Other': '📌'
    };
    return icons[category] || '📌';
  }

  getProgressPercentage(): number {
    return this.todayProgress?.completionPercentage || 0;
  }

  onQuickComplete(): void {
    this.quickComplete.emit();
  }

  onProgressClick(): void {
    this.progressClick.emit();
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}