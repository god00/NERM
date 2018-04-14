class NERMModel {
    _id:string;
    email: String;
    date: Date;
    modelName: String;
    corpus: Object[];
    dictionary: Object[];
    selectedDict: Object[]

    constructor(
    ){
        this.email = ""
        this.modelName = ""
        this.corpus = [];
        this.dictionary = [];
        this.selectedDict = [];
        this.date = new Date()
    }
}

export default NERMModel;