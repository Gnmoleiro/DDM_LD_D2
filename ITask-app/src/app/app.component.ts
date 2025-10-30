import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logInSharp, logInOutline, albumsSharp, albumsOutline, buildSharp, buildOutline, checkboxSharp, checkboxOutline,
  keySharp, keyOutline, addSharp, addOutline, personSharp, personOutline
} from 'ionicons/icons';
import { Auth, UserIsAuth } from './services/auth/auth';
import { User, UserRole } from './services/user/user';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  userIsAuth: boolean = false;
  userRole: string = "";
  currentUrl: string = '';

  userNome = "";
  userEmail = "";

  constructor(private router: Router, private authService: Auth, private userService: User) {
    addIcons({
      logInSharp, logInOutline,
      albumsSharp, albumsOutline,
      buildSharp, buildOutline,
      checkboxSharp, checkboxOutline,
      keySharp, keyOutline,
      addSharp, addOutline,
      personSharp, personOutline
    });
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.validar();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
      this.validar();
    });
  }

  validar() {
    this.authService.user_auth().subscribe({
      next: (res: UserIsAuth) => {
        this.userIsAuth = res.auth;

        if (!this.userIsAuth) {
          localStorage.clear();
          this.router.navigate(['/folder/login']);
          return;
        }

        // Se autenticado, verifica a role
        this.userService.user_role().subscribe({
          next: (res: UserRole) => {
            this.userRole = res.role;

            // Mapeia role para lista de páginas
            const rolePagesMap: Record<string, { title: string, url: string }[]> = {
              Dono: this.donoPages,
              Gestor: this.gestorPages,
              Programador: this.programadorPages
            };

            const allowedPages = rolePagesMap[this.userRole] || [];
            const allowedRoutes = allowedPages.map(page => page.url);

            // Verifica se a URL atual está permitida
            const isAllowed = allowedRoutes.some(route => this.currentUrl.includes(route));

            if (!isAllowed) {
              // Redireciona para a primeira rota válida da role
              if (allowedRoutes.length > 0) {
                this.router.navigate([allowedRoutes[0]]);
              } else {
                // Caso a role não tenha páginas definidas, redireciona para login
                localStorage.clear();
                this.router.navigate(['/folder/login']);
              }
            }
          },
          error: () => {
            this.userRole = '';
            localStorage.clear();
            this.router.navigate(['/folder/login']);
          }
        });

        this.userService.user_data().subscribe({
          next: (res) => {
            this.userEmail = res.email;
            this.userNome = res.nome;
          } 
        })
      },
      error: () => {
        this.userIsAuth = false;
        localStorage.clear();
        this.router.navigate(['/folder/login']);
      }
    });

    console.clear();
  }

  public loginPages = [
    { title: 'Login', url: '/folder/login', icon: 'key' },
  ];

  public programadorPages = [
    { title: 'Por fazer', url: '/folder/programador-todo', icon: 'albums' },
    { title: 'A fazer', url: '/folder/programador-doing', icon: 'build' },
    { title: 'Terminado', url: '/folder/programador-finish', icon: 'checkbox' },
  ];

  public gestorPages = [
    { title: 'Por fazer', url: '/folder/gestor-todo', icon: 'albums' },
    { title: 'Utilizadores', url: '/folder/gestor-users', icon: 'person' },
  ];

  public donoPages = [
    { title: 'Gestores', url: '/folder/dono-gestores', icon: 'person' },
    { title: 'Programado', url: '/folder/dono-progador', icon: 'build' },
    { title: 'Tarefas', url: '/folder/dono-tarefas', icon: 'albums' },
  ]
}