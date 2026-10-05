export class Movimiento {

    constructor(

        public movimiento_id: number,
        public usuario_id: number,
        public proveedor_id: number | null,
        public tipo: string,
        public fecha: string

    ){}

}