class UserService{
    constructor(UserRepo){
        this.UserRepo = UserRepo;
    }

    async CreateUser({username, role}){
        // some logic
        return this.UserRepo.CreateUser({username, role});
    }
    
    async GetUserByUID({uid}){
        // some logic
        return this.UserRepo.GetUserByUID({uid});
    }

    
}

module.exports = {UserService}