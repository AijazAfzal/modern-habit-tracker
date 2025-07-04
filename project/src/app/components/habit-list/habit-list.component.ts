import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../services/habit.service';
import { Habit, HabitProgress, HabitStats } from '../../models/habit.model';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { HabitCardComponent } from '../habit-card/habit-card.component';

interface HabitWithStats extends Habit {
  stats: HabitStats;
  todayProgress: HabitProgress | undefined;
}

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HabitCardComponent],
  template: `
    <div class="habit-list">
      <div class="list-header">
        <h2>Today's Habits</h2>
        <div class="date">{{ today | date:'fullDate' }}</div>
      </div>
      
      <div class="empty-state" *ngIf="(habitsWithStats$ | async)?.length === 0">
        <div class="empty-illustration">
          <div class="empty-icon">🎯</div>
          <div class="empty-sparkles">✨</div>
        </div>
        <h3>Ready to build amazing habits?</h3>
        <p>Start your journey to a better you by creating your first habit!</p>
        <button class="btn btn-primary" (click)="onAddHabit()">
          <span class="btn-icon">+</span>
          Create Your First Habit
        </button>
      </div>
      
      <div class="habits-grid" *ngIf="(habitsWithStats$ | async)?.length! > 0">
        <app-habit-card
          *ngFor="let habit of habitsWithStats$ | async; trackBy: trackByHabit"
          [habit]="habit"
          [stats]="habit.stats"
          [todayProgress]="habit.todayProgress"
          (quickComplete)="toggleComplete(habit.id)"
          (progressClick)="openProgressDialog(habit)"
          (edit)="editHabit(habit)"
          (delete)="deleteHabit(habit.id)">
        </app-habit-card>
      </div>
    </div>
    
    <!-- Enhanced Progress Dialog -->
    <div class="modal-overlay" *ngIf="showProgressDialog" (click)="closeProgressDialog()">
      <div class="progress-dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <div class="dialog-title">
            <h3>Update Progress</h3>
            <div class="habit-color-indicator" [style.background-color]="selectedHabit?.color"></div>
          </div>
          <button class="close-btn" (click)="closeProgressDialog()">×</button>
        </div>
        
        <div class="dialog-content">
          <div class="habit-info">
            <h4>{{ selectedHabit?.name }}</h4>
            <p>{{ todayString | date:'mediumDate' }}</p>
          </div>
          
          <div class="progress-input">
            <label>Completion Percentage</label>
            <div class="progress-visual">
              <div class="progress-circle" [style.--progress]="progressPercentage">
                <div class="progress-circle-content">
                  <span class="progress-percentage">{{ progressPercentage }}%</span>
                </div>
              </div>
            </div>
            
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                [(ngModel)]="progressPercentage"
                class="progress-slider"
                [style.--slider-color]="selectedHabit?.color"
              >
            </div>
            
            <div class="quick-percentages">
              <button 
                class="quick-btn" 
                *ngFor="let percent of quickPercentages"
                (click)="setQuickPercentage(percent)"
                [class.active]="progressPercentage === percent"
                [style.background-color]="progressPercentage === percent ? selectedHabit?.color : 'transparent'"
                [style.border-color]="progressPercentage === percent ? selectedHabit?.color : 'var(--border-color)'"
                [style.color]="progressPercentage === percent ? 'white' : 'var(--text-primary)'"
              >
                {{ percent }}%
              </button>
            </div>
          </div>
          
          <div class="notes-input">
            <label>Notes (optional)</label>
            <textarea 
              [(ngModel)]="progressNotes"
              placeholder="How did it go? Any thoughts or reflections..."
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div class="dialog-actions">
          <button class="btn btn-outline" (click)="closeProgressDialog()">Cancel</button>
          <button 
            class="btn btn-primary" 
            [style.background-color]="selectedHabit?.color"
            [style.border-color]="selectedHabit?.color"
            (click)="saveProgress()"
          >
            Save Progress
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./habit-list.component.scss']
})
export class HabitListComponent implements OnInit {
  @Output() editHabitEvent = new EventEmitter<Habit>();
  @Output() addHabitEvent = new EventEmitter<void>();
  
  today = new Date();
  todayString = this.today.toISOString().split('T')[0];
  
  habitsWithStats$: Observable<HabitWithStats[]> = new Observable();
  
  // Progress dialog properties
  showProgressDialog = false;
  selectedHabit: Habit | null = null;
  progressPercentage = 0;
  progressNotes = '';
  quickPercentages = [0, 25, 50, 75, 100];

  constructor(private habitService: HabitService) {}

  ngOnInit(): void {
    this.habitsWithStats$ = combineLatest([
      this.habitService.getHabits(),
      this.habitService.getProgress()
    ]).pipe(
      map(([habits, progress]) => {
        return habits
          .filter(habit => habit.isActive)
          .map(habit => ({
            ...habit,
            stats: this.habitService.getHabitStats(habit.id),
            todayProgress: this.habitService.getHabitProgress(habit.id, this.todayString)
          }));
      })
    );
  }

  trackByHabit(index: number, habit: HabitWithStats): string {
    return habit.id;
  }

  toggleComplete(habitId: string): void {
    const currentProgress = this.habitService.getHabitProgress(habitId, this.todayString);
    const newPercentage = currentProgress?.completed ? 0 : 100;
    this.habitService.updateHabitProgress(habitId, this.todayString, newPercentage);
  }

  openProgressDialog(habit: Habit): void {
    this.selectedHabit = habit;
    const currentProgress = this.habitService.getHabitProgress(habit.id, this.todayString);
    this.progressPercentage = currentProgress?.completionPercentage || 0;
    this.progressNotes = currentProgress?.notes || '';
    this.showProgressDialog = true;
  }

  closeProgressDialog(): void {
    this.showProgressDialog = false;
    this.selectedHabit = null;
    this.progressPercentage = 0;
    this.progressNotes = '';
  }

  setQuickPercentage(percentage: number): void {
    this.progressPercentage = percentage;
  }

  saveProgress(): void {
    if (this.selectedHabit) {
      this.habitService.updateHabitProgress(
        this.selectedHabit.id,
        this.todayString,
        this.progressPercentage,
        this.progressNotes
      );
      this.closeProgressDialog();
    }
  }

  editHabit(habit: Habit): void {
    this.editHabitEvent.emit(habit);
  }

  deleteHabit(habitId: string): void {
    if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      this.habitService.deleteHabit(habitId);
    }
  }

  onAddHabit(): void {
    this.addHabitEvent.emit();
  }
}