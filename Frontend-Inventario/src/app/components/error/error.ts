import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [RouterLink],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class Error {}
