
class UserController {

    constructor(formIdCreate, formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();

    }

    onEdit(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate();
        });

        this.formUpdateEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex;
            
            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            //Object.assign =  copia o valor de atributos de um objeto
            //objetos a direita sobrecrevem os a esquerda
            //{} = novo objeto
            let result = Object.assign({}, userOld, values);         

            this.getPhoto(this.formUpdateEl).then((content)=>{

                if (!values.photo) {
                    result._photo = userOld._photo;
                } else {
                    result._photo = content;
                }

                let user = new User();

                user.loadFromJSON(result);

                user.save().then(user=>{

                    this.getTr(user, tr);

                    this.updateCount();
    
                    this.formUpdateEl.reset();
    
                    btn.disabled = false;
    
                    this.showPanelCreate();

                });


            }, (e)=>{

                console.error(e);

            });

        });

    }

    onSubmit(){

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formEl);

            if (!values) return false;

            this.getPhoto(this.formEl).then(
                (content) => {
                    
                    values.photo = content;

                    values.save().then(user => {

                        this.addLine(user);

                        this.formEl.reset();

                        btn.disabled = false;
                        
                    });

                }, 
                (e) => {
                    console.error(e);
                }
            );

        });

    }

    /*
    getPhoto(callback){

        let fileReader = new FileReader();

        //filter = gera um novo array só com os dados filtrados
        let elements = [...this.formEl.elements].filter(item=>{

            if(item.name === "photo") {
                return item;
            }

        });

        let file = elements[0].files[0];

        //quando arquivo terminar de ser lido
        fileReader.onload = ()=>{

            callback(fileReader.result);

        };

        fileReader.readAsDataURL(file);

    }
    */

   getPhoto(formEl){

        return new Promise((resolve, reject)=>{

            let fileReader = new FileReader();

            //filter = gera um novo array só com os dados filtrados
            let elements = [...formEl.elements].filter(item=>{
    
                if(item.name === "photo") {
                    return item;
                }
    
            });
    
            let file = elements[0].files[0];
    
            //quando arquivo terminar de ser lido
            fileReader.onload = ()=>{
    
                resolve(fileReader.result);
    
            };

            fileReader.onerror = (e) =>{

                reject(e);

            }
            
            if(file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve("dist/img/boxed-bg.jpg");
            }

        });


    }

    getValues(formEl){

        let user = {};
        let isValid = true;

        //.elements = percorre os elementos filhos

        [...formEl.elements].forEach(function(field, index){

            if (["name", "email", "password"].indexOf(field.name) > -1 && !field.value) {

                field.parentElement.classList.add("has-error");
                isValid = false;

            }

            if (field.name == "gender"){
                
                if(field.checked) user[field.name] = field.value;
    
            } else if(field.name == "admin"){

                user[field.name] = field.checked;

            } else {
    
                user[field.name] = field.value;
    
            }
    
        });

        if (!isValid) {
            return false;
        }
    
        return new User(
            user.name, 
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );
   

    }

    selectAll(){
        
        //let users = User.getUsersStorage();

        HttpRequest.get("/users").then(data => {

            data.users.forEach(dataUser=>{

                let user = new User();
    
                user.loadFromJSON(dataUser);
    
                this.addLine(user);
    
            });

        });

        /*
        let ajax = new XMLHttpRequest();

        ajax.open("GET", "/users");

        //onload = quando foi carregado
        ajax.onload = event => {

            //{} = objeto vazio
            let obj = { users: [] };

            try {

                //responseText = resposta enviada pelo Ajax
                obj = JSON.parse(ajax.responseText);

            } catch(e){

                console.error(e);

            }

            obj.users.forEach(dataUser=>{

                let user = new User();
    
                user.loadFromJSON(dataUser);
    
                this.addLine(user);
    
            });

        };

        //chama a solicitação ajax
        ajax.send();
        */

    }

    addLine(dataUser){

        console.log(dataUser);
        
        let tr = this.getTr(dataUser);
        
        this.tableEl.appendChild(tr);

        this.updateCount();
    
    }

    getTr(dataUser, tr = null){

        if (tr === null) tr = document.createElement("tr");

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `       
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin)? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        
        `;

        this.addEventsTr(tr);

        return tr;

    }

    addEventsTr(tr){

        tr.querySelector(".btn-delete").addEventListener("click", e =>{

            if(confirm("Deseja realmente excluir?")) {

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();

                tr.remove();

                this.updateCount();

            }

        });

        tr.querySelector(".btn-edit").addEventListener("click", e =>{

            //for in = laço para percorrer objetos
            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;
            

            for (let name in json) {

                console.log("oi", json, name);

                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");
                //continue = ignora o restante das intruções e avança
                if(field){

                    switch(field.type) {
                        case "file":
                            continue;
                            break;
                        case "radio":
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;
                            break;
                        case "checkbox":
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name]; 
                    }
                    
                }

            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();

        });

    }

    showPanelCreate(){

        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";

    }

    showPanelUpdate(){

        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";

    }

    updateCount(){

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr=>{

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if (user._admin) numberAdmin++;

        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;

    }


}