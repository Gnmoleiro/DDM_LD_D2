import { Component, OnInit } from '@angular/core';
import { Dono } from 'src/app/services/dono/dono';

@Component({
  selector: 'app-dono-editar-gestor',
  templateUrl: './dono-editar-gestor.component.html',
  styleUrls: ['./dono-editar-gestor.component.scss'],
})
export class DonoEditarGestorComponent  implements OnInit {

  constructor(private donoService: Dono) { }

  ngOnInit() {
    this.donoService.get_all_gestores().subscribe({
      next: (res) => {
        console.log(res)
      },
      error: (error) => {
        console.log(error.error.error)
      }
    })
  }

}
