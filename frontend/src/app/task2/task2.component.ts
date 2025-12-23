import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkspaceService, CreateWorkspaceRequest } from '../services/workspace.service';
import { MessageService, SendMessageRequest } from '../services/message.service';

interface WorkspaceResult {
  _id: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  createdAt: string;
}

@Component({
  selector: 'app-task2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="task2-container">
      <h2>Task 2: Create Workspace & Send Messages</h2>
      <p class="task-description">
        Create a form to create workspaces and send messages.
        Add basic validation and show success/error messages.
      </p>
      
      <div *ngIf="success" class="alert alert-success">
        <span>{{ success }}</span>
      </div>

      <div *ngIf="error" class="alert alert-error">
        <span>{{ error }}</span>
      </div>

      <div *ngIf="!createdWorkspace" class="form-section">
        <h3>Create New Workspace</h3>
        <form [formGroup]="workspaceForm" (ngSubmit)="createWorkspace()">
          <div class="form-group">
            <label for="name">Workspace Name <span class="required">*</span></label>
            <input 
              type="text" 
              id="name" 
              formControlName="name" 
              class="form-control"
              [class.error]="workspaceForm.get('name')?.invalid && workspaceForm.get('name')?.touched"
              placeholder="Enter workspace name"
            />
            <div *ngIf="workspaceForm.get('name')?.invalid && workspaceForm.get('name')?.touched" class="error-message">
              this field is required
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              formControlName="description" 
              class="form-control"
              rows="4"
              placeholder="Enter workspace description (optional)"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="type">Workspace Type</label>
            <select id="type" formControlName="type" class="form-control">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div class="form-group">
            <label for="createdBy">Created By <span class="required">*</span></label>
            <input 
              type="text" 
              id="createdBy" 
              formControlName="createdBy" 
              class="form-control"
              [class.error]="workspaceForm.get('createdBy')?.invalid && workspaceForm.get('createdBy')?.touched"
              placeholder="Enter creator name"
            />
            <div *ngIf="workspaceForm.get('createdBy')?.invalid && workspaceForm.get('createdBy')?.touched" class="error-message">
              this field is required
            </div>
          </div>

          <button 
            type="submit" 
            class="submit-button"
            [disabled]="workspaceForm.invalid || loading"
          >
            <span *ngIf="loading" class="spinner-small"></span>
            <span *ngIf="!loading">Create Workspace</span>
            <span *ngIf="loading">Creating...</span>
          </button>
        </form>
      </div>

      <div *ngIf="createdWorkspace" class="form-section">
        <h3>Send a Message</h3>
        <form [formGroup]="messageForm" (ngSubmit)="sendMessage()">
          <div class="form-group">
            <label for="content">Message Content <span class="required">*</span></label>
            <textarea 
              id="content" 
              formControlName="content" 
              class="form-control"
              rows="5"
              [class.error]="messageForm.get('content')?.invalid && messageForm.get('content')?.touched"
              placeholder="Enter your message"
            ></textarea>
            <div *ngIf="messageForm.get('content')?.invalid && messageForm.get('content')?.touched" class="error-message">
              this field is required
            </div>
          </div>

          <div class="form-group">
            <label for="messageType">Message Type</label>
            <select id="messageType" formControlName="type" class="form-control">
              <option value="text">Text</option>
              <option value="file">File</option>
              <option value="system">System</option>
            </select>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="submit-button"
              [disabled]="messageForm.invalid || loading"
            >
              <span *ngIf="loading" class="spinner-small"></span>
              <span *ngIf="!loading">Send Message</span>
              <span *ngIf="loading">Sending...</span>
            </button>
            <button 
              type="button" 
              class="reset-button"
              (click)="resetForms()"
              [disabled]="loading"
            >
              Create New Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./task2.component.css']
})
export class Task2Component {
  workspaceForm: FormGroup;
  messageForm: FormGroup;
  createdWorkspace: WorkspaceResult | null = null;
  loading: boolean = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private workspaceService: WorkspaceService,
    private messageService: MessageService
  ) {
    this.workspaceForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      type: ['public'],
      createdBy: ['', [Validators.required]]
    });

    this.messageForm = this.fb.group({
      content: ['', [Validators.required]],
      type: ['text']
    });
  }

  createWorkspace(): void {
    if (this.workspaceForm.invalid) {
      this.markFormGroupTouched(this.workspaceForm);
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const workspaceData: CreateWorkspaceRequest = {
      name: this.workspaceForm.value.name.trim(),
      description: this.workspaceForm.value.description?.trim() || undefined,
      type: this.workspaceForm.value.type,
      createdBy: this.workspaceForm.value.createdBy?.trim() || undefined
    };

    this.workspaceService.createWorkspace(workspaceData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.createdWorkspace = response.data;
          this.success = `Workspace "${response.data.name}" created successfully!`;
          this.error = null;
        } else {
          this.error = 'Failed to create workspace. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to create workspace. Please check your connection and try again.';
        console.error('Error creating workspace:', err);
      }
    });
  }

  sendMessage(): void {
    if (this.messageForm.invalid || !this.createdWorkspace) {
      this.markFormGroupTouched(this.messageForm);
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const messageData: SendMessageRequest = {
      content: this.messageForm.value.content.trim(),
      type: this.messageForm.value.type,
      author: {
        name: 'Current User' 
      }
    };

    this.messageService.sendMessage(this.createdWorkspace._id, messageData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.success = 'Message sent successfully!';
          this.error = null;
          this.messageForm.reset({
            content: '',
            type: 'text'
          });
        } else {
          this.error = 'Failed to send message. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to send message. Please check your connection and try again.';
        console.error('Error sending message:', err);
      }
    });
  }

  resetForms(): void {
    this.createdWorkspace = null;
    this.workspaceForm.reset({
      name: '',
      description: '',
      type: 'public',
      createdBy: ''
    });
    this.messageForm.reset({
      content: '',
      type: 'text'
    });
    this.error = null;
    this.success = null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
