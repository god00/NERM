class NERM {
    _id:string;
    email: string;
    password: string;
    date: Date;

    constructor(
    ){
        this.email = ""
        this.password = ""
        this.date = new Date()
    }
}

export default NERM;