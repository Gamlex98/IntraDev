
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { userModel } from 'src/app/models/user.model';
import { RolModel } from 'src/app/models/rol.model';
import { ContarUserModel } from 'src/app/models/contar.user';
import Swal from 'sweetalert2';
import { MD5 } from 'crypto-js';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {

  formularioRegister: FormGroup=new FormGroup({});
  listaRole: RolModel[]=[];
  listaDatosUser: userModel[]=[];
  roleUsuario: string ="";
  idUsuario: string ="";
  roleId:any ="";
  cantidadUser:any ="";

  selectedSede!: string;
  selectedRole !: string;

  constructor(  
    private formBuild: FormBuilder,
    private serviceSeguridad: SeguridadService,
    private router:Router
  ) { }

  
  ngOnInit(): void {
    this.ConstruccionFormulario();
  }

  ConstruccionFormulario(){
    this.formularioRegister=this.formBuild.group({
        user:["",[Validators.required,Validators.minLength(3)]],
        nombreCompleto:["",[Validators.required,Validators.minLength(3)]],
    });
}

CrearUsuario(){
  if(this.formularioRegister.invalid){
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: `Favor llenar todos los datos !!`,
      text: `Todos los campos son obligatorios...`,
      showConfirmButton: true,
      confirmButtonText: 'Entendido'
    });
  } else {
    let datos = new userModel();
    datos.usuario=this.formularioRegister.controls['user'].value;
    datos.nombreCompleto=this.formularioRegister.controls['nombreCompleto'].value;

    let password:string = datos.usuario+"1234";
    console.log("password: " + password);
    datos.password = MD5(password).toString();
    console.log("datos.password: " + datos.password);

    datos.sucursal= this.capturarSelectSede();
    datos.autorizado =  true;  //Cuando se crea automáticame se crea como autorizado
    this.roleUsuario =  this.capturarSelectRole();

    console.log("Sucursal: " +datos.sucursal );
    //

    //CONSULTA SI EL USUARIO YA EXISTE 

   this.serviceSeguridad.ConsultarCuentaUsuarioService(datos).subscribe({
        next:(contadorUser: ContarUserModel)=>{
        console.log("contadorUser: " + contadorUser.count);

      if(contadorUser.count > 0){
              console.log("Existe usuario");
              //muestra ventana modal
              Swal.fire({
                position: 'center',
                icon: 'error',
                title: `Usuario ya existe !!`,
                text: `Ya hay un usuario creado con estos datos...`,
                showConfirmButton: true,
                confirmButtonText: 'Entendido'
              });

              //Regresa al register
              this.router.navigate(['/register']);
              //return;//Regresa porque el usuario ya existe
            } else {
              console.log("No hay  usuario  y por eso se va a crear");

              //CREAR USER

                //Graba los datos del usuario salvo el Role
                this.serviceSeguridad.CrearUsuarioService(datos).subscribe({
                next: (data)=>{
                //console.log(data);
                    if(data){
                      this.idUsuario=data.id;
                      console.log("idUsuario: " + this.idUsuario)
                      // Graba el Role en la base de datos
                      console.log("datos.roles: " + this.roleUsuario );
                      this.RegistrarRoleUsuario(this.roleUsuario, this.idUsuario);
                      this.router.navigate(['./seguridad/register']);
                      }else{
                        Swal.fire({
                          position: 'center',
                          icon: 'error',
                          title: `Error en la creación del usuario !!`,
                          text: `Algo falló en la creación de usuario ...`,
                          showConfirmButton: true,
                          confirmButtonText: 'Entendido'
                        });
                        this.router.navigate(['./home']);
                      }
                      return;
                  },
                error:(e)=> console.log(e)
                });
              //FIN CREAR USER
            }
        },
        error:(e)=>{
          console.log(e);
          }   //error:(e)=>
        });
}
}

RegistrarRoleUsuario(role:string, idUsuario:string){
  //Grabael Role del usuario
  this.serviceSeguridad.CrearRoleUsuarioService(role, idUsuario).subscribe({
         next: (data)=>{
           console.log(data);
           if(data){
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: `Creación de usuario exitosa !!`,
              text: `El usuario ha sido creado correctamente`,
              showConfirmButton: true,
              confirmButtonText: 'Entendido'
            });
             //this.router.navigate(['home']);
             }else{
              Swal.fire({
                position: 'center',
                icon: 'error',
                title: `Error al crear el usuario !!`,
                text: `Algo falló en la creación de usuario-Role...`,
                showConfirmButton: true,
                confirmButtonText: 'Entendido'
              });
           }
         },
         error:(e)=> console.log(e)
         });

   }

capturarSelectSede(): string {
  const e = document.getElementById("idSelectSede") as HTMLSelectElement;
  const text = e.options[e.selectedIndex].text;
  return text;
}

capturarSelectRole(): string {
  const e = document.getElementById("idSelectRole") as HTMLSelectElement;
  const text = e.options[e.selectedIndex].text;
  return text;
}


}
