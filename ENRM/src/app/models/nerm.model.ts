class NERMModel {
    _id:string;
    email: String;
    date: Date;
    modelName: String;
    corpus: Object[];
    dictionary: Object[];

    constructor(
    ){
        this.email = ""
        this.modelName = ""
        this.corpus = [];
        this.dictionary = [];
        this.date = new Date()
    }
}

export default NERMModel;