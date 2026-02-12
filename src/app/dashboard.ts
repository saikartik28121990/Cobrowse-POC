import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import CobrowseIO from 'cobrowse-sdk-js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @Output() logout = new EventEmitter<void>();
  constructor(private zone: NgZone) { }

  @ViewChild('signatureCanvas') set signatureCanvasSetter(
    canvasEl: ElementRef<HTMLCanvasElement> | undefined
  ) {
    if (canvasEl) {
      this.canvas = canvasEl;
      this.setupCanvas();
    }
  }

  private canvas?: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;

  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  activeTab: 'pending' | 'completed' = 'pending';
  selectedTask: string | null = null;

  actionValue = '';
  selectedApplication = '';
  uploadedFile: File | null = null;

  showCobrowse = false;
  cobrowseCode = '986325';

  completedTaskViewData: Record<string, string> | null = null;

  visaExpiryDate: string = new Date(
    new Date().setFullYear(new Date().getFullYear() + 5)
  ).toISOString().split('T')[0];

  loggedInUser = {
    username: 'John Doe',
    tasks: [
      { name: 'Basic details', completed: true },
      { name: 'Address details', completed: true },
      { name: 'Employment details', completed: true },
      { name: 'EIDA details', completed: false },
      { name: 'Application details', completed: false },
      { name: 'Document upload', completed: false },
      { name: 'Document signing', completed: false }
    ]
  };

  taskLabels: Record<string, string> = {
    'EIDA details': 'EIDA Number',
    'Application details': 'Select Product',
    'Document upload': 'Upload document',
    'Document signing': 'Sign document'
  };

  ngOnInit() { }
  ngAfterViewInit() { }

  /* ---------------- Canvas ---------------- */
  private setupCanvas() {
    if (!this.canvas) return;
    const canvasEl = this.canvas.nativeElement;
    const dpr = window.devicePixelRatio || 1;

    canvasEl.width = 600 * dpr;
    canvasEl.height = 200 * dpr;
    canvasEl.style.width = '600px';
    canvasEl.style.height = '200px';

    this.ctx = canvasEl.getContext('2d');
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
    }
  }

  onPointerDown(event: PointerEvent) {
    if (!this.ctx || !this.canvas) return;
    this.drawing = true;
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.lastX = event.clientX - rect.left;
    this.lastY = event.clientY - rect.top;
  }

  onPointerMove(event: PointerEvent) {
    if (!this.drawing || !this.ctx || !this.canvas) return;
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
  }

  onPointerUp() {
    this.drawing = false;
  }

  /* ---------------- Getters ---------------- */
  get pendingTasks() {
    return this.loggedInUser.tasks.filter(t => !t.completed);
  }

  get completedTasks() {
    return this.loggedInUser.tasks.filter(t => t.completed);
  }

  get isVisaTask() {
    return this.selectedTask === 'EIDA details';
  }

  get isApplicationTask() {
    return this.selectedTask === 'Application details';
  }

  get isFileUploadTask() {
    return this.selectedTask === 'Document upload';
  }

  get isSignatureTask() {
    return this.selectedTask === 'Document signing';
  }

  get isStaticDetailTask() {
    return ['Basic details', 'Address details', 'Employment details']
      .includes(this.selectedTask || '');
  }

  get currentLabel() {
    return this.selectedTask ? this.taskLabels[this.selectedTask] : '';
  }

  /* ---------------- Static Data ---------------- */
  get staticTaskData() {
    switch (this.selectedTask) {
      case 'Basic details':
        return {
          'Full Name': this.loggedInUser.username,
          'DOB': '01 Jan 1990',
          'Nationality': 'UAE'
        };
      case 'Address details':
        return {
          'Address': 'Al Nahda Street',
          'City': 'Dubai',
          'Country': 'UAE'
        };
      case 'Employment details':
        return {
          'Employer': 'ABC Technologies',
          'Role': 'Senior Engineer',
          'Experience': '6 Years'
        };
      default:
        return {};
    }
  }

  /* ---------------- Completed Task Data ---------------- */
  getCompletedTaskData(taskName: string): Record<string, string> {
    switch (taskName) {
      case 'Basic details':
        return {
          'Full Name': this.loggedInUser.username,
          'DOB': '01 Jan 1990',
          'Nationality': 'UAE'
        };
      case 'Address details':
        return {
          'Address': 'Al Nahda Street',
          'City': 'Dubai',
          'Country': 'UAE'
        };
      case 'Employment details':
        return {
          'Employer': 'ABC Technologies',
          'Role': 'Senior Engineer',
          'Experience': '6 Years'
        };
      case 'EIDA details':
        return {
          'EIDA Number': 'EIDA-12345',
          'Expiry Date': this.visaExpiryDate
        };
      case 'Application details':
        return {
          'Application Type': 'Account Onboarding',
          'Status': 'Approved'
        };
      case 'Document upload':
        return {
          'File Name': 'passport.pdf',
          'Uploaded On': '10 Jan 2026'
        };
      case 'Document signing':
        return {
          'Signed By': this.loggedInUser.username,
          'Signed On': '12 Jan 2026'
        };
      default:
        return {};
    }
  }

  /* ---------------- Actions ---------------- */
  handleCardClick(taskName: string) {
    const task = this.loggedInUser.tasks.find(t => t.name === taskName);
    if (!task) return;

    if (task.completed) {
      this.selectedTask = null;
      this.completedTaskViewData = this.getCompletedTaskData(taskName);
      return;
    }

    this.completedTaskViewData = null;
    this.selectedTask = taskName;
  }

  handleSubmit() {
    const task = this.loggedInUser.tasks.find(t => t.name === this.selectedTask);
    if (task) task.completed = true;
    this.selectedTask = null;
    this.activeTab = 'completed';
  }

  handleLogout() {
    this.logout.emit();
  }
  handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.uploadedFile = input.files?.[0] || null;
  }

  startCobrowse() {
    this.showCobrowse = true;
    CobrowseIO.api = 'https://dev.bluemena.com';
    CobrowseIO.license = 'IrXHA98IC4P3JQ';

    CobrowseIO.client()
      .then(() => CobrowseIO.start())
      .then(() => CobrowseIO.createSessionCode())
      .then((code: string) => {
        this.cobrowseCode = code;
      });
  }
}
