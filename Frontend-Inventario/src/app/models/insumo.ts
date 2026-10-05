export class Insumo {

    constructor(

        public insumo_id: number,
        public nombre: string,
        public tipo: string,
        public cantidad: number,
        public categoria_id: number | null

    ){}

}