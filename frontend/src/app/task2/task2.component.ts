import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  CreateWorkspaceRequest,
  WorkspaceService,
} from "@/app/services/workspace.service";
import { MessageService } from "@/app/services/message.service";

type WorkspaceType = "public" | "private" | undefined;
@Component({
  selector: "app-task2",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="task2-container">
      <h2>Task 2: Create Workspace & Send Messages</h2>
      <p class="task-description">
        Create a form to create workspaces and send messages. Add basic
        validation and show success/error messages.
      </p>

      <!-- TODO: Implement the workspace creation form and message sending form here -->
      <div class="workspace">
        @if (!workspaceCreated) {
          <form class="workspace-inputs">
            <div class="workspace-header">
              <input
                [(ngModel)]="workspaceForm.name"
                placeholder="name"
                name="NAme"
                type="text"
                required
              />
              <select [(ngModel)]="workspaceForm.type" name="type">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <textarea
              [(ngModel)]="workspaceForm.description"
              name="description"
              placeholder="Description"
            ></textarea>
          </form>
          <button [disabled]="!workspaceForm.name" (click)="createWorkspace()">
            Create Workspace
          </button>
        } @else {
          <form class="message-inputs">
            <select [(ngModel)]="messageForm.type" name="type">
              <option value="text">Text</option>
              <option value="file">File</option>
              <option value="system">System</option>
            </select>
            <textarea [(ngModel)]="messageForm.content" name="content">
            </textarea>
            <button [disabled]="!messageForm.content" (click)="sendMessage()">
              Send Message
            </button>
          </form>
        }
      </div>
      @if (errorMessage) {
        <div class="error-message">{{ errorMessage }}</div>
      }
    </div>
  `,
  styleUrl: "task2.component.scss",
})
export class Task2Component {
  protected workspaceForm: {
    name: string;
    description: string;
    type: WorkspaceType;
  } = {
    name: "",
    description: "",
    type: undefined,
  };
  protected messageForm: {
    content: string;
    type: "text" | "file" | "system";
    author: {
      name: string;
      userId?: string;
    };
  } = {
    content: "",
    type: "text",
    author: {
      name: "",
    },
  };
  private workspaceId: string = "";
  protected workspaceCreated = false;
  protected errorMessage: string | null = null;

  constructor(
    private workspaceService: WorkspaceService,
    private messageService: MessageService,
  ) {}

  protected createWorkspace(): void {
    console.log(this.workspaceForm);
    const request: CreateWorkspaceRequest = {
      ...this.workspaceForm,
      createdBy: Date.now().toString(),
    };
    this.workspaceService.createWorkspace(request).subscribe({
      next: (response) => {
        this.workspaceForm = { name: "", description: "", type: undefined };
        this.workspaceId = response.data._id;
        this.messageForm.author.name = response.data.name;
        this.workspaceCreated = true;
      },
      error: (error) => {
        this.errorMessage = error.error.message;
        console.error(error);
      },
    });
  }

  protected sendMessage(): void {
    this.messageService
      .sendMessage(this.workspaceId, this.messageForm)
      .subscribe({
        next: () => {
          this.messageForm = {
            content: "",
            type: "text",
            author: { name: "" },
          };
          this.workspaceCreated = false;
        },
        error: (error) => {
          this.errorMessage = error.error.message;
          console.error(error);
        },
      });
  }
}
