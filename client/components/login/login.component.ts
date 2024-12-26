import {Component} from '@angular/core';
import {ServerService} from '../../services/server.service';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [FormsModule],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private serverService: ServerService, private router: Router) {
  }

  onSubmit(form: any) {
    if (form.valid) {
      this.serverService.login(this.username, this.password).subscribe((result) =>
      this.router.navigate(['/home']))
    } else {
      alert('פרטים שגויים');
    }
  }
}
