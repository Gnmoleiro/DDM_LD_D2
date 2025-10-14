import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logInSharp, logInOutline, albumsSharp, albumsOutline, buildSharp, buildOutline, checkboxSharp, checkboxOutline,
  keySharp, keyOutline, addSharp, addOutline, personSharp, personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  userIsAuth: boolean = false;
  userRole: string = "gestor"

  constructor() {
    addIcons({ logInSharp, logInOutline, 
      albumsSharp, albumsOutline, 
      buildSharp, buildOutline, 
      checkboxSharp, checkboxOutline,
      keySharp, keyOutline,
      addSharp, addOutline,
      personSharp, personOutline });
  }

  ngOnInit(): void {
  }

  public loginPages = [
    { title: 'Login', url: '/folder/login', icon: 'key' },
    { title: 'Register', url: '/folder/register', icon: 'add' },
  ];

  public programadorPages = [
    {title: 'Por fazer', url: '/folder/programador-todo', icon: 'albums'},
    {title: 'A fazer', url: '/folder/programador-doing', icon: 'build'},
    {title: 'Terminado', url: '/folder/programador-finish', icon: 'checkbox'},
  ]
  
  public gestorPages = [
    {title: 'Por fazer', url: '/folder/gestor-todo', icon: 'albums'},
    {title: 'Utilizadores', url: '/folder/gestor-users', icon: 'person'},
  ]
}