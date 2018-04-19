class NERMModel {
    _id:string;
    email: String;
    date: Date;
    projectName: String;
    corpus: Object[];
    dictionary: Object[];       // dicts have only on front-end
    selectedDict: Object[]

    constructor(
    ){
        this.email = ""
        this.projectName = ""
        this.corpus = [];
        this.dictionary = [];
        this.selectedDict = [];
        this.date = new Date()
    }
}

export default NERMModel;