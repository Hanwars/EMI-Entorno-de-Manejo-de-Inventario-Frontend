import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [RouterLink],
  templateUrl: './error.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './error.css',
})
export class Error {}
