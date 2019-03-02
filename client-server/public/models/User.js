class User {

    constructor(name, gender, birth, country, email, password, photo, admin){

        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();

    }

    get id(){
        return this._id;
    }

    get register(){
        return this._register;
    }

    get name(){
        return this._name;
    }

    get gender(){
        return this._gender;
    }

    get birth(){
        return this._birth;
    }

    get country(){
        return this._country;
    }

    get email(){
        return this._email;
    }

    get password(){
        return this._password;
    }

    get photo(){
        return this._photo;
    }

    get admin(){
        return this._admin ;
    }

    set photo(value){
        this._photo = value;
    }

    loadFromJSON(json){

        for(let name1 in json) {

            if(name1 == "_register") {
                this[name1] = new Date(json[name1]);
            }

            else {
                this[name1] = json[name1];
            }
        }

    }

    getNewID(){

        let usersID = parseInt(localStorage.getItem("usersID"));

        if(!usersID > 0 ) usersID = 0;

        usersID++;

        localStorage.setItem("usersID", usersID);

        return usersID;

    }

    static getUsersStorage(){

        let users = [];

        if(localStorage.getItem("users")) {

            users = JSON.parse(localStorage.getItem("users"));

        } 

        return users;

    }

    toJSON(){

        let json = {};

        //object.keys = le propriedas do objeto e transforma em array
        Object.keys(this).forEach(key => {

            console.log("olar", json[key], this[key]);

            if (this[key] != undefined) json[key] = this[key];

        });

        return json;

    }

    save(){

        return new Promise((resolve, reject) => {

            let promise;

            if (this.id) {

                promise = HttpRequest.put(`/users/${this.id}`, this.toJSON());

            } else {

                promise = HttpRequest.post(`/users`, this.toJSON());

            }

            promise.then(data => {

                this.loadFromJSON(data);

                resolve(this);

            }).catch(e => {

                reject(e);

            });

        });

    }

    remove(){

        let users = User.getUsersStorage();

        users.forEach((userdata, index)=>{

            if (this._id === userdata._id) {

                users.splice(index, 1);

            }

        });

        localStorage.setItem("users", JSON.stringify(users));   

    }

}