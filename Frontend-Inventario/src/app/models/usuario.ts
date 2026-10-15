export class Usuario {

    constructor(

        public usuario_id: number,
        public rol_id: number,
        public nombre: string,
        public contrasena: string,
        public email: string | null

    ){}

}

export class UserPaylod{
    constructor(
        public id:number,
        public name:string,
        public role:number | null,
    ){}
}