import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Button } from '../button/button.component';

export interface FileUploadEvent {
  files: File[];
}

@Component({
  selector: 'eui-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  template: `
    <div class="flex items-center gap-3">
      <button type="button" euiButton severity="secondary" [outlined]="true" [label]="chooseLabel()" (click)="fileInput.click()"></button>

      @if (selectedFileName()) {
        <span class="max-w-[14rem] truncate text-sm text-surface-600 dark:text-surface-300">{{ selectedFileName() }}</span>
      }
    </div>

    @if (error()) {
      <p class="mt-1.5 text-xs text-danger-600 dark:text-danger-400">{{ error() }}</p>
    }

    <input #fileInput
           type="file"
           class="hidden"
           [accept]="accept()"
           [multiple]="fileLimit() > 1"
           (change)="onFileSelected($event)"/>
  `,
})
export class FileUpload {
  public readonly accept = input<string>();
  public readonly maxFileSize = input<number>();
  public readonly fileLimit = input(1);
  public readonly auto = input(true);
  public readonly chooseLabel = input<string>('Upload');

  public readonly uploaded = output<FileUploadEvent>();

  protected readonly selectedFileName = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected onFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files ?? []);
    inputEl.value = '';

    if (files.length === 0) {
      return;
    }

    if (files.length > this.fileLimit()) {
      this.error.set(`You can only select up to ${this.fileLimit()} file(s).`);
      return;
    }

    const maxSize = this.maxFileSize();
    if (maxSize && files.some((file) => file.size > maxSize)) {
      this.error.set(`File is too large (max ${(maxSize / 1_000_000).toFixed(1)} MB).`);
      return;
    }

    this.error.set(null);
    this.selectedFileName.set(files.map((file) => file.name).join(', '));
    this.uploaded.emit({ files });
  }
}
